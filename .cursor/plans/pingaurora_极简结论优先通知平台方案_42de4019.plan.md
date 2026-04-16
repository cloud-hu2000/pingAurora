---
name: pingAurora 极简结论优先通知平台方案
overview: 聚焦极简 UX：用户只收到"今晚有机会"或"今晚不适合"两种结论，前端零图表零数据展示，专注 Telegram Bot 通知 + 邮件备选。
todos:
  - id: init-nextjs
    content: 初始化 Next.js + TypeScript 项目
    status: completed
  - id: setup-prisma
    content: 配置 Prisma + Neon PostgreSQL 数据模型
    status: completed
  - id: noaa-kp-module
    content: 实现 NOAA KP 指数获取模块 (src/lib/kp.ts)
    status: completed
  - id: weather-module
    content: 实现 Open-Meteo 晴朗天空预报模块 (src/lib/weather.ts)
    status: completed
  - id: email-module
    content: 实现 AWS SES 邮件发送模块
    status: completed
  - id: telegram-module
    content: 实现 Telegram Bot 模块（订阅 + Webhook）
    status: completed
  - id: scheduler-module
    content: 实现极光检查定时任务逻辑 (src/lib/scheduler.ts)
    status: completed
  - id: subscribe-api
    content: 实现订阅/退订 API Routes
    status: completed
  - id: frontend-pages
    content: 实现极简前端页面（首页状态页 + 订阅页）
    status: completed
  - id: deploy-vercel
    content: 配置 Vercel 部署 + Cron Job
    status: completed
isProject: false
---

## 核心定位

> **只给用户一个他能看懂的结论，不给任何专业术语和数据图。**

用户行为路径：

1. 打开网页 → 输入邮箱/绑定 Telegram → 输入城市
2. 什么都不用管了，坐等通知
3. 收到消息：「今晚有机会！出发吧 🚀」
4. 天气不好则不发通知，用户无感知

---

## 数据来源（直接调原始 API，不爬 aurora.umich.edu）


| 数据     | 来源         | 接口                                                                                                       | 说明           |
| ------ | ---------- | -------------------------------------------------------------------------------------------------------- | ------------ |
| KP 指数  | NOAA SWPC  | `https://services.swpc.noaa.gov/json/planetary_k_index_1m.json`                                          | 每分钟更新，KP 0-9 |
| 用户地晴朗度 | Open-Meteo | `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&hourly=cloud_cover&timezone=auto` | 无需 key，免费无限  |


> **aurora.umich.edu 的底层数据就是这两个，直接调原始接口更稳定、更快、更合规。**

---

## 技术架构

```
┌──────────────────────────────────────────────────────┐
│                  Next.js App (Node.js)               │
│                                                       │
│  / (首页)        → 极简状态页（只有一句话结论）         │
│  /subscribe      → 订阅表单（邮箱/Telegram + 城市）    │
│  /unsubscribe/[t] → 一键退订                          │
│  /api/subscribe  → 订阅接口                           │
│  /api/check      → 定时触发的检查接口                  │
│                                                       │
│  [Vercel Cron 每10分钟触发 /api/check]            │
└────────────┬──────────────────┬───────────────────────┘
             │                  │
      ┌────────────▼────────┐   ┌───────────▼────────────┐
      │ PostgreSQL           │   │  SMTP 邮件              │
      │ (Neon 免费版)         │   │  (AWS SES 无限发信)     │
      └──────────────────────┘   └────────────────────────┘
```

**技术栈：**

- **Runtime**: Node.js 18+ (TypeScript)
- **框架**: Next.js 14 (App Router)
- **数据库**: PostgreSQL via Neon（免费，支持 branch，Serverless）
- **ORM**: Prisma
- **邮件**: AWS SES（美国区，无限发信，成本极低）
- **Telegram**: `node-telegram-bot-api`（Bot 管理订阅，Webhook 推送）
- **样式**: Tailwind CSS（暗黑极光主题）
- **部署**: Vercel（美国节点，Next.js 官方推荐，免费额度充足）
- **定时任务**: Vercel Cron（无需管理服务器）

---

## 目录结构

```
F:\pingAurora/
├── src/
│   ├── app/
│   │   ├── page.tsx                      # 首页：极简一句话状态
│   │   ├── subscribe/page.tsx            # 订阅页
│   │   ├── unsubscribe/[token]/page.tsx # 退订页
│   │   ├── api/
│   │   │   ├── subscribe/route.ts        # POST 订阅
│   │   │   ├── unsubscribe/route.ts      # POST 退订
│   │   │   ├── check/route.ts            # GET/POST 定时检查触发
│   │   │   └── webhook/telegram/route.ts # Telegram Bot Webhook
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── SubscribeForm.tsx              # 订阅表单
│   │   ├── StatusBanner.tsx              # 首页一句话状态Banner
│   │   └── ui/                           # Tailwind 基础组件
│   ├── lib/
│   │   ├── prisma.ts                     # Prisma 客户端
│   │   ├── kp.ts                         # 获取 NOAA KP 指数
│   │   ├── weather.ts                    # 获取 Open-Meteo 晴朗度
│   │   ├── email.ts                      # AWS SES 发送邮件
│   │   ├── telegram.ts                   # Telegram Bot 发送消息
│   │   ├── scheduler.ts                  # 定时任务（node-cron）
│   │   └── cron-trigger.ts               # Railway cron 或手动触发检查
│   └── types/
│       └── index.ts
├── prisma/
│   └── schema.prisma
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## 数据库模型

```prisma
// prisma/schema.prisma
model Subscriber {
  id            String   @id @default(cuid())
  email         String?  @unique
  telegramId    String?  @unique  // Telegram Chat ID
  latitude      Float
  longitude     Float
  locationName  String   // "北京" / "Beijing"
  kpThreshold   Float    @default(6.0)
  clearSkyMin   Float    @default(70.0)  // 晴朗度最低要求 %
  isActive      Boolean  @default(false) // 邮件验证后才激活
  verifyToken   String?  @unique
  unsubscribeToken String @unique
  createdAt     DateTime @default(now())
  alerts        AlertLog[]
}

model AlertLog {
  id           String   @id @default(cuid())
  subscriberId String
  subscriber   Subscriber @relation(fields: [subscriberId], references: [id])
  kpValue      Float
  clearSky     Float
  sentAt       DateTime @default(now())
  channel      String   // 'email' | 'telegram'
  status       String   // 'sent' | 'failed'
}
```

---

## 触发逻辑（核心算法）

```typescript
// src/lib/scheduler.ts
// 每 10 分钟运行一次（通过 Railway Cron 或内部 node-cron）
import cron from 'node-cron';

export async function startScheduler() {
  cron.schedule('*/10 * * * *', async () => {
    await checkAndNotify();
  });
}

// src/lib/cron-trigger.ts
// Railway Cron Job 调用的端点（绕过休眠问题）
// 配置: GET https://your-app.railway.app/api/check
export async function checkAndNotify() {
  // 1. 获取当前 KP 值（取最近 3 条的平均）
  const kpData = await fetchNOAAKp();
  const currentKp = average(kpData.slice(-3).map(d => d.estimated_kp));

  // 2. 获取所有活跃订阅者
  const subs = await prisma.subscriber.findMany({ where: { isActive: true }});

  for (const sub of subs) {
    // 3. KP 达标？
    if (currentKp < sub.kpThreshold) continue;

    // 4. 取今晚 18:00-06:00 的晴朗度
    const sky = await fetchClearSky(sub.latitude, sub.longitude);
    const tonightClearSky = sky.filter(h => h.hour >= 18 || h.hour <= 6)
                                .reduce((max, h) => Math.max(max, 100 - h.cloud_cover), 0);

    // 5. 晴朗度达标？
    if (tonightClearSky < sub.clearSkyMin) continue;

    // 6. 6小时内发过？防重复
    const recent = await prisma.alertLog.findFirst({
      where: { subscriberId: sub.id, sentAt: { gte: new Date(Date.now() - 6 * 3600 * 1000) }}
    });
    if (recent) continue;

    // 7. 发送通知
    const msg = `🌌 极光警报！\n\n📍 ${sub.locationName}\n今晚有机会看到极光！\n\n当前活跃度: ${currentKp.toFixed(1)}/9\n今晚晴朗度: ${tonightClearSky.toFixed(0)}%\n\n收拾东西，出发吧 🚀`;

    if (sub.email) await sendEmail(sub.email, msg);
    if (sub.telegramId) await sendTelegram(sub.telegramId, msg);

    await prisma.alertLog.create({
      data: { subscriberId: sub.id, kpValue: currentKp, clearSky: tonightClearSky,
              channel: sub.telegramId ? 'telegram' : 'email', status: 'sent' }
    });
  }
}
```

---

## 通知文案（只有纯文字，零数据图表）

**Telegram 消息：**

```
🌌 极光警报！

📍 北京
今晚有机会看到极光！

今晚晴朗度: 85%
活跃度等级: 较强

出发吧 🚀

[退订](https://yourapp.vercel.app/unsubscribe/xxx)
```

**邮件主题**: `🌌 极光警报！今晚 [城市名] 有机会`
**邮件正文**: 同上，HTML 格式，加一行退订链接

---

## 前端页面（极简设计原则）

### 首页 `/` — 极简状态页

```
┌──────────────────────────────────────────┐
│                                          │
│           🌌  pingAurora                  │
│                                          │
│      ┌──────────────────────────┐        │
│      │   今 夜 不 适 合          │        │
│      │  极光活跃度：1/9         │        │
│      │  晴朗度：20%              │        │
│      └──────────────────────────┘        │
│                                          │
│      [订阅通知，我出发时你叫我]           │
│                                          │
│      已有 3,241 人订阅                   │
│                                          │
└──────────────────────────────────────────┘
```

> **原则：用户一眼扫完就知道今晚行不行。不需要任何图表。**

### 订阅页 `/subscribe`

```
┌──────────────────────────────────────────┐
│  第一步：选择通知方式                      │
│  [📧 邮件]    [✈️ Telegram]                │
│                                          │
│  第二步：输入你的位置                      │
│  [  输入城市，如「北京」  ]  [🔍 搜索]     │
│  （自动获取经纬度）                        │
│                                          │
│  第三步：设置灵敏度（可选）               │
│  极光活跃度阈值: [────●────] 6/9          │
│  晴朗度阈值:      [────●────] 70%         │
│                                          │
│  [ 立即订阅 ]                             │
└──────────────────────────────────────────┘
```

### Telegram Bot 交互

- 用户关注 Bot → Bot 发欢迎语 + 让你输入城市
- 用户发城市名 → Bot 调用地理编码 → 确认订阅
- 触发时 Bot 发推送消息

---

## 定时任务：如何绕过 Railway 休眠

Vercel 免费实例也会休眠，但 Vercel Cron 不依赖实例运行时间。解决方案：

**Vercel Cron Job（推荐）：**

```json
// vercel.json
{
  "crons": [{
    "path": "/api/check",
    "schedule": "*/10 * * * *"
  }]
}
```

Vercel cron 在服务端按时间触发，每次调用 `GET /api/check` 接口。配合 Neon Serverless 数据库，完全无需管理服务器。

---

## 部署步骤

### 1. 创建 Neon PostgreSQL 项目

访问 [neon.tech](https://neon.tech)，用 GitHub 登录，创建免费项目（3 GB 存储，支持 branch），获取 `DATABASE_URL`。

### 2. 创建 Telegram Bot

在 Telegram 找 `@BotFather`，发送 `/newbot`，获得 `TELEGRAM_BOT_TOKEN`。

### 3. Vercel 部署（推荐美国用户）

```bash
# 本地初始化
npx create-next-app@latest pingAurora --typescript --tailwind --app
cd pingAurora
npm install prisma @prisma/client node-telegram-bot-api @aws-sdk/client-ses node-cron
npx prisma init

# 连接 GitHub，Vercel 自动部署
```

### 4. 环境变量

```bash
# Railway 环境变量
DATABASE_URL="postgresql://user:password@xxx.neon.tech/neondb?sslmode=require"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
TELEGRAM_BOT_TOKEN="123456:ABCdef"
NEXT_PUBLIC_BASE_URL="https://your-app.vercel.app"
```

---

## 邮件 SMTP 方案（美国区推荐 AWS SES）


| 方案             | 免费额度          | 说明                         |
| -------------- | ------------- | -------------------------- |
| **AWS SES**    | 每月 62,000 封免费 | 美国区用户首选，发信量无限制，成本 $0.10/千封 |
| **Resend**     | 前 3000 封/月免费  | 无需邮箱验证，适合初期快速启动            |
| **Gmail SMTP** | 每天 500 封      | 小规模使用足够，需开启 2FA + 应用密码     |


> 面向美国用户，强烈推荐 AWS SES。SES 沙盒模式需在 AWS Console 申请提升发送上限（Production Access），审核通过后发信量无限制。

---

## 关键技术决策说明

1. **为什么不爬 aurora.umich.edu**: 该站本身就是前端聚合展示，数据全部来自 NOAA SWPC 和 Open-Meteo。直接调原始 API 更快、更稳定、更合规。
2. **为什么前端不展示图表**: 用户核心需求是"今晚能不能看到"，给一个结论就够了。任何数据展示都是噪音，会降低用户信任和使用意愿。
3. **为什么优先 Telegram**: 无频率限制、实时推送、无需邮件服务器，是极光通知的最佳渠道。
4. **为什么不单独做 Bot 项目**: Next.js 统一管理前端 + API + Bot Webhook，架构简单，部署成本低。

