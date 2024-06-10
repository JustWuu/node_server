import Router, { Application, Request, Response } from "express"
import { textToSpeech } from "@/utils/useSpeech.js"

const speechRouter: Application = Router()

speechRouter.get(
  "/:voice/:text",
  async (_: Request, res: Response): Promise<any> => {
    const audioStream = await textToSpeech(
      `${_.params.voice}`,
      `${_.params.text}`
    )
    res.set({
      "Content-Type": "audio/mpeg",
      "Transfer-Encoding": "chunked",
    })
    audioStream.pipe(res)
  }
)

export default speechRouter
