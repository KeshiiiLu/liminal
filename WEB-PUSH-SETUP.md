# Liminal Web Push · 阶段 1

本阶段只提供本设备订阅和手动测试通知。没有接入主动发送、回复、已读或聊天记录。

## 配置值

保留现有 Secret `LIMINAL_ACCESS_PASSWORD` 与 `LIMINAL_SESSION_SECRET`。

新增以下值：

| 名称 | Cloudflare 类型 | 格式 |
| --- | --- | --- |
| `LIMINAL_VAPID_PUBLIC_KEY` | Text 或 Secret | P-256 未压缩公钥的 base64url（65 字节） |
| `LIMINAL_VAPID_PRIVATE_KEY` | **Secret** | P-256 私钥标量的 base64url（32 字节） |
| `LIMINAL_VAPID_SUBJECT` | Text | 维护者真实邮箱 `mailto:you@example.com` 或 HTTPS 联系地址 |

公钥必须与私钥配对；不要使用登录密码或 Session Secret 代替。公钥会由已登录的配置 API 返回给浏览器。私钥仅在 Worker `env` 中读取。

没有配置 VAPID 时，通知 API 返回 503；原登录和静态页面继续沿用原安全检查，不会公开资源。

## 本地生成密钥

在 `D:\GitHub\liminal` 使用 Node 22 或更新版本运行：

```powershell
node worker/generate-vapid.mjs "mailto:你的实际邮箱"
```

这只生成根目录的 `.dev.vars.vapid`，不输出任何密钥值，已由 `.gitignore` 和 `.assetsignore` 的 `.dev.vars*` 排除。已有同名文件时拒绝覆盖。请直接在本地打开此文件，取等号后引号内的值填到 Cloudflare；**不要把私钥发到聊天、Git、截图或前端文件中**。

该辅助文件不是 Wrangler 默认读取的 `.dev.vars`。需要 Wrangler 本地测试时，在本地编辑原有 `.dev.vars` 并追加这三个值；保留其中现有登录 Secret。不要提交这些本地文件。正式部署不会自动上传本地密钥。

## Cloudflare 控制台与部署

1. 打开 Cloudflare → Workers & Pages → `liminal-private` → Settings → Variables and Secrets。
2. 增加上表三个值。私钥选择 **Secret**，不要选普通 Text。不要修改已有两项登录 Secret。
3. 保存；如控制台要求部署配置，请按控制台提示使变量在当前 Worker 生效。
4. 本轮代码准备完成后，由你主动运行部署或通过现有 GitHub 集成部署；本轮没有自动 deploy、commit 或 push。

现有 GitHub 集成继续使用仓库根目录，Build command 留空，Deploy command 使用 `npx wrangler deploy`。若集成固定了旧 Wrangler，需使用支持 SQLite Durable Objects 的 Wrangler 4。手动部署的命令也为 `npx wrangler deploy`。

`wrangler.jsonc` 仍保留根目录 Static Assets、`ASSETS` 与 `run_worker_first: true`，新增：

- `PUSH_DEVICES` Durable Object binding；类为 `LiminalPushDevice`。
- 一次性 Cloudflare 类迁移 `push-device-v1`，创建 SQLite-backed Durable Object。

这是 Cloudflare 的服务端类注册，与 `liminal_storage_schema_version` 无关，不执行浏览器数据迁移。首次部署由 Wrangler 创建对应 namespace/binding，不需要另外创建 D1、KV 或 R2。

`secrets.required` 保留现有两项。新增 VAPID 配置由通知 API 检查，以允许先部署代码再配置通知 Secret；未配置时通知不可用，原访问保护保持。

若部署报权限或 Durable Object 账户能力错误，按 Cloudflare 提示授权对应 Worker 部署账号并确认 SQLite Durable Objects 可用，不要删除访问保护或改成公开资源。

## iPhone 测试

使用 iOS 16.4 或更新版本。在 Cloudflare 的 HTTPS origin 登录后，Safari 分享 → 添加到主屏幕，然后从该图标打开。

1. Settings → 通知与来电 → 开启通知 → 允许系统通知。
2. 选择榛榛或 Jasper，点击立即测试；确认通知显示且点击后进入 `chat.html?person=...`。
3. 回到通知设置，点击 **20 秒后发送**，立刻切换到其他 App；等待通知。
4. 再次安排 20 秒测试，立刻锁屏；确认锁屏通知，解锁并点通知后进入对应 Chat。
5. 刷新/关闭再打开主屏幕 App，配置应仍显示本设备通知已开启。
6. 关闭通知后，服务器删除订阅、待发送测试与 Alarm，浏览器取消 Push Subscription。系统权限不会被代码撤销。
7. 安排延迟测试后，访问同 origin 的 `/__liminal/logout`；退出会先撤销当前设备订阅与 Alarm，再清除登录和设备 Cookie。推送服务已经接收的通知无法追回，撤销只阻止尚未发送的任务。
8. 重新登录后，在通知设置点击开启，可重用或重建浏览器订阅。无需变更聊天存档。

系统的专注模式、通知摘要、锁屏预览设置、网络和推送服务可能影响展示时间。“推送服务已接收”表示提供商返回成功，不能单独证明 iPhone 已显示。连续测试有至少 10 秒限流，且同设备同时只保留一条待发测试。

如果服务器撤销失败，退出接口返回 503 并要求重试，避免显示已退出但服务器订阅仍活跃。当前版本只有用户手动测试任务，没有周期性发送。

## Origin 与数据

GitHub Pages (`https://keshiilu.github.io/liminal/`) 和 Cloudflare origin 的 Cookie、localStorage、IndexedDB、Service Worker 和通知订阅相互独立。Pages 没有这些服务器 API，通知页面会显示无法连接通知服务，不会尝试公开测试推送。

旧 iPhone 图标若来自 Pages：先在那里导出完整备份，再到 Cloudflare 地址登录/导入，确认存档后从 Cloudflare 重新添加到主屏幕。此版本**不会自动清空、迁移或同步本地数据**。应使用同一个正式 origin，避免多个图标各自积累存档。

## Service Worker 与隐私

`sw.js` 没有 `fetch` 事件监听、Cache API 或离线缓存。它仅处理 push 和通知点击。脚本仍由原 Worker 登录鉴权保护；登录后点击开启时才注册，使用 `updateViaCache: "none"`。没有将任何私密资源改为公开。

Session 过期后后台更新脚本可能收到 401，重新登录后再次点击开启会重新注册/更新。服务器订阅授权期限取自当前已验证 Session，到期不发送测试；续期登录后点击开启可更新授权。

每次 push 都显示系统通知；测试不读取电子字卡语料。加密使用 RFC 8291 的 ECDH P-256 / HKDF-SHA256 / AES-128-GCM，VAPID 使用 RFC 8292 的 ES256。每次推送单独生成加密密钥，不复用 VAPID 签名私钥。

IndexedDB `liminal_push_inbox`（版本 1）预留空的 `messages` store，本阶段不往里面写业务消息。`testReceipts` 只保留最多 30 条已收到的测试事件 ID/人物/时间，按 eventId 去重。它不会写入 `liminal_chat_*`，现有 localStorage 备份不会包含测试收据或服务器订阅；以后真正接入后台聊天时需另行处理 inbox 导入与备份边界。

服务端只保存一个设备的 Push Subscription、当前 Session 授权截止时间、当前测试任务与最后测试状态，不保存完整聊天历史。允许的推送域名限定为 Apple、FCM、Mozilla、Windows 官方服务，禁止任意外部 URL 和重定向。

## 本地检查

```powershell
node --test worker/push.test.mjs
node --test worker/service-worker.test.mjs
node worker/index.test.mjs
```

前两项使用内存中随机测试密钥和模拟推送服务，不需要真实密钥、依赖或网络。第三项为原有鉴权测试，使用本地 `.dev.vars` 的登录测试 Secret，但不打印它们。

如本机已有 Wrangler，可执行 `wrangler dev` 做真实 Worker/DO 本地集成检查。iPhone 推送必须在已部署的可信 HTTPS 地址真机验证；本地测试不能证明 APNs 实际送达。

官方参考：

- [WebKit: Web Push for iOS Home Screen apps](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)
- [RFC 8291: Web Push Encryption](https://www.rfc-editor.org/rfc/rfc8291)
- [RFC 8292: VAPID](https://www.rfc-editor.org/rfc/rfc8292)
- [Cloudflare Durable Object Alarms](https://developers.cloudflare.com/durable-objects/api/alarms/)
- [Cloudflare Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
