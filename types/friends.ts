export interface Friend {
  name: string
  url: string
  description?: string
}

export interface FriendsConfig {
  title: string
  description?: string
  totalCount: number
  activeCount: number
  categories?: string[]
}
