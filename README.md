# 金棕榈竞猜

戛纳电影节主竞赛影片竞猜交易平台。注册即送 3000 本金，交易电影股票，预测获奖名单赢取丰厚奖品。

## 技术栈

- **前端**: React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **后端**: Hono + tRPC 11.x + Drizzle ORM
- **数据库**: TiDB (MySQL compatible)
- **部署**: Vercel

## 本地开发

```bash
npm install
npm run dev
```

## Vercel 部署步骤

### 1. 准备代码

确保 `.env` 文件不被提交（已配置 `.gitignore`）。

### 2. 创建 Vercel 项目

1. 访问 [vercel.com](https://vercel.com)，用 GitHub 账号登录
2. 导入本项目的 GitHub 仓库
3. 框架预设选择 **Other**，构建命令保持默认

### 3. 配置环境变量

在 Vercel 项目后台 → **Settings** → **Environment Variables** 中添加：

| 变量名 | 值 | 来源 |
|--------|-----|------|
| `DATABASE_URL` | 你的 TiDB 连接字符串 | TiDB Cloud 控制台 |
| `APP_URL` | `https://你的域名.vercel.app` | Vercel 分配的域名 |
| `RESEND_API_KEY` | `re_xxxxxxxxx` | [resend.com](https://resend.com) |
| `FROM_EMAIL` | `noreply@你的域名.com` | Resend 验证过的发件地址 |
| `VITE_APP_ID` | 自动生成值 | 初始化时生成的 .env |
| `VITE_KIMI_AUTH_URL` | 自动生成值 | 初始化时生成的 .env |
| `KIMI_AUTH_URL` | 同上 | 初始化时生成的 .env |
| `APP_SECRET` | 自动生成值 | 初始化时生成的 .env |
| `OWNER_UNION_ID` | 自动生成值 | 初始化时生成的 .env |

### 4. 部署

点击 **Deploy**，Vercel 会自动构建并部署。

### 5. 绑定自定义域名（可选）

1. Vercel 项目后台 → **Domains**
2. 添加 `palmedor.toroscope.net` 或子域名
3. 按提示在域名服务商处配置 DNS 记录

### 6. 数据库初始化

首次部署后，需要同步数据库 schema：

```bash
# 本地运行（需要 .env 文件）
npx drizzle-kit push
```

或在 Vercel 的 **Functions Logs** 中检查首次启动时是否自动执行了 `db:push`。

## 项目结构

```
/
├── api/              # 后端 API (tRPC + Hono)
│   ├── index.ts      # Vercel serverless 入口
│   ├── router.ts     # tRPC 路由注册
│   ├── authRouter.ts # 认证相关接口
│   ├── tradingRouter.ts # 交易接口
│   └── queries/      # 数据库查询函数
├── contracts/        # 前后端共享类型
├── db/               # 数据库 schema
├── src/              # 前端代码
│   ├── components/   # UI 组件
│   ├── pages/        # 页面
│   └── hooks/        # React Hooks
└── vercel.json       # Vercel 配置
```
