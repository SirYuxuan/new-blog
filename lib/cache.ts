import { cache } from 'react'

export const getCachedData = cache(async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  revalidate = 3600 // 默认缓存1小时
): Promise<T> => {
  try {
    const response = await fetchFn()
    return response
  } catch (error) {
    console.error(`Error fetching data for key ${key}:`, error)
    throw error
  }
})

// 预加载数据
export async function preloadData() {
  // 这里可以添加需要预加载的数据
  return Promise.all([
    // 添加你的预加载数据获取函数
  ])
} 