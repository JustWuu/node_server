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
  messageMod: string
  voice: string
  systemContent: string
  messageHistory: MessageHistory
}
