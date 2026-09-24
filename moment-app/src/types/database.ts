export type Profile = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export type Post = {
  id: string
  author_id: string
  parent_id: string | null
  content: string | null
  media_url: string | null
  media_type: 'image' | 'video' | 'none'
  like_count: number
  comment_count: number
  remix_count: number
  created_at: string
  // joined
  author?: Profile
  is_liked?: boolean
  children?: Post[] // for REMIX tree
}

export type Chat = {
  id: string
  type: 'direct' | 'group' | 'channel'
  name: string | null
  description: string | null
  avatar_url: string | null
  created_by: string | null
  created_at: string
}

export type Message = {
  id: string
  chat_id: string
  sender_id: string | null
  content: string | null
  media_url: string | null
  created_at: string
  sender?: Profile
}
