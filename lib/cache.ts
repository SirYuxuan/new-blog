import { cache } from 'react'

// 创建一个简单的内存缓存
const cache = new Map<string, any>();

export async function getCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 默认缓存5分钟
): Promise<T> {
  const cached = cache.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < ttl) {
    return cached.data;
  }

  const data = await fetchFn();
  cache.set(key, {
    data,
    timestamp: now
  });

  return data;
}

// 清除特定键的缓存
export function clearCache(key: string) {
  cache.delete(key);
}

// 清除所有缓存
export function clearAllCache() {
  cache.clear();
}

// 预加载数据
export async function preloadData() {
  // 这里可以添加需要预加载的数据
  return Promise.all([
    // 添加你的预加载数据获取函数
  ])
} 