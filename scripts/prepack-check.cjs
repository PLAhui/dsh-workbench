#!/usr/bin/env node
// 打包前自检：确认 package.json 里 dsh.bundle.patch 指向的文件真的进了包
// 起因：v1.1.0 的 files 白名单写成 lib/cordis.patch.yml（文件其实在根目录），
// 结果 cordis.patch.yml 没进包，安装时报 ENOENT。
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const dir = process.argv[2] || process.cwd()
const pkgPath = path.join(dir, 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))

const problems = []

// 1) dsh.bundle.patch 指向的文件必须存在
const patch = pkg.dsh && pkg.dsh.bundle && pkg.dsh.bundle.patch
if (!patch) {
  problems.push('package.json 缺少 dsh.bundle.patch')
} else if (!fs.existsSync(path.join(dir, patch))) {
  problems.push(`dsh.bundle.patch 指向的文件不存在: ${patch}`)
}

// 2) package.json 里 exports / main 引用的文件必须存在
const mustExist = []
if (pkg.main) mustExist.push(pkg.main)
if (pkg.exports) {
  for (const v of Object.values(pkg.exports)) {
    if (typeof v === 'string') mustExist.push(v)
    else if (v && typeof v === 'object') {
      for (const vv of Object.values(v)) if (typeof vv === 'string') mustExist.push(vv)
    }
  }
}
for (const f of mustExist) {
  if (f.includes('*')) continue
  if (!fs.existsSync(path.join(dir, f))) problems.push(`exports/main 指向的文件不存在: ${f}`)
}

// 3) files 白名单里的每条，要么命中至少一个文件，要么报错
const files = pkg.files || []
for (const pat of files) {
  if (pat.includes('*')) continue
  if (!fs.existsSync(path.join(dir, pat))) problems.push(`files 里写了不存在的路径: ${pat}`)
}

// 4) 真正打包，比对 patch 文件是否进包
let listed = []
try {
  const out = execSync('npm pack --dry-run --json', { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  const info = JSON.parse(out)
  listed = (info[0] && info[0].files || []).map((f) => f.path)
} catch (e) {
  problems.push('npm pack --dry-run 失败: ' + e.message)
}

// 归一化：npm 列出的路径不带 ./ 前缀
const norm = (p) => String(p || '').replace(/^\.\//, '')
if (patch && listed.length && !listed.map(norm).includes(norm(patch))) {
  problems.push(`关键文件没进包: ${patch}（files 白名单写错路径了？）`)
}

// 5) 私人数据扫描
const privateWords = ['储能', '张总', 'GB/T', '68.2', 'huiziqin']
const scanTargets = ['index.js', 'client.js', 'lib/stats.js', 'README.md', 'docs/DETAIL.md']
for (const f of scanTargets) {
  const p = path.join(dir, f)
  if (!fs.existsSync(p)) continue
  const s = fs.readFileSync(p, 'utf8')
  for (const w of privateWords) {
    if (s.includes(w)) problems.push(`${f} 里含私人数据: ${w}`)
  }
}

if (problems.length) {
  console.error('✗ 打包自检未通过：')
  for (const p of problems) console.error('  - ' + p)
  process.exit(1)
}
console.log('✓ 打包自检通过（' + listed.length + ' 个文件）')
