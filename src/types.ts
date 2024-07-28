export interface ChannelData {
  name: string
  memory: number
  channelId: string
  mod: string
  voice: string
  systemContent: string
  image: boolean
  chatModel: string
  dallModel: "dall-e-2" | "dall-e-3"
  dallSize:
    | "256x256"
    | "512x512"
    | "1024x1024"
    | "1792x1024"
    | "1024x1792"
    | null
    | undefined
  dallQuality: "standard" | "hd"
}

export interface ReplyMessage {
  type: "text" | "audio" | "image"
  message: string
}
