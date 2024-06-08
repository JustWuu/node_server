import Router, { Application, Request, Response } from "express"
import {
  middleware,
  MiddlewareConfig,
  webhook,
  HTTPFetchError,
} from "@line/bot-sdk"

import { eventHandler } from "@/controllers/index.js"

const linebotRouter: Application = Router()

const middlewareConfig: MiddlewareConfig = {
  channelSecret: process.env.CHANNEL_2000083408_SECRET || "",
}

/* GET linebot listing. */
linebotRouter.post(
  "/",
  middleware(middlewareConfig),
  async (req: Request, res: Response): Promise<Response> => {
    const callbackRequest: webhook.CallbackRequest = req.body
    const events: webhook.Event[] = callbackRequest.events!

    // Process all the received events asynchronously.
    const results = await Promise.all(
      events.map(async (event: webhook.Event) => {
        try {
          await eventHandler("2000083408", event)
        } catch (err: unknown) {
          if (err instanceof HTTPFetchError) {
            console.error(err.status)
            console.error(err.headers.get("x-line-request-id"))
            console.error(err.body)
          } else if (err instanceof Error) {
            console.error(err)
          }

          // Return an error message.
          return res.status(500).json({
            status: "error",
          })
        }
      })
    )

    // Return a successful message.
    return res.status(200).json({
      status: "success",
      results,
    })
  }
)

export default linebotRouter
