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
  message: string,
  mode: "callName" | "randomReply" = "callName"
): Promise<ReplyMessage> {
  const time = date()

  const messages: any[] = []

  // 判斷當前是隨機回復還是呼叫回復
  if (mode === "callName") {
    const channelMessages = await getLinebotMessageCollection(
      `linebot/${channelData.channelId}/messages`,
      channelData.memory
    )
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
    const channelHistory = await getLinebotMessageCollection(
      `linebot/${channelData.channelId}/history`,
      channelData.memory
    )
    const historyContent = channelHistory.map((doc) => doc.message).join("<br>")
    messages.unshift({
      role: "user",
      content: `近${channelData.memory}筆對話紀錄(一個<br>代表一句的結束)：${historyContent}`,
    })
  } else if (mode === "randomReply") {
    const channelHistory = await getLinebotMessageCollection(
      `linebot/${channelData.channelId}/history`,
      channelData.memory
    )
    channelHistory.forEach((doc) => {
      messages.unshift({
        role: "user",
        content: doc.message,
      })
    })
  }

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: channelData.chatModel,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "schema",
          strict: true,
          schema: {
            type: "object",
            properties: {
              type: {
                type: "string",
                description: "面對該提問的回覆，最好的呈現方式。",
                enum: ["text", "audio", "image"],
              },
              message: {
                type: "string",
                description: "回覆的內容。",
              },
              severity: {
                type: "string",
                description:
                  "該提問的嚴重程度，success:一般問答無需特別注意、help:無法完全解答或提問中帶有煩躁不滿，需人工處理、warn:該問答中含有個人隱私或稍微超出範圍，需注意、danger:問答內容嚴重超出範圍，需特別注意",
                enum: ["success", "help", "warn", "danger"],
              },
            },
            required: ["type", "message", "severity"],
            additionalProperties: false,
          },
        },
      },
      messages: [
        {
          role: "system",
          content: `${mode === "randomReply" ? "沒有任何人詢問你，本次你是進行插話" : ""}現在時間${time}，${channelData.systemContent}`,
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
