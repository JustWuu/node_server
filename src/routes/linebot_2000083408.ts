import Router, { Application, Request, Response } from "express"
import {
  ClientConfig,
  MessageAPIResponseBase,
  messagingApi,
  middleware,
  MiddlewareConfig,
  webhook,
  HTTPFetchError,
} from "@line/bot-sdk"

const linebotRouter: Application = Router()

const clientConfig: ClientConfig = {
  channelAccessToken: process.env.CHANNEL_2000083408_ACCESS_TOKEN || "",
}

const middlewareConfig: MiddlewareConfig = {
  channelSecret: process.env.CHANNEL_2000083408_SECRET || "",
}

const client = new messagingApi.MessagingApiClient(clientConfig)

const textEventHandler = async (
  event: webhook.Event
): Promise<MessageAPIResponseBase | undefined> => {
  // Process all variables here.

  // Check if for a text message
  if (event.type !== "message" || event.message.type !== "text") {
    return
  }

  // Process all message related variables here.

  // Check if message is repliable
  if (!event.replyToken) return

  // Create a new message.
  // Reply to the user.
  await client.replyMessage({
    replyToken: event.replyToken,
    messages: [
      {
        type: "text",
        text: event.message.text,
      },
    ],
  })
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
          await textEventHandler(event)
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
