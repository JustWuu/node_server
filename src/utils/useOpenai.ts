import OpenAI from "openai"
import { ChannelData, MemoryAction, ReplyMessage } from "@/types.js"
import {
  getCollection,
  getDocument,
  setDocument,
  getLinebotMessageCollection,
  addDocument,
  updateDocument,
  deleteDocument,
} from "@/utils/useFirebase.js"
import { time as getTime, date } from "@/utils/useTime.js"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function chatGpt(
  channelData: ChannelData,
  message: string,
  userId: string = "",
  displayName: string = ""
): Promise<ReplyMessage> {
  const time = date()
  const memoriesText = await getMemories(channelData.channelId)

  // 載入用戶資料
  let userAnalysisText = ""
  if (userId) {
    const userData = await getDocument(
      `linebot/${channelData.channelId}/users`,
      userId
    )
    if (userData?.analysis) {
      userAnalysisText = `\n\n你對當前用戶「${displayName || userId}」的分析：${userData.analysis}`
    }
  }

  const input: Array<{ role: "user" | "assistant"; content: string }> = []

  const channelMessages = await getLinebotMessageCollection(
    `linebot/${channelData.channelId}/messages`,
    channelData.memory
  )
  channelMessages.forEach((doc) => {
    input.unshift({
      role: "assistant",
      content: doc.reply,
    })
    input.unshift({
      role: "user",
      content: doc.message,
    })
  })
  const channelHistory = await getLinebotMessageCollection(
    `linebot/${channelData.channelId}/history`,
    channelData.memory
  )
  const historyContent = channelHistory.map((doc) => doc.message).join("<br>")
  input.unshift({
    role: "user",
    content: `近${channelData.memory}筆對話紀錄(一個<br>代表一句的結束)：${historyContent}`,
  })

  input.push({ role: "user", content: message })

  try {
    const response = await openai.responses.create({
      model: channelData.chatModel,
      instructions: `現在時間${time}，${channelData.systemContent}${memoriesText ? `\n\n你的長期記憶（可透過 memories 欄位增刪修）：\n${memoriesText}` : ""}${userAnalysisText}`,
      input,
      tools: [{ type: "web_search_preview" }],
      text: {
        format: {
          type: "json_schema",
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
              memories: {
                type: "array",
                description: "需要記住/修改/刪除的長期記憶事項，沒有則回空陣列",
                items: {
                  type: "object",
                  properties: {
                    action: {
                      type: "string",
                      enum: ["add", "update", "delete"],
                    },
                    id: {
                      type: "string",
                      description: "update/delete 時帶入記憶ID，add 時填空字串",
                    },
                    content: {
                      type: "string",
                      description: "記憶內容，delete 時填空字串",
                    },
                  },
                  required: ["action", "id", "content"],
                  additionalProperties: false,
                },
              },
              userAnalysis: {
                type: "string",
                description:
                  "根據本次對話更新對當前用戶的分析（個性、偏好、互動模式等），無需更新則填空字串",
              },
            },
            required: [
              "type",
              "message",
              "severity",
              "memories",
              "userAnalysis",
            ],
            additionalProperties: false,
          },
        },
      },
    })

    const replyMessage = response.output_text?.trim() || "undefined"
    const replyMessageObject: ReplyMessage = JSON.parse(replyMessage)

    // 處理記憶操作
    if (replyMessageObject.memories && replyMessageObject.memories.length > 0) {
      await processMemories(channelData.channelId, replyMessageObject.memories)
    }

    // 更新用戶分析
    if (userId && replyMessageObject.userAnalysis) {
      const userCol = `linebot/${channelData.channelId}/users`
      const userData = await getDocument(userCol, userId)
      if (userData) {
        await updateDocument(userCol, userId, {
          displayName: displayName || userData.displayName,
          analysis: replyMessageObject.userAnalysis,
        })
      } else {
        await setDocument(userCol, userId, {
          displayName,
          userId,
          analysis: replyMessageObject.userAnalysis,
          createdAt: getTime(),
        })
      }
    }

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

async function getMemories(channelId: string): Promise<string> {
  try {
    const memories = await getCollection(`linebot/${channelId}/memories`)
    if (memories.length === 0) return ""
    return memories
      .map((doc: any) => `[id:${doc.id}] ${doc.content}`)
      .join("\n")
  } catch {
    return ""
  }
}

async function processMemories(
  channelId: string,
  memories: MemoryAction[]
): Promise<void> {
  for (const mem of memories) {
    const col = `linebot/${channelId}/memories`
    switch (mem.action) {
      case "add":
        await addDocument(col, { content: mem.content, createdAt: getTime() })
        break
      case "update":
        await updateDocument(col, mem.id, { content: mem.content })
        break
      case "delete":
        await deleteDocument(col, mem.id)
        break
    }
  }
}

export async function shouldReply(
  channelData: ChannelData,
  currentMessage: string = ""
): Promise<boolean> {
  try {
    const channelHistory = await getLinebotMessageCollection(
      `linebot/${channelData.channelId}/history`,
      channelData.memory
    )
    const historyContent = channelHistory.map((doc) => doc.message).join("\n")
    const fullContext = currentMessage
      ? `${historyContent}\n${currentMessage}`
      : historyContent

    const response = await openai.responses.create({
      model: "gpt-4.1-nano",
      instructions: `你是對話分析器。對話紀錄中，帶有「[你(...)的回覆]」前綴的是你（AI助理）之前的發言，其餘是不同用戶的訊息。根據最後一則訊息及前後文，判斷是否需要你回覆。需要回覆的情境：有人提出問題、請求幫助、尋求建議、話題需要延續、有人針對你的回覆做出回應或追問或糾正。不需要回覆的情境：純粹閒聊結束語（如「好」「OK」「哈哈」）、用戶之間的私人對話不需你介入。`,
      input: [
        {
          role: "user",
          content: `以下是近期對話紀錄：\n${fullContext}\n\n最後一則訊息是否需要有人回覆？`,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "should_reply",
          strict: true,
          schema: {
            type: "object",
            properties: {
              reply: {
                type: "boolean",
                description: "是否需要回覆，true 代表需要，false 代表不需要",
              },
            },
            required: ["reply"],
            additionalProperties: false,
          },
        },
      },
    })

    const result = JSON.parse(response.output_text?.trim() || '{"reply":false}')
    return result.reply
  } catch (error: any) {
    console.log("shouldReply error:", error)
    return false
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

    const image_url = response.data?.[0]?.url

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
