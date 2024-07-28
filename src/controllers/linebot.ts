import {
  ClientConfig,
  MessageAPIResponseBase,
  messagingApi,
  webhook,
} from "@line/bot-sdk"
import { ChannelData } from "@/types.js"
import {
  setDocument,
  getDocument,
  updateDocument,
} from "@/utils/useFirebase.js"
import { chatGpt, dallE } from "@/utils/useOpenai.js"

const getDisplayName = async (channelId: string, source: any) => {
  // set channelAccessToken
  const clientConfig: ClientConfig = {
    channelAccessToken: process.env[`CHANNEL_${channelId}_ACCESS_TOKEN`] || "",
  }
  const client = new messagingApi.MessagingApiClient(clientConfig)

  try {
    const profile = await client.getProfile(source.userId)
    return profile.displayName
  } catch (error: any) {
    console.log("error:", error)
    return ""
  }
}

const reply = async (
  channelData: ChannelData,
  replyToken: string,
  message: string,
  type: "text" | "audio" | "image" = "text"
) => {
  // set channelAccessToken
  const clientConfig: ClientConfig = {
    channelAccessToken:
      process.env[`CHANNEL_${channelData.channelId}_ACCESS_TOKEN`] || "",
  }
  const client = new messagingApi.MessagingApiClient(clientConfig)
  const messages: any[] = []
  switch (type) {
    case "text":
      messages.push({
        type: "text",
        text: message,
      })
      break
    case "audio":
      messages.push({
        type: "audio",
        originalContentUrl: `${process.env.SPEECH_URL}/${encodeURI(channelData.voice)}/${encodeURI(message)}`,
        duration: 1000,
      })
      break
    case "image":
      const url = await dallE(channelData, message)
      messages.push({
        type: "image",
        originalContentUrl: url,
        previewImageUrl: url,
      })
      break
  }
  return client.replyMessage({
    replyToken: replyToken,
    messages: messages,
  })
}

const eventHandler = async (
  channelId: string,
  event: webhook.Event
): Promise<
  messagingApi.ReplyMessageResponse | MessageAPIResponseBase | undefined
> => {
  // Process all variables here.
  const channelData: ChannelData = await getDocument("linebot", channelId)

  // if not channelData
  if (!channelData) {
    const config: ChannelData = {
      name: "Vivy",
      memory: 3,
      channelId: channelId,
      mod: "[Product]",
      voice: "zh-CN-XiaoxiaoNeural",
      systemContent:
        "你是剛初始化的機器人，名為Vivy的機器人，你尚未設定任何任務目標",
      image: true,
      chatModel: "gpt-4o-mini",
      dallModel: "dall-e-2",
      dallSize: "512x512",
      dallQuality: "standard",
    }
    await setDocument("linebot", channelId, config)
    return
  }

  // Check if for a text message
  if (event.type !== "message" || event.message.type !== "text") {
    return
  }

  // Check if message is repliable
  if (!event.replyToken) return

  // Process all message related variables here.
  if (event.source!.userId == process.env.ADMIN_UID) {
    switch (event.message.text) {
      case "Debug Start": {
        await updateDocument("linebot", channelId, { mod: "[Debug]" })
        return reply(channelData, event.replyToken, "UID Correct! Now [Debug]")
      }
      case "Debug End": {
        await updateDocument("linebot", channelId, { mod: "[Product]" })
        return reply(
          channelData,
          event.replyToken,
          "UID Correct! Now [Product]"
        )
      }
      case "System Set": {
        if (channelData.mod == "[Debug]") {
          await updateDocument("linebot", channelId, { mod: "[System]" })
          return reply(
            channelData,
            event.replyToken,
            "UID Correct! Now [System]"
          )
        } else {
          break
        }
      }
      case "Message Set": {
        if (channelData.mod == "[Debug]") {
          await updateDocument("linebot", channelId, { mod: "[Message]" })
          return reply(
            channelData,
            event.replyToken,
            "UID Correct! Now [Message], You Can Set audio or text"
          )
        } else {
          break
        }
      }
      case "Console Config": {
        return reply(
          channelData,
          event.replyToken,
          JSON.stringify({
            channelId: channelData.channelId,
            mod: channelData.mod,
            voice: channelData.voice,
            systemContent: channelData.systemContent,
          })
        )
      }
      default: {
        break
      }
    }
  }

  // set system
  if (channelData.mod == "[System]") {
    await updateDocument("linebot", channelId, {
      mod: "[Debug]",
      systemContent: event.message.text,
    })
    return reply(channelData, event.replyToken, `[System Set] End, Now [Debug]`)
  }

  // if Debug mod to end
  if (
    event.message.text.indexOf(channelData.name) < 0 ||
    channelData.mod == "[Debug]"
  ) {
    return
  }

  // get displayName
  const displayName = await getDisplayName(channelId, event.source)

  // start chat
  const chatCompletion = await chatGpt(
    channelData,
    `${displayName !== "" ? `我是${displayName}，` : ""}${event.message.text}`
  )

  // start reply
  if (chatCompletion.type == "text") {
    return reply(channelData, event.replyToken, chatCompletion.message)
  } else if (chatCompletion.type == "audio") {
    return reply(channelData, event.replyToken, chatCompletion.message, "audio")
  } else if (chatCompletion.type == "image") {
    if (channelData.image) {
      return reply(
        channelData,
        event.replyToken,
        chatCompletion.message,
        "image"
      )
    } else {
      return reply(channelData, event.replyToken, "圖片生成遭關閉了！")
    }
  }
}

export { eventHandler }
