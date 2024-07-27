export interface ChannelData {
  name: string
  memory: number
  channelId: string
  mod: string
  voice: string
  systemContent: string
  image: boolean
}

export interface ReplyMessage {
  type: "text" | "audio" | "image"
  message: string
}
