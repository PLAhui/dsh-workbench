// 个人工作台 Host 半片：把 MNEMON 记忆、DSH 会话聚合成一个 /workbench/stats 接口。
// 读本机文件在这个进程里完成，浏览器只拿结果，不接触路径。
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { collectStats, dshHome } from './lib/stats.js'

export const name = 'dsh-workbench'

export const inject = ['webServer', 'connection']

/** 缓存放 DSH_HOME 下，跟插件状态同域。 */
function cachePath() {
  return join(dshHome(), 'workbench', 'cache.json')
}

async function loadCache() {
  try {
    return JSON.parse(await readFile(cachePath(), 'utf8'))
  } catch {
    return {}
  }
}

async function saveCache(cache) {
  try {
    const p = cachePath()
    await mkdir(dirname(p), { recursive: true })
    await writeFile(p, JSON.stringify(cache), 'utf8')
  } catch {
    /* 缓存写不了不影响读数 */
  }
}

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
            const cache = await loadCache()
            const stats = await collectStats()
            await saveCache(cache)
            json(res, 200, stats)
          } catch (err) {
            json(res, 200, { at: Date.now(), error: err.message })
          }
        },
      }),
    'dsh-workbench: /workbench/stats',
  )
}
