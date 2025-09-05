---
title: 使用注解处理器自动生成 Dao 代码
date: "2021-06-24"
tags: ['Java','注解处理器','MyBatisPlus']
---

## 背景介绍

在我们一般的 SpringBoot 项目中，由于使用了 MybatisPlus 或者 JPA，很多增删改查都是定一个空的 Mapper 或者 Dao 就可以实现的。这里比较懒，参考 Lombok 的原理实现自动生成 Dao 代码。

## 核心思路

通过注解处理器（Annotation Processor）在编译时自动生成 Dao 接口，避免手动创建重复的代码。

## 项目结构

注解处理器的项目必须是单独的一个项目，我们需要创建一个 Maven 项目。

## 实现步骤

### 1. 创建 Maven 项目

首先创建一个独立的 Maven 项目用于注解处理器。

### 2. 添加依赖

在 `pom.xml` 中添加 Google 的 auto-service 类库：

```xml
<dependency>
    <groupId>com.google.auto.service</groupId>
    <artifactId>auto-service</artifactId>
    <version>1.0.1</version>
</dependency>
```

### 3. 定义注解

```java
package com.yuxuan66.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * @author Sir丶雨轩
 * @since 2021/6/24
 */
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.CLASS)
public @interface Dao {

}
```

### 4. 实现注解处理器

```java
package com.yuxuan66.processor;

import cn.hutool.core.date.DateUtil;
import cn.hutool.core.io.IoUtil;
import com.google.auto.service.AutoService;
import com.google.common.primitives.Chars;
import com.yuxuan66.annotation.Dao;
import org.beetl.core.Configuration;
import org.beetl.core.GroupTemplate;
import org.beetl.core.Template;
import org.beetl.core.resource.ClasspathResourceLoader;
import org.beetl.core.resource.StringTemplateResourceLoader;
import sun.nio.ch.IOUtil;

import javax.annotation.processing.*;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.ElementKind;
import javax.lang.model.element.TypeElement;
import javax.lang.model.util.Elements;
import javax.lang.model.util.Types;
import javax.tools.Diagnostic;
import javax.tools.JavaFileObject;
import java.io.IOException;
import java.io.InputStream;
import java.io.Writer;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.Set;

/**
 * @author Sir丶雨轩
 * @since 2021/6/24
 */
@AutoService(Processor.class)
public class DaoProcessor extends AbstractProcessor {

    private Types mTypeUtils;
    private Elements mElementUtils;
    private Filer mFiler;
    private Messager messager;

    @Override
    public Set<String> getSupportedAnnotationTypes() {
        Set<String> annotations = new LinkedHashSet<>();
        //把我们自己定义的注解添加进去
        annotations.add(Dao.class.getCanonicalName());
        return annotations;
    }

    @Override
    public SourceVersion getSupportedSourceVersion() {
        return SourceVersion.latestSupported();
    }

    @Override
    public synchronized void init(ProcessingEnvironment processingEnv) {
        super.init(processingEnv);

        mTypeUtils = processingEnv.getTypeUtils();
        mElementUtils = processingEnv.getElementUtils();
        mFiler = processingEnv.getFiler();
        messager = processingEnv.getMessager();
    }
    
    private void error(Element e, String msg, Object... args) {
        messager.printMessage(Diagnostic.Kind.ERROR, String.format(msg, args), e);
    }
    
    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
        for (Element annotatedElement : roundEnv.getElementsAnnotatedWith(Dao.class)) {
            if (annotatedElement.getKind() != ElementKind.CLASS) {
                error(annotatedElement, "Only classes can be annotated with @%s", Dao.class.getSimpleName());
                return true;
            }
            // //解析，并生成代码
            try {
                analysisAnnotated(annotatedElement);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return false;
    }

    private void analysisAnnotated(Element classElement) throws IOException {
        Dao annotation = classElement.getAnnotation(Dao.class);

        InputStream inputStream = this.getClass().getResourceAsStream("/template/Dao.btl");

        String daoContent = IoUtil.read(Objects.requireNonNull(inputStream), StandardCharsets.UTF_8);
        // 获取注解所在的包，把Dao生成到原始包中，或者按照需求生成在对应的包中
        String packageName = mElementUtils.getPackageOf(classElement).getQualifiedName().toString();

        daoContent = daoContent.replaceAll("#date", DateUtil.format(new Date(),"yyyy/MM/dd"));
        daoContent = daoContent.replaceAll("#package",packageName);
        daoContent = daoContent.replaceAll("#className",classElement.getSimpleName().toString());

        try {
            JavaFileObject source = mFiler.createSourceFile(packageName + "." + classElement.getSimpleName() + "Dao");
            Writer writer = source.openWriter();
            writer.write(daoContent);
            writer.flush();
            writer.close();
        } catch (IOException ignored) {
        }
    }
}
```

### 5. 创建模板文件

在 `src/main/resources/template/` 目录下创建 `Dao.btl` 模板文件：

```java
package #package;

import #package.#className;
import com.yuxuan66.support.basic.jpa.BasicDao;

/**
 * @author  Sir丶雨轩
 * @since #date
 */
public interface #classNameDao extends BasicDao<#className> {

}
```

## 核心原理

### AutoService 注解

```java
@AutoService(Processor.class)
final class MyProcessor implements Processor {
  // …
}
```

`@AutoService` 会自动在 `build/classes` 输入目录下生成文件 `META-INF/services/javax.annotation.processing.Processor`，文件的内容如下：

```
foo.bar.MyProcessor
```

在 `javax.annotation.processing.Processor` 的情况下，如果一个 jar 中包含 metadata 文件，并且在 javac 的 classpath 下，javac 会自动加载这个 jar，同时包含它的普通注解编译环境。

### 注解处理器工作流程

1. **编译时扫描**：javac 在编译时扫描带有 `@Dao` 注解的类
2. **代码生成**：处理器读取模板文件，替换占位符
3. **文件输出**：生成对应的 Dao 接口文件
4. **自动编译**：生成的代码会被自动编译

## 使用方式

### 1. 在实体类上添加注解

```java
package com.example.entity;

import com.yuxuan66.annotation.Dao;

/**
 * 用户实体类
 */
@Dao
public class User {
    private Long id;
    private String name;
    private String email;
    
    // getter/setter 方法...
}
```

### 2. 编译项目

```bash
mvn clean compile
```

### 3. 查看生成的代码

编译后会在 `target/generated-sources/annotations` 目录下生成对应的 Dao 接口：

```java
package com.example.entity;

import com.example.entity.User;
import com.yuxuan66.support.basic.jpa.BasicDao;

/**
 * @author  Sir丶雨轩
 * @since 2024/11/22
 */
public interface UserDao extends BasicDao<User> {

}
```

## 高级用法

### 1. 自定义模板

可以根据不同的需求创建不同的模板：

```java
// 模板文件：Dao.btl
package #package;

import #package.#className;
import com.yuxuan66.support.basic.jpa.BasicDao;
import org.springframework.stereotype.Repository;

/**
 * @author  Sir丶雨轩
 * @since #date
 */
@Repository
public interface #classNameDao extends BasicDao<#className> {

}
```

### 2. 支持复杂模板

对于复杂的需求，可以使用模板引擎（如 Beetl）：

```java
// 使用 Beetl 模板引擎
StringTemplateResourceLoader resourceLoader = new StringTemplateResourceLoader();
Configuration cfg = Configuration.defaultConfiguration();
GroupTemplate gt = new GroupTemplate(resourceLoader, cfg);

Template template = gt.getTemplate(daoContent);
template.binding("packageName", packageName);
template.binding("className", className);
template.binding("date", DateUtil.format(new Date(),"yyyy/MM/dd"));

String result = template.render();
```

### 3. 多模板支持

```java
private void analysisAnnotated(Element classElement) throws IOException {
    Dao annotation = classElement.getAnnotation(Dao.class);
    
    // 根据注解参数选择不同模板
    String templateName = annotation.template().isEmpty() ? "Dao.btl" : annotation.template();
    InputStream inputStream = this.getClass().getResourceAsStream("/template/" + templateName);
    
    // 处理模板...
}
```

## 项目集成

### 1. 发布到 Maven 仓库

```xml
<distributionManagement>
    <repository>
        <id>releases</id>
        <url>http://your-nexus/repository/maven-releases/</url>
    </repository>
</distributionManagement>
```

### 2. 在其他项目中使用

```xml
<dependency>
    <groupId>com.yuxuan66</groupId>
    <artifactId>dao-generator</artifactId>
    <version>1.0.0</version>
    <scope>provided</scope>
</dependency>
```

### 3. 配置编译插件

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.8.1</version>
    <configuration>
        <source>8</source>
        <target>8</target>
        <annotationProcessorPaths>
            <path>
                <groupId>com.yuxuan66</groupId>
                <artifactId>dao-generator</artifactId>
                <version>1.0.0</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

## 优势特点

### 1. 减少重复代码

- **自动化生成**：无需手动创建重复的 Dao 接口
- **一致性保证**：生成的代码格式统一，减少人为错误

### 2. 提升开发效率

- **快速开发**：添加注解即可自动生成代码
- **维护简单**：模板修改后重新编译即可

### 3. 灵活可扩展

- **模板化**：支持自定义模板
- **可配置**：支持多种生成策略

## 注意事项

### 1. 编译顺序

- 注解处理器项目需要先编译
- 使用项目需要正确配置依赖

### 2. 模板路径

- 确保模板文件在正确的 classpath 路径下
- 模板文件编码使用 UTF-8

### 3. 错误处理

- 添加适当的错误处理和日志记录
- 处理模板文件不存在的情况

## 总结

通过注解处理器自动生成 Dao 代码，我们成功实现了：

1. **减少重复编码**：避免手动创建重复的 Dao 接口
2. **提升开发效率**：添加注解即可自动生成代码
3. **保持代码一致性**：生成的代码格式统一
4. **易于维护**：模板化设计，便于修改和扩展

这种方案参考了 Lombok 的设计思路，在编译时自动生成代码，既保证了开发效率，又避免了运行时的性能开销。生成的 Dao 代码就像自己创建的一样，也可以被 Spring 管理，完美集成到现有的开发流程中。
