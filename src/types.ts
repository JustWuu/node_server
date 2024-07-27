interface MessageHistory {
  oldBeforeMessage: string
  oldBeforeReply: string
  beforeMessage: string
  beforeReply: string
}

export interface ChannelData {
  name: string
  memory: number
  channelId: string
  mod: string
  voice: string
  systemContent: string
  messageHistory: MessageHistory
}

export interface ReplyMessage {
  type: "text" | "audio" | "image"
  message: string
}
