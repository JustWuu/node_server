interface MessageHistory {
  oldBeforeMessage: string
  oldBeforeReply: string
  beforeMessage: string
  beforeReply: string
}

export interface ChannelData {
  channelId: string
  mod: string
  messageMod: string
  systemContent: string
  messageHistory: MessageHistory
}
