"use client"

import { Friend } from "@/types/friends"

type FriendsContentProps = {
  initialFriends: Friend[]
}

export function FriendsContent({ initialFriends }: FriendsContentProps) {
  const friends = initialFriends

  return (
    <div className="space-y-6">
      {/* 友链列表 */}
      <div className="space-y-3">
        {friends.length > 0 ? (
          friends.map((friend) => (
            <div key={friend.name} className="group">
              <a
                href={friend.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                  {friend.name}
                </h3>
                {friend.description && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    {friend.description}
                  </p>
                )}
              </a>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-zinc-500 dark:text-zinc-400">暂无友链</p>
          </div>
        )}
      </div>

      {/* 申请友链说明 */}
      <div className="mt-8 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">申请友链</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
          如果你也想交换友链，欢迎通过以下方式联系我
        </p>
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          <p>• 邮箱：dev@oofo.cc</p>
        </div>
      </div>
    </div>
  )
}
