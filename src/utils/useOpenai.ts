import OpenAI from "openai"
import { generateRandomString } from "@/utils/useRandom.js"
import { ChannelData } from "@/types.js"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function chatGpt(
  channelData: ChannelData,
  message: string
): Promise<string> {
  // 設定現在時間
  const day = new Date()
  const time =
    day.getFullYear() +
    "年" +
    (day.getMonth() + 1) +
    "月" +
    day.getDate() +
    "日" +
    (day.getHours() + 8) +
    "點" +
    day.getMinutes() +
    "分" +
    day.getSeconds() +
    "秒"
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `今天是${time}，${channelData.systemContent}`,
        },
        { role: "user", content: message },
      ],
    })

    return chatCompletion.choices[0]?.message.content?.trim() || "undefined"
  } catch (error: any) {
    console.log("error:", error)
    return "undefined"
  }
}
