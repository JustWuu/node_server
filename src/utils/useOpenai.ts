import OpenAI from "openai"
import { generateRandomString } from "@/utils/useRandom.js"
import { ChannelData } from "@/types.js"
import { updateDocument, addDocument } from "@/utils/useFirebase.js"
import { getToday } from "@/utils/useDate.js"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function chatGpt(
  channelData: ChannelData,
  message: string
): Promise<string> {
  const time = getToday()

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `現在時間${time}，${channelData.systemContent}`,
        },
        {
          role: "user",
          content: channelData.messageHistory.oldBeforeMessage,
        },
        {
          role: "assistant",
          content: channelData.messageHistory.oldBeforeReply,
        },
        {
          role: "user",
          content: channelData.messageHistory.beforeMessage,
        },
        {
          role: "assistant",
          content: channelData.messageHistory.beforeReply,
        },
        { role: "user", content: message },
      ],
    })

    const replyMessage =
      chatCompletion.choices[0]?.message.content?.trim() || "undefined"

    await updateDocument("linebot", channelData.channelId, {
      messageHistory: {
        oldBeforeMessage: channelData.messageHistory.beforeMessage,
        oldBeforeReply: channelData.messageHistory.beforeReply,
        beforeMessage: message,
        beforeReply: replyMessage,
      },
    })

    await addDocument("gpt", { message: message, reply: replyMessage })

    return replyMessage
  } catch (error: any) {
    console.log("error:", error)
    return "undefined"
  }
}
