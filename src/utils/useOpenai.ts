import OpenAI from "openai"
import { ChannelData, ReplyMessage } from "@/types.js"
import {
  getLinebotMessageCollection,
  addDocument,
} from "@/utils/useFirebase.js"
import { time as getTime, date } from "@/utils/useTime.js"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function chatGpt(
  channelData: ChannelData,
  message: string
): Promise<ReplyMessage> {
  const time = date()

  const channelMessages = await getLinebotMessageCollection(
    `linebot/${channelData.channelId}/messages`,
    channelData.memory
  )
  const messages: any[] = []
  channelMessages.forEach((doc) => {
    messages.unshift({
      role: "assistant",
      content: doc.reply,
    })
    messages.unshift({
      role: "user",
      content: doc.message,
    })
  })
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: channelData.chatModel,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `現在時間${time}，${channelData.systemContent}`,
        },
        ...messages,
        { role: "user", content: message },
      ],
    })

    const replyMessage =
      chatCompletion.choices[0]?.message.content?.trim() || "undefined"
    const replyMessageObject: ReplyMessage =
      JSON.parse(chatCompletion.choices[0]?.message.content?.trim()!) ||
      "undefined"

    await addDocument(`linebot/${channelData.channelId}/messages`, {
      message: message,
      reply: replyMessage,
      createdAt: getTime(),
    })

    return replyMessageObject
  } catch (error: any) {
    console.log("error:", error)
    return { type: "text", message: "undefined" }
  }
}

export async function dallE(
  channelData: ChannelData,
  message: string
): Promise<string> {
  try {
    const response = await openai.images.generate({
      model: channelData.dallModel,
      prompt: message,
      size: channelData.dallSize,
      quality: channelData.dallQuality,
      n: 1,
    })

    const image_url = response.data[0]!.url

    await addDocument(`linebot/${channelData.channelId}/images`, {
      message: message,
      reply: image_url,
      createdAt: getTime(),
    })

    return image_url!
  } catch (error: any) {
    console.log("error:", error)
    return "undefined"
  }
}
