---
title: 基于 MyBatis Plus 的通用 CRUD 实现
date: "2024-11-22"
tags: ['MyBatisPlus','Java','数据库','ORM']
description: "通过泛型和 MyBatis Plus 的 IService 接口实现通用 CRUD 体系，提升开发效率，减少重复代码。"
---

## 1. 背景说明

Java 的泛型是 JDK 1.5 引入的一个特性，它允许我们定义具有通用性和类型安全性的代码。在实际开发中，很多模块的 CRUD（增删改查）操作非常类似。为了避免重复编码，我们可以结合泛型和 MyBatis Plus 提供的 IService 接口实现一个通用的 CRUD 体系。

通过这种方式，我们可以快速实现分页查询、模糊查询等功能，同时保持代码的可读性和扩展性。

## 2. 设计思路与实现步骤

我们将按以下步骤实现：

1. **封装查询条件**：抽象分页参数和模糊查询参数，统一接口入参
2. **定义通用 Service 接口**：在基础接口中实现 CRUD 的默认方法
3. **实现具体业务模块的 Service 接口和实现类**：复用基础接口的能力
4. **控制器开发**：通过依赖通用接口，快速实现具体业务的 API

以下逐步介绍实现细节和设计意图。

## 3. 具体实现与解读

### 3.1 封装查询条件

为了方便处理分页查询和模糊查询，我们设计了一个 `BaseQuery` 类，统一接收前端的分页参数和查询条件。

**代码实现：**

```java
@Data
public class BaseQuery<T> {
    /**
     * 模糊查询字段
     */
    private String blurry;

    /**
     * 分页 页码，默认值为1
     */
    private long page = 1;

    /**
     * 分页 每页大小，默认值为10
     */
    private long size = 10;

    /**
     * 内置的查询器
     */
    private final LambdaQueryWrapper<T> queryWrapper = Wrappers.lambdaQuery();

    /**
     * 获取分页对象
     * @return 分页对象
     */
    public Page<T> getPage() {
        return new Page<>(page, size);
    }

    /**
     * 获取查询条件
     * @return 查询条件
     */
    public LambdaQueryWrapper<T> getWrapper() {
        if (blurry != null) {
            queryWrapper.like("name", blurry); // 示例模糊查询：匹配 "name" 字段
        }
        return queryWrapper;
    }
}
```

**设计意图：**

- **分页支持**：通过 `Page<T>` 对象封装分页参数（page 和 size），可以直接用于 MyBatis Plus 的分页查询
- **模糊查询支持**：通过 `LambdaQueryWrapper` 封装模糊查询条件，例如按字段 name 模糊匹配
- **灵活扩展**：用户可自行调整模糊查询字段或添加其他条件

**使用场景：**

前端传递如下参数：

```json
{
  "blurry": "张三",
  "page": 1,
  "size": 10
}
```

后台可以直接通过 `BaseQuery` 类快速生成分页对象和查询条件。

### 3.2 通用 Service 接口

`IBaseService` 是一个基础接口，继承自 MyBatis Plus 的 `IService`。通过泛型和接口的默认方法，我们封装了常用的 CRUD 操作。

**代码实现：**

```java
public interface IBaseService<T> extends IService<T> {

    /**
     * 分页查询
     * @param query 查询条件
     * @return 数据分页结果
     */
    default Ps<T> list(BaseQuery<T> query) {
        return Ps.ok(this.page(query.getPage(), query.getWrapper()));
    }

    /**
     * 添加数据
     * @param t 数据实体
     */
    default void add(T t) {
        this.save(t);
    }

    /**
     * 编辑数据
     * @param t 数据实体
     */
    default void edit(T t) {
        this.updateById(t);
    }

    /**
     * 批量删除
     * @param ids 数据 ID 集合
     */
    default void del(Set<Long> ids) {
        this.removeByIds(ids);
    }
}
```

**设计意图：**

- **通用性**：通过泛型 T，可以让接口适配任何实体类型，如 User、Product 等
- **减少重复编码**：将 CRUD 的实现逻辑放在默认方法中，子类无需重复实现
- **扩展性**：如果某个业务模块需要特殊的逻辑，可以在子类中重写这些默认方法

**核心方法解析：**

- `list`：分页 + 条件查询，直接返回封装的分页结果
- `add`：保存单条数据
- `edit`：根据主键更新数据
- `del`：根据 ID 集合批量删除

### 3.3 业务模块的 Service

**接口定义：**

业务模块的接口只需要继承 `IBaseService<T>` 即可。

```java
public interface UserService extends IBaseService<User> {
}
```

**实现类：**

实现类继承 `BaseService` 并添加事务支持。

```java
@Service
@Transactional
public class UserServiceImpl extends BaseService<User, UserMapper> implements UserService {
}
```

### 3.4 控制器开发

控制器通过注入 `UserService`，调用通用接口的方法实现 CRUD 操作。

**代码实现：**

```java
@RestController
@RequestMapping(path = "/user")
public class UserController extends BaseController<UserService> {

    @GetMapping
    public Ps<User> list(BaseQuery<User> query) {
        return baseService.list(query);
    }

    @PostMapping
    public void add(@RequestBody User user) {
        baseService.add(user);
    }

    @PutMapping
    public void edit(@RequestBody User user) {
        baseService.edit(user);
    }

    @DeleteMapping
    public void del(@RequestBody Set<Long> ids) {
        baseService.del(ids);
    }
}
```

## 4. 总结与扩展

### 优势分析

- **高复用性**：抽象通用 CRUD 功能，大幅减少重复代码
- **灵活性**：支持分页、模糊查询等功能，适配不同业务需求
- **扩展性**：可在子类中重写通用接口的方法，满足个性化需求

### 扩展方向

- **多条件查询**：增加动态条件解析功能，如根据多个字段模糊查询
- **权限控制**：在 Service 层引入基于用户角色的权限校验逻辑
- **返回值封装**：结合自定义的响应类（如 `Ps<T>`）进一步规范返回格式

通过这种方式，我们既提升了开发效率，又确保了代码的简洁性和可维护性。希望这篇文章能对你有所帮助！
