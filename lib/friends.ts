import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Friend, FriendsConfig } from "@/types/friends"

const friendsDirectory = path.join(process.cwd(), 'content/friends');

export async function getAllFriends(): Promise<Friend[]> {
  const fileNames = fs.readdirSync(friendsDirectory);
  const allFriends = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      const fullPath = path.join(friendsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);
      
      return {
        name: data.name || '',
        url: data.url || '',
        description: data.description || ''
      } as Friend;
    })
    .filter(friend => friend.name && friend.url); // 过滤掉无效的友链

  return allFriends;
}

// 根据状态筛选友链
export function getFriendsByStatus(friends: Friend[], status: Friend['status']): Friend[] {
  return friends.filter(friend => friend.status === status)
}

// 根据标签筛选友链
export function getFriendsByTag(friends: Friend[], tag: string): Friend[] {
  return friends.filter(friend => friend.tags?.includes(tag))
}

// 获取所有标签
export function getAllFriendTags(friends: Friend[]): string[] {
  const tags = friends.flatMap(friend => friend.tags || [])
  return Array.from(new Set(tags)).sort()
}
