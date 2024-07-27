import express, { Application, Request, Response, NextFunction } from "express"
import "dotenv/config"
import { default as indexRouter } from "@/routes/index.js"
import { default as linebot2000083408Router } from "./routes/linebot_2000083408.js"
// https://github.com/microsoft/TypeScript/issues/27481
// 提到.ts檔卻要使用.js解尾的問題，是很長期的issues了
import { default as speechRouter } from "@/routes/speech.js"
import { default as openaiRouter } from "@/routes/openai.js"

const app: Application = express()
const PORT = process.env.PORT || 3000

app.use("/", indexRouter)
app.use("/linebot/2000083408", linebot2000083408Router)
app.use("/speech", speechRouter)
app.use("/openai", openaiRouter)

// error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === "development") {
    console.error(err)
  }
  res.status(500).send({
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  })
})

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})
