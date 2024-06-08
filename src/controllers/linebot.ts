import {
  ClientConfig,
  MessageAPIResponseBase,
  messagingApi,
  webhook,
} from "@line/bot-sdk"
import { ChannelConfig } from "@/types.js"
import {
  setDocument,
  getDocument,
  updateDocument,
} from "@/utils/useFirebase.js"

const eventHandler = async (
  channelId: string,
  event: webhook.Event
): Promise<
  messagingApi.ReplyMessageResponse | MessageAPIResponseBase | undefined
> => {
  // set channelAccessToken
  const clientConfig: ClientConfig = {
    channelAccessToken: process.env[`CHANNEL_${channelId}_ACCESS_TOKEN`] || "",
  }
  const client = new messagingApi.MessagingApiClient(clientConfig)

  // Process all variables here.
  const channelConfig: ChannelConfig = await getDocument("linebot", channelId)

  // if not channelConfig
  if (!channelConfig) {
    const config: ChannelConfig = {
      channelId: channelId,
      mod: "[Product]",
      systemContent:
        "你是剛初始化的機器人，沒有名稱沒有代號，你正等待啟動者為你取名，你尚未設定任何任務目標",
    }
    await setDocument("linebot", channelId, config)
  }

  // Check if for a text message
  if (event.type !== "message" || event.message.type !== "text") {
    return
  }

  // Check if message is repliable
  if (!event.replyToken) return

  // Process all message related variables here.
  // "Uafee7075f6082ab29a1b8fddb52a6fde"
  if (event.source!.userId == process.env.ADMIN_UID) {
    switch (event.message.text) {
      case "Debug Start": {
        await updateDocument("linebot", channelId, { mod: "[Debug]" })
        return client.replyMessage({
          replyToken: event.replyToken,
          messages: [
            {
              type: "text",
              text: "UID Correct！[Debug Start]",
            },
          ],
        })
      }
      case "Debug End": {
        await updateDocument("linebot", channelId, { mod: "[Product]" })
        return client.replyMessage({
          replyToken: event.replyToken,
          messages: [
            {
              type: "text",
              text: "UID Correct！[Debug End]",
            },
          ],
        })
      }
      case "System Set": {
        if (channelConfig.mod == "[Debug]") {
          await updateDocument("linebot", channelId, { mod: "[System]" })
          return client.replyMessage({
            replyToken: event.replyToken,
            messages: [
              {
                type: "text",
                text: "UID Correct！[System Set]",
              },
            ],
          })
        } else {
          break
        }
      }
      case "Console Config": {
        return client.replyMessage({
          replyToken: event.replyToken,
          messages: [
            {
              type: "text",
              text: `${channelConfig}`,
            },
          ],
        })
      }
      default: {
        break
      }
    }
  }

  // set system
  if (channelConfig.mod == "[System]") {
    await updateDocument("linebot", channelId, {
      mod: "[Debug]",
      systemContent: event.message.text,
    })
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: "text",
          text: `${channelConfig}`,
        },
      ],
    })
  }

  // if Debug mod to end
  if (channelConfig.mod == "[Debug]") {
    return
  }
}

export { eventHandler }
