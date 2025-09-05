---
title: 多线程下 HashMap 的线程安全问题深度解析
date: "2022-12-29"
tags: ['Java','多线程']
---


> 阅读本文章，最好有基础的多线程知识，确保你能看懂文章所表达的意思。

## 问题描述

我们创建一个类，在类中维护一个 HashMap（非线程安全，不要扛为什么不用 ConcurrentHashMap，那不在本文的导论范围内）。

然后我们开启多个线程对这个 Map 的 2 个 Key，分别为 A、B，我们从 Map 中取出 value 进行 +1 的操作再放回去。

在线程不安全的情况下，这个 Map 里两个 Key 对应的 Value 大概率是跟我们操作的次数不相同。

## 代码实现

我们先来代码操作：

```java
package com.yuxuan66.demo;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * @author Sir丶雨轩
 * @since 2022/12/29
 */
public class LockTest {

    public static class DoSomething{

        private final Map<String, Integer> countMap = new ConcurrentHashMap<>();
        private final Lock lockA = new ReentrantLock();
        private final Lock lockB = new ReentrantLock();

        public void some(String key) {
            int integer = countMap.getOrDefault(key, 0);
            countMap.put(key, integer + 1);
        }

        public synchronized void print() {
            System.out.println(countMap);
            // TODO 注意 我们在这里判断了理想值是否跟真实的结果一致
            if (countMap.get("A") != 5000 || countMap.get("B") != 5000) {
                System.out.println("error");
                System.exit(0);
            }
        }
    }

    public static class Run implements Runnable{
        private final DoSomething doSomething;
        private final String key;

        public Run(DoSomething doSomething, String key) {
            this.doSomething = doSomething;
            this.key = key;
        }

        @Override
        public void run() {
            for (int i = 0; i < 100; i++) {
                doSomething.some(key);
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        // 由于要展示的问题不一定稳定复现，所以我们开启多次循环，在重复校验我们的代码
        for (int j = 0; j < 10000; j++) {
            DoSomething doSomething = new DoSomething();
            Thread[] threads = new Thread[100];
            for (int i = 0; i < 100; i += 2) {
                threads[i] = new Thread(new Run(doSomething, "A"));
                threads[i + 1] = new Thread(new Run(doSomething, "B"));
            }
            for (int i = 0; i < 100; i++) {
                threads[i].start();
            }
            for (int i = 0; i < 100; i++) {
                threads[i].join();
            }
            doSomething.print();
        }
    }
}
```

在上面代码中，我们展示了在完全不考虑线程安全的情况下，每一次运行都会直接结束掉。

## 解决方案对比

### 方案一：使用 synchronized

```java
public void some(String key) {
    synchronized (countMap){
        int integer = countMap.getOrDefault(key, 0);
        countMap.put(key, integer + 1);
    }
}
```

这时我们会发现，运行的结果始终如一的跟我们预想的一样。

### 方案二：使用 ReentrantLock（同一把锁）

首先我们尝试在对这个 Map 每次操作时都使用同一把锁：

```java
public void some(String key) {
    Lock lock = lockA;
    lock.lock();
    try{
        int integer = countMap.getOrDefault(key, 0);
        countMap.put(key, integer + 1);
    }finally {
        lock.unlock();
    }
}
```

这是我们发现运行的结果跟 synchronized 是没有区别的，都是正确的。

### 方案三：使用 ReentrantLock（不同锁）- 问题所在

下面到了本文所描述的重点。当我们对 Map 的两个 Key 分别使用不同的锁，这个可能在一定的环境下也是有使用场景的，比如对应的锁可能会被其他对象所控制。

这里就简单模拟一下，对两个 Key 分别使用两把不同的锁：

```java
public void some(String key) {
    Lock lock = "A".equals(key) ? lockA : lockB;
    lock.lock();
    try {
        int integer = countMap.getOrDefault(key, 0);
        countMap.put(key, integer + 1);
    } finally {
        lock.unlock();
    }
}
```

这个时候我们在运行就会发现结果错误了。

## 问题分析

这个时候大家可以想一下为什么会出现这个情况呢？对 Map 的操作明明都在 lock 的代码内。我们对于每一个 key 的操作都是独立的锁，理论来说是不会冲突的。

其实这个问题还真就跟锁没什么关系，让我们来打开 HashMap 的源码（1.8 环境下）的第 397 行：

```java
/**
 * The table, initialized on first use, and resized as
 * necessary. When allocated, length is always a power of two.
 * (We also tolerate length zero in some operations to allow
 * bootstrapping mechanics that are currently not needed.)
 */
transient Node<K,V>[] table;
```

我们可以发现注释写的很清楚，这个存放着 Map 数据的 table 数组会在第一次使用的时候初始化，并非在 new HashMap 的时候完成。

我们也可以打开源码的第 630 行，这里在 table == null 的时候去调用了一个方法 resize：

```java
final Node<K,V>[] resize() {
    Node<K,V>[] oldTab = table;
    int oldCap = (oldCap = oldTab.length) == 0 ? 0 : oldTab.length;
    int oldThr = threshold;
    int newCap, newThr = 0;
    if (oldCap > 0) {
        if (oldCap >= MAXIMUM_CAPACITY) {
            threshold = Integer.MAX_VALUE;
            return oldTab;
        }
        else if ((newCap = oldCap << 1) < MAXIMUM_CAPACITY &&
                 oldCap >= DEFAULT_INITIAL_CAPACITY)
            newThr = oldThr << 1; // double threshold
    }
    else if (oldThr > 0) // initial capacity was placed in threshold
        newCap = oldThr;
    else {               // zero initial threshold using defaults
        newCap = DEFAULT_INITIAL_CAPACITY;
        newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);
    }
    if (newThr == 0) {
        float ft = (float)newCap * loadFactor;
        newThr = (newCap < MAXIMUM_CAPACITY && ft < (float)MAXIMUM_CAPACITY ?
                  (int)ft : Integer.MAX_VALUE);
    }
    threshold = newThr;
    @SuppressWarnings({"rawtypes","unchecked"})
    Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
    table = newTab;
    // ... 后续代码
}
```

我们可以看到，table 在这里进行了初始化，也就是第一次赋值的时候完成。

## 验证问题

那么接下来我们使用代码来验证一下：

```java
public void some(String key) {
    Lock lock = "A".equals(key) ? lockA : lockB;
    lock.lock();
    try {
        Field field = HashMap.class.getDeclaredField("table");
        field.setAccessible(true);
        System.out.println("table = " + field.get(countMap));
        // 直接结束掉程序，避免日志过多无法看到输出
        System.exit(0);
        int integer = countMap.getOrDefault(key, 0);
        countMap.put(key, integer + 1);
    } catch (Exception e) {
        e.printStackTrace();
    } finally {
        lock.unlock();
    }
}
```

## 根本原因

到此我们就弄明白了这次的问题，由于两个 Key 的两把锁同时进入了 resize 方法：

1. **thread-0** 初始化 → putVal
2. **thread-1** 初始化（这个时候覆盖掉了 thread-0 put 的 val）→ putVal

所以就会导致我们看到的结果总是会少 1。

## 总结

### 问题核心

这个问题的根本原因在于：

1. **HashMap 的懒加载机制**：table 数组在第一次使用时才初始化
2. **resize 操作的线程不安全**：多个线程同时触发 resize 时会发生数据覆盖
3. **锁粒度问题**：即使为不同 key 使用不同锁，也无法解决 HashMap 内部的线程安全问题

### 解决方案

1. **使用 ConcurrentHashMap**：专门为并发场景设计
2. **对整个 Map 操作加锁**：确保整个操作过程的同步性
3. **使用 Collections.synchronizedMap()**：包装 HashMap 使其线程安全

### 经验教训

- 多线程环境下，即使使用了锁，也要考虑被保护对象的内部实现
- HashMap 不是线程安全的，在高并发场景下应使用 ConcurrentHashMap
- 锁的粒度要合理，不能只保护部分操作而忽略对象内部的线程安全问题

才疏学浅，如果错误还望指教。
