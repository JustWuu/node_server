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
import { chatGpt } from "@/utils/useOpenai.js"
import { textToSpeech } from "@/utils/useSpeech.js"

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

const replyAudio = (channelId: string, replyToken: string, audio: any) => {
  // set channelAccessToken
  const clientConfig: ClientConfig = {
    channelAccessToken: process.env[`CHANNEL_${channelId}_ACCESS_TOKEN`] || "",
  }
  const client = new messagingApi.MessagingApiClient(clientConfig)
  return client.replyMessage({
    replyToken: replyToken,
    messages: [
      {
        type: "audio",
        originalContentUrl: audio,
        duration: 60000,
      },
    ],
  })
}

const replyMessage = (
  channelId: string,
  replyToken: string,
  message: string
) => {
  // set channelAccessToken
  const clientConfig: ClientConfig = {
    channelAccessToken: process.env[`CHANNEL_${channelId}_ACCESS_TOKEN`] || "",
  }
  const client = new messagingApi.MessagingApiClient(clientConfig)
  return client.replyMessage({
    replyToken: replyToken,
    messages: [
      {
        type: "text",
        text: message,
      },
    ],
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
      channelId: channelId,
      mod: "[Product]",
      systemContent:
        "你是剛初始化的機器人，沒有名稱沒有代號，你正等待啟動者為你取名，你尚未設定任何任務目標",
      messageHistory: {
        oldBeforeMessage: "",
        oldBeforeReply: "",
        beforeMessage: "",
        beforeReply: "",
      },
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
        return replyMessage(
          channelId,
          event.replyToken,
          "UID Correct！[Debug Start]"
        )
      }
      case "Debug End": {
        await updateDocument("linebot", channelId, { mod: "[Product]" })
        return replyMessage(
          channelId,
          event.replyToken,
          "UID Correct！[Debug End]"
        )
      }
      case "System Set": {
        if (channelData.mod == "[Debug]") {
          await updateDocument("linebot", channelId, { mod: "[System]" })
          return replyMessage(
            channelId,
            event.replyToken,
            "UID Correct！[System Set]"
          )
        } else {
          break
        }
      }
      case "Console Config": {
        return replyMessage(
          channelId,
          event.replyToken,
          JSON.stringify({
            channelId: channelData.channelId,
            mod: channelData.mod,
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
    return replyMessage(
      channelId,
      event.replyToken,
      `[System Set] End, Now [Debug]`
    )
  }

  // if Debug mod to end
  if (event.message.text.indexOf("Vivy") < 0 || channelData.mod == "[Debug]") {
    return
  }

  // get displayName
  const displayName = await getDisplayName(channelId, event.source)

  // start chat
  const chatCompletion = await chatGpt(
    channelData,
    `${displayName !== "" ? `我是${displayName}，` : ""}${event.message.text}`
  )

  // start speech
  const audioStream = await textToSpeech("哈囉")
  return replyAudio(channelId, event.replyToken, audioStream)

  // return replyMessage(channelId, event.replyToken, chatCompletion)
}

export { eventHandler }
