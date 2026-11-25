// 数据源：MNEMON 记忆、DSH 会话。全部在 Host 进程内直接读本机文件，
// 不经过浏览器，也不起外挂服务。
import { readFile, readdir, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

const WEEK_MS = 7 * 86400 * 1000

export function dshHome(env = process.env) {
  return env.DSH_HOME || join(homedir(), '.dsh')
}

/** DSH 会话目录名是转义路径：--Users-someone-Code-~9879~76EE--
 *  ~XXXX 是 UTF-16 码位，'-' 同时充当路径分隔。 */
export function prettyProject(raw) {
  let name = String(raw).replace(/^--|--$/g, '')
  name = name.replace(/~([0-9A-Fa-f]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
  const parts = name.split('-')
  if (parts.length > 1 && (parts[0] === 'Users' || parts[0] === 'Volumes')) {
    return '/' + parts.join('/')
  }
  return name || raw
}

function parseISO(s) {
  if (!s) return null
  const t = Date.parse(String(s))
  return Number.isFinite(t) ? t : null
}

function isoDay(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

/** MNEMON 记忆与文档。读不到就当 0，不抛错。 */
export async function readMnemon(home = homedir(), now = Date.now()) {
  const cut = now - WEEK_MS
  const out = { memTotal: 0, memWeek: 0, docActive: 0, docWeek: 0, last: null, error: null }
  try {
    const raw = await readFile(join(home, '.mnemon', 'runtime', 'memories.json'), 'utf8')
    const entries = JSON.parse(raw)?.entries ?? []
    for (const e of entries) {
      out.memTotal++
      const t = parseISO(e.created_at || e.updated_at)
      if (t && t >= cut) {
        out.memWeek++
        if (!out.last || t > out.last) out.last = t
      }
    }
  } catch (err) {
    out.error = 'memories: ' + err.message
  }
  try {
    const raw = await readFile(join(home, '.mnemon', 'documents', 'index.json'), 'utf8')
    const docs = JSON.parse(raw)?.documents ?? []
    for (const d of docs) {
      if (d.status === 'active') out.docActive++
      const t = parseISO(d.createdAt || d.updatedAt)
      if (t && t >= cut) out.docWeek++
    }
  } catch (err) {
    out.error = (out.error ? out.error + '; ' : '') + 'documents: ' + err.message
  }
  return out
}

/** 近 7 天 DSH 会话数，按工作区聚合。 */
export async function readSessions(home = homedir(), now = Date.now()) {
  const cut = now - WEEK_MS
  const out = { week: 0, projects: [], projectCount: 0, error: null }
  const base = join(home, '.dsh', 'sessions')
  let dirs
  try {
    dirs = await readdir(base, { withFileTypes: true })
  } catch (err) {
    out.error = err.message
    return out
  }
  for (const d of dirs) {
    if (!d.isDirectory()) continue
    let names
    try {
      names = await readdir(join(base, d.name))
    } catch {
      continue
    }
    let n = 0
    for (const name of names) {
      if (!name.startsWith('session-')) continue
      try {
        const st = await stat(join(base, d.name, name))
        if (st.mtimeMs >= cut) n++
      } catch {
        /* 单个会话读不到不影响统计 */
      }
    }
    if (n) out.projects.push({ name: prettyProject(d.name), n })
  }
  out.projects.sort((a, b) => b.n - a.n)
  out.week = out.projects.reduce((s, p) => s + p.n, 0)
  out.projectCount = out.projects.length
  out.projects = out.projects.slice(0, 5)
  return out
}

/** 汇总成前端一次拿走的形状。任何一路失败都只降级，不整体失败。 */
export async function collectStats() {
  const [mnemon, sessions] = await Promise.all([readMnemon(), readSessions()])
  return {
    at: Date.now(),
    mnemon,
    sessions,
    week: { start: isoDay(new Date(Date.now() - WEEK_MS)) },
  }
}
