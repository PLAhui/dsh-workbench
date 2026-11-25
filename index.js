// 个人工作台 Host 半片：把 MNEMON 记忆、DSH 会话聚合成一个 /workbench/stats 接口。
// 读本机文件在这个进程里完成，浏览器只拿结果，不接触路径。
import { collectStats } from './lib/stats.js'

export const name = 'dsh-workbench'

export const inject = ['webServer', 'connection']

function json(res, status, body) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(JSON.stringify(body))
}

/** Web 服务不会替插件路由鉴权，自己走一遍 Host/Origin 与登录凭证检查。 */
function requestRejection(ctx, req) {
  const connection = ctx.get('connection')
  if (typeof connection?.requestRejection !== 'function') return 0
  return connection.requestRejection({ headers: req.headers })
}

export function apply(ctx) {
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'prefix',
        path: '/workbench',
        handler: async (req, res) => {
          try {
            const rejection = requestRejection(ctx, req)
            if (rejection) {
              json(res, rejection, { error: '未授权' })
              return
            }
            const url = new URL(req.url ?? '/', 'http://127.0.0.1')
            if (url.pathname !== '/workbench/stats') {
              json(res, 404, { error: 'not found' })
              return
            }
            // 这里原本把读到的旧缓存原样写回，缓存机制完全空转。
            // 本插件的 collectStats 只读本机文件（毫秒级），不需要缓存；
            // 真正的网络请求在客户端 fetch，由前端控制刷新节奏。
            const stats = await collectStats()
            json(res, 200, stats)
          } catch (err) {
            json(res, 200, { at: Date.now(), error: err.message })
          }
        },
      }),
    'dsh-workbench: /workbench/stats',
  )
}
