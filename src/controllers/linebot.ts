import {
  ClientConfig,
  MessageAPIResponseBase,
  messagingApi,
  webhook,
} from "@line/bot-sdk"

const eventHandler = async (
  channelId: string,
  event: webhook.Event
): Promise<MessageAPIResponseBase | undefined> => {
  // set channelAccessToken
  const clientConfig: ClientConfig = {
    channelAccessToken: process.env[`CHANNEL_${channelId}_ACCESS_TOKEN`] || "",
  }
  const client = new messagingApi.MessagingApiClient(clientConfig)

  // Process all variables here.

  // Check if for a text message
  if (event.type !== "message" || event.message.type !== "text") {
    return
  }

  // Process all message related variables here.

  // Check if message is repliable
  if (!event.replyToken) return

  // Create a new message.
  // Reply to the user.
  await client.replyMessage({
    replyToken: event.replyToken,
    messages: [
      {
        type: "text",
        text: event.message.text,
      },
    ],
  })
}

export { eventHandler }
