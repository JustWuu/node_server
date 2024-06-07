import Router, { Application, Request, Response } from "express"

const indexRouter: Application = Router()

indexRouter.get("/", async (_: Request, res: Response): Promise<Response> => {
  return res.status(200).json({
    status: "success",
    message: "Connected successfully!",
  })
})

export default indexRouter
