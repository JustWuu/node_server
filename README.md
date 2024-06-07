# Node Server

- 所有使用Node撰寫的功能通通集合在此專案中
- 詳細可閱讀下方介紹

## 1. Line ChatGPT Bot

- 串接OpenAI API的Line Bot，透過LineBot的Messaging API
- 將接受的訊息傳遞至OpenAI並回傳得到的結果至客戶端的Line上
- 任何訊息都會儲存至Firebase的Realtime Database中做為備存

- 另外專案可串接Google搜尋API，透過關鍵字使用搜尋功能
- 並將搜尋解果回傳至客戶端

### Node Typescript ESM

- 本專案使用node-typescript-esm-starter template進行開發
- https://github.com/ibnumusyaffa/node-typescript-esm-starter

### Features

- 💎 Node.js 18+
- 🛠️ TypeScript 5.3
- ⚡️ [tsx: Node.js enhanced to run TypeScript & ESM files](https://github.com/privatenumber/tsx)
- 📁 [tsc-alias: Import path alias using `@/` prefix](https://github.com/justkey007/tsc-alias)
- 🔍 ESLint — To find and fix problems in your code
- 📝 Prettier — Format your code consistently
- 🌍 Express.js

### Quick Start

#### 1. Clone repo

clone repo without commit history

```bash
git clone --depth=1 https://github.com/JustWuu/node_server my-project-name
```

#### 2. Install dependencies

```bash
pnpm install
```

#### 3. Run the development server

```bash
pnpm run dev
```

### Available scripts

- `pnpm run dev` — Starts the application in development mode at.
- `pnpm run build` — Compile the application.
- `pnpm start` — Starts the application in production mode.
- `pnpm run lint` — Check code using ESLint.
- `pnpm run lint:fix` — Fix autofixable ESLint problem.
- `pnpm run format:all` — Format code using Prettier for all files.
- `pnpm run format:check` — Check code format using prettier.
