import Router, { Application, Request, Response } from "express"
import { ChannelData } from "@/types.js"
import { getDocument } from "@/utils/useFirebase.js"
import { chatGpt } from "@/utils/useOpenai.js"

const openaiRouter: Application = Router()

openaiRouter.get(
  "/:text",
  async (_: Request, res: Response): Promise<Response> => {
    const channelData: ChannelData = await getDocument("linebot", "2000083408")
    const chatCompletion = await chatGpt(channelData, _.params.text!)
    return res.status(200).json({
      status: "success",
      message: chatCompletion,
    })
  }
)

export default openaiRouter
