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
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: channelData.systemContent,
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
