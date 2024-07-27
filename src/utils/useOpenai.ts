import OpenAI from "openai"
import { ChannelData } from "@/types.js"
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
): Promise<string> {
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
      model: `${process.env.OPENAI_MODEL}`,
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

    await addDocument(`linebot/${channelData.channelId}/messages`, {
      message: message,
      reply: replyMessage,
      createdAt: getTime(),
    })

    return replyMessage
  } catch (error: any) {
    console.log("error:", error)
    return "undefined"
  }
}
