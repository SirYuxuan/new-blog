---
title: SpringBoot 自定义参数解析器实现全局参数RSA加密
date: "2021-06-23"
tags: ['SpringBoot','参数解析器']
---

## 前端加密实现

首先前端这边使用 Vue 全局封装 axios 使所有请求的参数进行 RSA 加密：

```javascript
const instance = axios.create({
  baseURL,
  timeout: requestTimeout,
  headers: {
    'Content-Type': contentType,
  },
})

instance.interceptors.request.use(
  (config) => {
    if (
      config.data &&
      config.headers['Content-Type'] ===
        'application/x-www-form-urlencoded;charset=UTF-8'
    ) {
      config.data = qs.stringify(config.data)
    } else {
      encryptedStr(JSON.stringify(config.data)).then((res) => {
        config.data = res
      })
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
```

## 核心问题分析

由于请求的数据是通过 body 的形式传递的，所以我们需要在参数解析器中获取到加密后的数据。但是我们知道 Request IO 流是只能读取一次的，为了避免我们在读取后导致别的拦截器或框架无法读取，所以我们要先解决这个问题。

### 为什么 HttpServletRequest 的流只能读取一次？

调用 `httpServletRequest.getInputStream()` 可以看到获取的流类型为 `ServletInputStream`，继承 `InputStream`。

下面复习下 `InputStream`，`InputStream` 的 `read` 方法内部有一个 `position`，标志当前流读取到的位置，每读取一次，位置就会移动一次，如果读到最后，`read()` 会返回 -1，标志已经读取完了。如果想要重新读取则需要重写 `reset()` 方法，当然能否 reset 是有条件的，它取决于 `markSupported()` 是否返回 true。

在 `InputStream` 源码中默认不实现 `reset()`，并且 `markSupported()` 默认返回 false：

```java
public synchronized void reset() throws IOException {
    // 调用重新读取则抛出异常
    throw new IOException("mark/reset not supported");
}

public boolean markSupported() {
    // 不支持重新读取
    return false;
}
```

而查看 `ServletInputStream` 源码可以发现，该类没有重写 `mark()`、`reset()` 以及 `markSupported()`，因此 Request IO 流无法重复读取：

```java
public abstract class ServletInputStream extends InputStream {
    protected ServletInputStream() {
    }

    public int readLine(byte[] b, int off, int len) throws IOException {
        if (len <= 0) {
            return 0;
        } else {
            int count = 0;
            int c;
            while((c = this.read()) != -1) {
                b[off++] = (byte)c;
                ++count;
                if (c == 10 || count == len) {
                    break;
                }
            }
            return count > 0 ? count : -1;
        }
    }

    public abstract boolean isFinished();
    public abstract boolean isReady();
    public abstract void setReadListener(ReadListener var1);
}
```

## 解决方案

### 使用 HttpServletRequestWrapper

既然 `ServletInputStream` 不支持重新读写，那么为什么不把流读出来后用容器存储起来，后面就可以多次利用了。

所幸 Java 提供了一个请求包装器：`HttpServletRequestWrapper` 基于装饰者模式实现了 `HttpServletRequest` 接口，只需要继承该类并实现你想要重新定义的方法即可。

### 定义包装器

```java
package com.yuxuan66.support.request;

import org.apache.tomcat.util.http.fileupload.IOUtils;

import javax.servlet.ReadListener;
import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import java.io.*;

/**
 * @author Sir丶雨轩
 * @since 2021/6/23
 */
public class RequestWrapper extends HttpServletRequestWrapper {

    /**
     * 参数字节数组
     */
    private byte[] requestBody;

    /**
     * Http请求对象
     */
    private final HttpServletRequest request;

    public RequestWrapper(HttpServletRequest request) throws IOException {
        super(request);
        this.request = request;
    }

    @Override
    public ServletInputStream getInputStream() throws IOException {
        /**
         * 每次调用此方法时将数据流中的数据读取出来，然后再回填到InputStream之中
         * 解决通过@RequestBody和@RequestParam（POST方式）读取一次后控制器拿不到参数问题
         */
        if (null == this.requestBody) {
            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            IOUtils.copy(request.getInputStream(), byteArrayOutputStream);
            this.requestBody = byteArrayOutputStream.toByteArray();
        }

        final ByteArrayInputStream byteArrayInputStream = new ByteArrayInputStream(requestBody);
        return new ServletInputStream() {

            @Override
            public boolean isFinished() {
                return false;
            }

            @Override
            public boolean isReady() {
                return false;
            }

            @Override
            public void setReadListener(ReadListener listener) {

            }

            @Override
            public int read() {
                return byteArrayInputStream.read();
            }
        };
    }

    @Override
    public BufferedReader getReader() throws IOException {
        return new BufferedReader(new InputStreamReader(this.getInputStream()));
    }
}
```

### 定义过滤器

```java
package com.yuxuan66.support.request;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

/**
 * @author Sir丶雨轩
 * @since 2021/6/23
 */
@WebFilter(filterName = "channelFilter", urlPatterns = "/*")
public class ChannelFilter implements Filter {
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        try {
            ServletRequest requestWrapper = null;
            if (servletRequest instanceof HttpServletRequest) {
                requestWrapper = new RequestWrapper((HttpServletRequest) servletRequest);
            }
            if (requestWrapper == null) {
                filterChain.doFilter(servletRequest, servletResponse);
            } else {
                filterChain.doFilter(requestWrapper, servletResponse);
            }
        } catch (IOException | ServletException e) {
            e.printStackTrace();
        }
    }
}
```

## 注解和基础实体类

### 定义注解

```java
package com.yuxuan66.support.argument.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * @author Sir丶雨轩
 * @since 2021/6/23
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface RsaParam {
}
```

### 定义基础实体类

```java
package com.yuxuan66.support.basic.model;

/**
 * @author Sir丶雨轩
 * @since 2021/6/23
 */
public class BasicParam {
}
```

## 核心参数解析器

```java
package com.yuxuan66.support.argument;

import cn.hutool.crypto.asymmetric.KeyType;
import cn.hutool.crypto.asymmetric.RSA;
import cn.hutool.json.JSONUtil;
import com.yuxuan66.config.RsaProperties;
import com.yuxuan66.support.argument.annotation.RsaParam;
import com.yuxuan66.support.basic.model.BasicParam;
import org.springframework.core.MethodParameter;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import javax.servlet.http.HttpServletRequest;
import java.io.BufferedReader;
import java.util.Objects;

/**
 * @author Sir丶雨轩
 * @since 2021/6/23
 */
public class ParamArgumentResolvers implements HandlerMethodArgumentResolver {

    // 是否满足条件，这里我们判断，参数包含注解或者继承与我们基础实体的
    @Override
    public boolean supportsParameter(MethodParameter methodParameter) {
        return methodParameter.getParameter().isAnnotationPresent(RsaParam.class) || BasicParam.class.isAssignableFrom(methodParameter.getParameterType());
    }

    @Override
    public Object resolveArgument(MethodParameter methodParameter, ModelAndViewContainer modelAndViewContainer, NativeWebRequest nativeWebRequest, WebDataBinderFactory webDataBinderFactory) throws Exception {
        HttpServletRequest request = nativeWebRequest.getNativeRequest(HttpServletRequest.class);
        StringBuilder data = new StringBuilder();
        String line;
        BufferedReader reader = Objects.requireNonNull(request).getReader();
        while (null != (line = reader.readLine())) {
            data.append(line);
        }
        // 读取数据解密转为Bean
        RSA rsa = new RSA(RsaProperties.privateKey, null);
        return JSONUtil.toBean(rsa.decryptStr(data.toString(), KeyType.PrivateKey), methodParameter.getParameterType());
    }
}
```

## 配置参数解析器

```java
package com.yuxuan66.config;

import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.util.List;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import com.yuxuan66.support.argument.ParamArgumentResolvers;
import org.springframework.context.annotation.Configuration;

/**
 * 系统核心配置类
 * @author Sir丶雨轩
 * @since 2021/06/17
 */
@Configuration
public class AdminConfig implements WebMvcConfigurer {

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(new ParamArgumentResolvers());
    }
}
```

## 使用方式

使用的时候我们只需要加上注解或者继承 `BasicParam` 即可自动解密：

```java
@PostMapping(path = "/login")
public RespEntity login(@RsaParam LoginParam loginParam) {
    return authService.login(loginParam);
}
```

## 实现原理总结

1. **前端加密**：使用 Vue 的 axios 拦截器对所有请求参数进行 RSA 加密
2. **流重复读取**：通过 `HttpServletRequestWrapper` 解决 Request IO 流只能读取一次的问题
3. **参数解析**：自定义 `HandlerMethodArgumentResolver` 实现参数的自动解密
4. **注解标识**：使用 `@RsaParam` 注解标识需要解密的参数
5. **自动转换**：将解密后的 JSON 字符串自动转换为对应的 Java 对象

通过这种方式，我们实现了全局请求参数的 RSA 加密解密功能，既保证了数据的安全性，又保持了代码的简洁性。
