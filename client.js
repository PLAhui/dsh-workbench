/* 个人工作台 — DSH 插件面板。Host 读本机数据，这里只负责渲染与交互。 */
window.__ModuleLoader__.load({
  id: '@plahui/dsh-workbench',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useEffect, useRef } = React
    const PKG = '@plahui/dsh-workbench'
    const PANEL_ID = PKG + ':panel'

    const HTML = "<div class=\"app\" id=\"wbApp\">\n\n  <!-- ================= 侧栏 ================= -->\n  <aside class=\"side\">\n    <div class=\"brand\">\n      <div class=\"dot\">工</div>\n      <div><b>个人工作台</b><small>每天三件 · 周末收口</small></div>\n    </div>\n\n    <nav class=\"nav\" id=\"nav\">\n      <button data-go=\"today\">今日聚焦</button>\n      <button data-go=\"inbox\">暂存区 <span class=\"badge\" id=\"navInboxBadge\">0</span></button>\n      <button data-go=\"tasks\">任务池</button>\n      <button data-go=\"week\">周计划 · 复盘</button>\n      <button data-go=\"sources\">数据源</button>\n    </nav>\n\n    <div class=\"side-card\">\n      <h5>今日已承诺</h5>\n      <div class=\"mini-count\" id=\"miniCount\">0<small>/3</small></div>\n      <div class=\"mini-list\" id=\"miniList\"></div>\n    </div>\n\n    <div class=\"side-card\">\n      <h5>一句话速记</h5>\n      <div class=\"quick-in\">\n        <input id=\"sideNote\" placeholder=\"想到就记…\" autocomplete=\"off\">\n        <button data-act=\"note-from-side\">存</button>\n      </div>\n    </div>\n\n    <div class=\"side-foot\">\n      <div class=\"save-status ok\" id=\"saveStatus\">✓ 已自动保存</div>\n    </div>\n  </aside>\n\n  <!-- ================= 主区 ================= -->\n  <main class=\"main\">\n    <header class=\"topbar\">\n      <div class=\"tabs\" id=\"tabs\">\n        <button data-go=\"today\">今日</button>\n        <button data-go=\"inbox\">暂存区</button>\n        <button data-go=\"tasks\">任务池</button>\n        <button data-go=\"week\">计划 · 复盘</button>\n        <button data-go=\"sources\">数据源</button>\n      </div>\n      <div class=\"filebar\">\n        <span class=\"save-status ok\" id=\"saveStatus2\">✓ 已自动保存</span>\n        <button class=\"ghost\" data-act=\"import\">导入</button>\n        <button class=\"ghost\" data-act=\"clear\">清空</button>\n        <button class=\"ghost\" data-act=\"export\">备份</button>\n        <input type=\"file\" id=\"fileInput\" accept=\"application/json\" hidden>\n      </div>\n    </header>\n\n    <div class=\"content\" id=\"content\">\n\n      <!-- ---------- 今日 ---------- -->\n      <section class=\"view active\" id=\"v-today\">\n        <div class=\"vhead\"><h2>今日</h2><p>目标置顶 · 三件居中 · 数据沉底。软提醒不强制，但周末会拿着账本找你。</p></div>\n\n        <div class=\"zone-label\"><span class=\"zn\">01</span> 长期目标 · 这几个月的方向</div>\n        <div class=\"north\" id=\"okrBar\"></div>\n\n        <div class=\"zone-label\"><span class=\"zn\">02</span> 今日聚焦 · 最多三件</div>\n        <div class=\"grid2\">\n          <div class=\"card\">\n            <h3>今日三件 <span class=\"count\" id=\"focusBadge\">0/3</span></h3>\n            <div id=\"focusList\"></div>\n            <div id=\"carryBox\"></div>\n            <div class=\"addline\">\n              <input id=\"focusNew\" placeholder=\"加一件今天必须推进的事（回车）\" autocomplete=\"off\">\n            </div>\n            <div class=\"over-hint\" id=\"overHint\" hidden>⚠ 已超出 3 件。不拦你，但周末复盘会记着这笔。</div>\n            <div class=\"q2-hint\" id=\"q2Hint\"></div>\n            <div class=\"streak\">🔥 连续聚焦 <b id=\"streakNum\">0</b> 天 · <span id=\"streakNote\">今天完成一件就点亮</span></div>\n          </div>\n          <div class=\"card\">\n            <h3>快速笔记 <span class=\"count\">统一进暂存区</span></h3>\n            <div class=\"addline\" style=\"margin-top:0\">\n              <input id=\"quickNote\" placeholder=\"输入时不分类…\" autocomplete=\"off\">\n              <button class=\"go-btn\" data-act=\"note-from-quick\">存</button>\n            </div>\n            <div class=\"quick-list\" id=\"quickList\"></div>\n            <div class=\"sub-h\">里程碑 · 本周</div>\n            <div id=\"milestoneList\"></div>\n          </div>\n        </div>\n\n        <div class=\"zone-label\"><span class=\"zn\">03</span> 数据沉底 · 真实数据 + 本周进度</div>\n        <div class=\"bottom-grid\">\n          <div class=\"card mini-card\">\n            <h4>本周进度</h4>\n            <div class=\"bigline\" id=\"weekPct\">0%<small>计划完成</small></div>\n            <p id=\"weekPctNote\">还没有本周计划</p>\n            <button class=\"linkbtn\" data-go=\"week\">查看周计划 · 复盘 →</button>\n          </div>\n          <div class=\"card mini-card\">\n            <h4>本周节奏</h4>\n            <div class=\"rhythm\" id=\"rhythmList\"></div>\n            <button class=\"linkbtn\" data-go=\"tasks\">任务池 →</button>\n          </div>\n          <div class=\"card mini-card\">\n            <h4>知识信号 <span class=\"ro-tag\" id=\"knowSrc\">MNEMON · 只读</span></h4>\n            <p id=\"knowMeta\">未接入 · 数据源可手动填</p>\n            <button class=\"linkbtn\" data-go=\"sources\">数据源 →</button>\n          </div>\n        </div>\n      </section>\n\n      <!-- ---------- 暂存区 ---------- -->\n      <section class=\"view\" id=\"v-inbox\">\n        <div class=\"vhead\"><h2>暂存区</h2><p>输入即存、不当场分类；每天集中分流一次，顺手标个象限。</p></div>\n        <div class=\"quad-legend\">\n          <span class=\"q1\">Q1 重要紧急 → 今日候选</span>\n          <span class=\"q2\">Q2 重要不紧急 → 排进任务池</span>\n          <span class=\"q3\">Q3 紧急不重要 → 批量/委托</span>\n          <span class=\"q4\">Q4 不重要不紧急 → 删/搁置</span>\n        </div>\n        <div class=\"inbox-add\">\n          <input id=\"inboxInput\" placeholder=\"一句话速记…（回车存）\" autocomplete=\"off\">\n          <button data-act=\"note-from-inbox\">存</button>\n        </div>\n        <div id=\"inboxList\"></div>\n      </section>\n\n      <!-- ---------- 任务池 ---------- -->\n      <section class=\"view\" id=\"v-tasks\">\n        <div class=\"vhead\"><h2>任务池</h2><p>按标签组织，不按文件夹；列表 / 看板 / 日历是同一份数据的三种看法。</p></div>\n        <div class=\"tagbar\" id=\"tagbar\"></div>\n        <datalist id=\"tagSuggest\"></datalist>\n        <div class=\"tabs-sub\" id=\"taskTabs\">\n          <button class=\"active\" data-pane=\"list\">列表</button>\n          <button data-pane=\"board\">看板</button>\n          <button data-pane=\"cal\">日历</button>\n        </div>\n        <div class=\"task-hint\">搁置的任务不会自己消失——<b>进今日</b>放进三件、<b>进本周</b>放进周计划、右边日期一选就上日历。搁置只是「先不做」，不是「不用做」。</div><div class=\"task-pane active\" id=\"pane-list\">\n          <div class=\"tlist\" id=\"taskList\"></div>\n          <div class=\"addline\">\n            <input id=\"taskNew\" placeholder=\"加一条任务（回车）\" autocomplete=\"off\">\n          </div>\n        </div>\n        <div class=\"task-pane\" id=\"pane-board\">\n          <div class=\"kanban\" id=\"board\"></div>\n        </div>\n        <div class=\"task-pane\" id=\"pane-cal\">\n          <div class=\"cal-nav\" id=\"calNav\"></div><div class=\"cal\" id=\"cal\"></div>\n        </div>\n      </section>\n\n      <!-- ---------- 周计划 · 复盘 ---------- -->\n      <section class=\"view\" id=\"v-week\">\n        <div class=\"vhead\"><h2>周计划 · 周复盘</h2><p>周初定计划 → 每天拆进聚焦 → 周末对照账本收口 → 未完成流进下周。</p></div>\n        <div class=\"tabs-sub\" id=\"weekTabs\">\n          <button class=\"active\" data-wpane=\"plan\">本周计划</button>\n          <button data-wpane=\"review\">周末复盘</button>\n        </div>\n\n        <div class=\"task-pane active\" id=\"wplan-plan\">\n          <div id=\"planStale\"></div>\n          <div class=\"review-box\">\n            <div class=\"plan-theme\" id=\"planTheme\" contenteditable=\"true\"></div>\n            <div class=\"sub-h\">本周三件 · 计划 → 拆进每日聚焦</div>\n            <div id=\"planItems\"></div>\n            <div class=\"addline\">\n              <input id=\"planNew\" placeholder=\"加一条本周要推进的事（回车）\" autocomplete=\"off\">\n            </div>\n            <div class=\"sub-h\">上周顺延进来 · 优先消化</div>\n            <div id=\"planCarry\"></div>\n            <div class=\"plan-note\">计划只在周初定一次。周中临时冒出来的事走暂存区，不改这里的主题。</div>\n            <div class=\"loop-note\">↳ 顺延项由「今日三件」里被推迟的事自动汇入，不用手抄。</div>\n          </div>\n        </div>\n\n        <div class=\"task-pane\" id=\"wplan-review\">\n          <div class=\"auto-note\">◷ 没有后台定时器：打开这一页就会重算本周账本，点下面按钮生成草稿。</div>\n          <div class=\"review-box\">\n            <h3>本周收口 · 对照计划</h3>\n            <div class=\"rstat\" id=\"rstat\"></div>\n            <div class=\"rlist\" id=\"rlist\"></div>\n            <div class=\"loop-note\" id=\"loopNote\"></div>\n            <button class=\"ghost\" style=\"margin-top:12px\" data-act=\"gen-review\">生成本周复盘草稿</button>\n          </div>\n          <div class=\"review-box summary\">\n            <h3>一句话小结</h3>\n            <textarea id=\"reviewNote\" placeholder=\"这周最重要的一件事是……\"></textarea>\n          </div>\n        </div>\n      </section>\n\n      <!-- ---------- 数据源 ---------- -->\n      <section class=\"view\" id=\"v-sources\">\n        <div class=\"vhead\"><h2>数据源</h2><p>只读接入，不回写任何外部系统。MNEMON 与会话都读本机文件，不联网。</p></div>\n        <div class=\"src-fresh\" id=\"liveBar\"></div>\n        <div id=\"sourceList\"></div>\n        <div class=\"note-foot\">\n          本机数据（MNEMON / DSH 会话）由插件在 DSH 主进程内直接读取，浏览器拿不到这些文件，也不产生任何网络请求。\n        </div>\n      </section>\n\n    </div>\n  </main>\n</div>\n\n<!-- 单点聚焦 -->\n<div class=\"focus-overlay\" id=\"focusOverlay\">\n  <div class=\"focus-panel\">\n    <div class=\"fp-label\">单点聚焦 · 一次只做一件</div>\n    <div class=\"fp-title\" id=\"fpTitle\"></div>\n    <div class=\"fp-sub\">先做 2 分钟就够了——启动比完成更重要</div>\n    <div class=\"fp-timer\" id=\"fpTimer\">02:00</div>\n    <div class=\"fp-bar\"><i id=\"fpBar\" style=\"width:100%\"></i></div>\n    <div class=\"fp-ops\">\n      <button class=\"primary\" data-act=\"fp-done\">✓ 做完了</button>\n      <button data-act=\"fp-again\">继续 2 分钟</button>\n      <button class=\"defer\" data-act=\"fp-defer\">今天顺延</button>\n      <button data-act=\"fp-exit\">退出</button>\n    </div>\n    <div class=\"fp-hint\">计时结束不强制停，只提醒：你已经跨过最难的第一步</div>\n  </div>\n</div>\n\n<div class=\"toast\" id=\"toast\"></div>"
    const CSS = ".wb-root{\n  --bg:#f6f7f5; --paper:#fff; --line:#e3e6e2; --line2:#eef0ed;\n  --ink:#1d2321; --sub:#6d7a75; --mute:#9aa5a1;\n  --accent:#2f6f66; --accent-soft:#e8f1ef;\n  --warn:#c46a3f; --warn-soft:#fbf0ea;\n  --q1:#c0492f; --q2:#2f6f66; --q3:#a8802f; --q4:#7b8794;\n  --radius:12px; --shadow:0 1px 2px rgba(20,30,28,.05);\n}.wb-root *{box-sizing:border-box}.wb-root, .wb-root{height:100%}.wb-root{\n  margin:0;background:var(--bg);color:var(--ink);\n  font:14px/1.6 -apple-system,BlinkMacSystemFont,\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft YaHei\",sans-serif;\n  -webkit-font-smoothing:antialiased;\n}.wb-root button{font:inherit;color:inherit;cursor:pointer;border:none;background:none}.wb-root input, .wb-root textarea, .wb-root select{font:inherit;color:inherit}.wb-root .app{display:flex;height:100%;overflow:hidden}.wb-root .side{\n  width:238px;flex:0 0 238px;background:#fbfcfb;border-right:1px solid var(--line);\n  display:flex;flex-direction:column;padding:16px 12px 10px;\n}.wb-root .brand{display:flex;align-items:center;gap:9px;padding:2px 6px 14px}.wb-root .brand .dot{width:22px;height:22px;border-radius:7px;background:var(--accent);display:grid;place-items:center;color:#fff;font-size:12px;font-weight:700}.wb-root .brand b{font-size:14.5px;letter-spacing:.2px}.wb-root .brand small{display:block;color:var(--mute);font-size:11px;font-weight:400;line-height:1.3}.wb-root .nav{display:flex;flex-direction:column;gap:2px;margin-bottom:14px}.wb-root .nav button{\n  display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;\n  color:var(--sub);font-size:13.5px;text-align:left;white-space:nowrap;\n  transition:background .12s,color .12s;\n}.wb-root .nav button:hover{background:#f0f2f0;color:var(--ink)}.wb-root .nav button.active{background:var(--accent-soft);color:var(--accent);font-weight:600}.wb-root .nav .badge{\n  margin-left:auto;min-width:19px;height:19px;padding:0 5px;border-radius:10px;\n  background:#e6e9e6;color:var(--sub);font-size:11px;font-weight:600;\n  display:grid;place-items:center;\n}.wb-root .nav button.active .badge{background:#fff;color:var(--accent)}.wb-root .side-card{background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:10px 11px;margin-bottom:10px}.wb-root .side-card h5{margin:0 0 7px;font-size:11px;font-weight:600;color:var(--mute);letter-spacing:.5px}.wb-root .mini-count{font-size:19px;font-weight:700;letter-spacing:-.5px}.wb-root .mini-count.over{color:var(--warn)}.wb-root .mini-count small{font-size:11px;font-weight:500;color:var(--mute);margin-left:3px}.wb-root .mini-list{margin-top:7px;display:flex;flex-direction:column;gap:5px}.wb-root .mini-list div{font-size:12px;color:var(--sub);line-height:1.45;overflow:hidden;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical}.wb-root .mini-list .qempty{color:var(--mute);font-style:normal}.wb-root .quick-in{display:flex;gap:6px;margin-top:2px}.wb-root .quick-in input{\n  flex:1;min-width:0;border:1px solid var(--line);border-radius:7px;padding:6px 8px;\n  font-size:12.5px;background:#fff;outline:none;\n}.wb-root .quick-in input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}.wb-root .quick-in button{background:var(--accent);color:#fff;border-radius:7px;padding:0 10px;font-size:12.5px;font-weight:600}.wb-root .side-foot{margin-top:auto;padding-top:10px;border-top:1px solid var(--line2)}.wb-root .main{flex:1;display:flex;flex-direction:column;min-width:0}.wb-root .topbar{\n  display:flex;align-items:center;gap:14px;padding:0 22px;height:52px;\n  border-bottom:1px solid var(--line);background:#fff;flex:0 0 52px;\n}.wb-root .tabs{display:flex;gap:2px}.wb-root .tabs button{padding:6px 12px;border-radius:7px;font-size:13px;color:var(--sub);white-space:nowrap}.wb-root .tabs button:hover{background:#f3f5f3}.wb-root .tabs button.active{background:#eff3f1;color:var(--ink);font-weight:600}.wb-root .filebar{margin-left:auto;display:flex;align-items:center;gap:8px}.wb-root .save-status{font-size:11.5px;color:var(--mute);white-space:nowrap}.wb-root .save-status.ok{color:var(--accent)}.wb-root .save-status.dirty{color:var(--warn)}.wb-root .ghost{\n  border:1px solid var(--line);border-radius:7px;padding:4px 9px;\n  font-size:11.5px;color:var(--sub);background:#fff;transition:.12s;\n}.wb-root .ghost:hover{border-color:var(--mute);color:var(--ink)}.wb-root .content{flex:1;overflow-y:auto;padding:20px 22px 60px}.wb-root .view{display:none;max-width:1080px;margin:0 auto}.wb-root .view.active{display:block}.wb-root .vhead{margin-bottom:16px}.wb-root .vhead h2{margin:0 0 3px;font-size:19px;letter-spacing:-.3px}.wb-root .vhead p{margin:0;color:var(--sub);font-size:12.5px}.wb-root .zone-label{display:flex;align-items:center;gap:8px;margin:20px 0 9px;font-size:11.5px;font-weight:600;color:var(--sub);letter-spacing:.4px}.wb-root .zone-label .zn{background:#e9ecea;color:var(--sub);border-radius:5px;padding:1px 5px;font-size:10.5px}.wb-root .zone-label:first-of-type{margin-top:0}.wb-root .card{background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);padding:14px 15px;box-shadow:var(--shadow);min-width:0}.wb-root .card h3{margin:0 0 11px;font-size:13.5px;display:flex;align-items:center;gap:8px}.wb-root .card h4{margin:0 0 8px;font-size:12px;color:var(--sub);font-weight:600;display:flex;align-items:center;gap:6px}.wb-root .count{font-size:11px;font-weight:500;color:var(--mute);background:#f2f4f2;border-radius:5px;padding:1px 6px}.wb-root .count.over{background:var(--warn-soft);color:var(--warn)}.wb-root .grid2{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:13px}@media(max-width:900px){.wb-root .grid2{grid-template-columns:1fr}}.wb-root .north{display:grid;grid-template-columns:repeat(3,1fr);gap:11px}@media(max-width:900px){.wb-root .north{grid-template-columns:1fr}}.wb-root .okr{background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:11px 12px;box-shadow:var(--shadow)}.wb-root .okr-top{display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:8px;padding-right:20px}.wb-root .okr-top b{font-size:12.5px;line-height:1.35;min-width:0;overflow-wrap:anywhere}.wb-root .okr-top span{font-size:12px;font-weight:700;color:var(--accent);white-space:nowrap}.wb-root .bar{height:5px;background:#eceeeb;border-radius:3px;overflow:hidden}.wb-root .bar i{display:block;height:100%;background:var(--accent);border-radius:3px;transition:width .3s}.wb-root .okr-meta{margin-top:7px;font-size:11px;color:var(--mute);min-height:15px}.wb-root .okr-top b:empty::before{content:\"新目标（点这里改）\";color:var(--mute);font-weight:400}.wb-root .okr-meta:empty::before{content:\"点这里写里程碑\";color:#c2c9c6}.wb-root .okr{position:relative}.wb-root .okr-del{\n  position:absolute;top:6px;right:6px;width:18px;height:18px;line-height:1;border-radius:5px;\n  color:var(--mute);font-size:14px;opacity:0;transition:.12s;\n}.wb-root .okr:hover .okr-del{opacity:1}.wb-root .okr-del:hover{color:var(--warn);background:var(--warn-soft)}.wb-root .okr-add{\n  display:grid;place-items:center;border-style:dashed;background:transparent;\n  color:var(--mute);font-size:12px;cursor:pointer;box-shadow:none;min-height:78px;transition:.12s;\n}.wb-root .okr-add:hover{border-color:var(--accent);color:var(--accent);background:#fbfdfc}.wb-root .trow{display:flex;align-items:center;gap:9px;padding:8px 6px;border-radius:8px;transition:background .12s}.wb-root .trow:hover{background:#fafbfa}.wb-root .trow+.trow{border-top:1px solid var(--line2)}.wb-root .trow input[type=checkbox]{width:15px;height:15px;accent-color:var(--accent);flex:0 0 auto;cursor:pointer}.wb-root .trow .title{flex:1;font-size:13px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;word-break:break-all}.wb-root .trow.done .title{text-decoration:line-through;color:var(--mute)}.wb-root .trow.over{background:var(--warn-soft)}.wb-root .pill{font-size:10.5px;color:var(--sub);background:#f2f4f2;border-radius:5px;padding:1px 6px;white-space:nowrap}.wb-root .defer-badge{font-size:10px;color:var(--warn);background:var(--warn-soft);border-radius:5px;padding:1px 5px;white-space:nowrap}.wb-root .go-btn{\n  font-size:11px;color:var(--accent);border:1px solid #cfe0dc;background:var(--accent-soft);\n  border-radius:6px;padding:2px 8px;white-space:nowrap;font-weight:600;\n}.wb-root .go-btn:hover{background:#dcebe7}.wb-root .icon-del{color:var(--mute);font-size:15px;line-height:1;padding:0 3px;border-radius:4px}.wb-root .icon-del:hover{color:var(--warn);background:var(--warn-soft)}.wb-root .trow.celebrate{animation:pop .45s ease}@keyframes pop{0%{transform:scale(1)}35%{transform:scale(1.015)}100%{transform:scale(1)}}.wb-root .addline{display:flex;gap:6px;margin-top:9px}.wb-root .addline input{flex:1;min-width:0;border:1px dashed var(--line);border-radius:7px;padding:6px 9px;font-size:12.5px;background:transparent;outline:none}.wb-root .addline input:focus{border-style:solid;border-color:var(--accent);background:#fff}.wb-root .over-hint{margin-top:8px;font-size:11.5px;color:var(--warn);background:var(--warn-soft);border-radius:6px;padding:6px 9px}.wb-root .q2-hint{margin-top:9px;font-size:11.5px;color:var(--sub);background:#f5f7f5;border-radius:6px;padding:6px 9px}.wb-root .q2-hint.met{color:var(--accent);background:var(--accent-soft)}.wb-root .streak{margin-top:11px;padding-top:10px;border-top:1px solid var(--line2);font-size:11.5px;color:var(--sub)}.wb-root .streak b{color:var(--warn);font-size:13px}.wb-root .quick-list{display:flex;flex-direction:column;gap:6px;margin-top:9px}.wb-root .quick-list div{font-size:12px;color:var(--sub);background:#f8f9f8;border-radius:6px;padding:5px 8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.wb-root .quick-list .qempty{color:var(--mute);background:none;padding:2px 0}.wb-root .sub-h{margin:13px 0 7px;font-size:11px;font-weight:600;color:var(--mute);letter-spacing:.4px}.wb-root .mile{display:flex;align-items:center;gap:7px;font-size:12px;color:var(--sub);padding:3px 0}.wb-root .mdot{width:5px;height:5px;border-radius:50%;background:var(--accent);flex:0 0 auto}.wb-root .mile span:last-child{margin-left:auto;color:var(--mute);font-size:11px}.wb-root .bottom-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:11px}@media(max-width:1100px){.wb-root .bottom-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:640px){.wb-root .bottom-grid{grid-template-columns:1fr}}.wb-root .mini-card{min-height:118px;display:flex;flex-direction:column}.wb-root .bigline{font-size:25px;font-weight:700;letter-spacing:-1px;line-height:1.15}.wb-root .bigline small{font-size:11px;font-weight:500;color:var(--mute);margin-left:3px;letter-spacing:0}.wb-root .mini-card p{margin:4px 0 0;font-size:11.5px;color:var(--sub);line-height:1.5}.wb-root .ro-tag{font-size:9.5px;font-weight:500;color:var(--mute);border:1px solid var(--line);border-radius:4px;padding:0 4px}.wb-root .rhythm{display:flex;flex-direction:column;gap:4px;margin-top:2px}.wb-root .rhythm div{font-size:11.5px;color:var(--sub);display:flex;gap:6px}.wb-root .rhythm div span:last-child{margin-left:auto;color:var(--mute);white-space:nowrap}.wb-root .linkbtn{margin-top:auto;padding-top:8px;font-size:11.5px;color:var(--accent);text-align:left}.wb-root .linkbtn:hover{text-decoration:underline}.wb-root .quad-legend{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:12px}.wb-root .quad-legend span{font-size:10.5px;border-radius:5px;padding:2px 7px;border:1px solid transparent}.wb-root .quad-legend .q1{color:var(--q1);background:#fbeeea;border-color:#f2d6cd}.wb-root .quad-legend .q2{color:var(--q2);background:var(--accent-soft);border-color:#cfe4df}.wb-root .quad-legend .q3{color:var(--q3);background:#fbf5e8;border-color:#efe0c4}.wb-root .quad-legend .q4{color:var(--q4);background:#f1f3f4;border-color:#e0e4e6}.wb-root .inbox-add{display:flex;gap:7px;margin-bottom:12px}.wb-root .inbox-add input{flex:1;border:1px solid var(--line);border-radius:8px;padding:9px 11px;background:#fff;outline:none}.wb-root .inbox-add input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}.wb-root .inbox-add button{background:var(--accent);color:#fff;border-radius:8px;padding:0 15px;font-weight:600}.wb-root .inbox-item{\n  display:flex;align-items:center;gap:9px;background:var(--paper);border:1px solid var(--line);\n  border-radius:9px;padding:9px 11px;margin-bottom:7px;box-shadow:var(--shadow);\n}.wb-root .inbox-item .txt{flex:1;font-size:13px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;word-break:break-all}.wb-root .quad-select{\n  border:1px solid var(--line);border-radius:6px;padding:3px 5px;font-size:11px;\n  background:#fff;color:var(--sub);outline:none;max-width:132px;\n}.wb-root .quad-select.q1{color:var(--q1);border-color:#efd3c9;background:#fdf3ef}.wb-root .quad-select.q2{color:var(--q2);border-color:#cfe4df;background:var(--accent-soft)}.wb-root .quad-select.q3{color:var(--q3);border-color:#ecdcbe;background:#fcf7ec}.wb-root .quad-select.q4{color:var(--q4);border-color:#e0e4e6;background:#f4f6f7}.wb-root .quad-tip{font-size:10.5px;color:var(--mute);white-space:nowrap;min-width:0}.wb-root .ops{display:flex;gap:4px}.wb-root .ops button{font-size:11px;color:var(--sub);border:1px solid var(--line);border-radius:6px;padding:2px 7px;background:#fff}.wb-root .ops button:hover{border-color:var(--accent);color:var(--accent)}.wb-root .ops button.danger:hover{border-color:var(--warn);color:var(--warn)}.wb-root .tagbar{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:11px}.wb-root .tagbar button{font-size:11.5px;color:var(--sub);border:1px solid var(--line);border-radius:14px;padding:3px 10px;background:#fff}.wb-root .tagbar button.active{background:var(--accent);color:#fff;border-color:var(--accent)}.wb-root .tabs-sub{display:flex;gap:3px;margin-bottom:11px;border-bottom:1px solid var(--line)}.wb-root .tabs-sub button{font-size:12.5px;color:var(--sub);padding:6px 11px;border-bottom:2px solid transparent;margin-bottom:-1px}.wb-root .tabs-sub button.active{color:var(--ink);font-weight:600;border-bottom-color:var(--accent)}.wb-root .task-pane{display:none}.wb-root .task-pane.active{display:block}.wb-root .tlist{background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow)}.wb-root .tlist-row{display:flex;align-items:center;gap:10px;padding:9px 13px;font-size:13px}.wb-root .tlist-row+.tlist-row{border-top:1px solid var(--line2)}.wb-root .tlist-row:hover{background:#fafbfa}.wb-root .tlist-row.done .nm{text-decoration:line-through;color:var(--mute)}.wb-root .st{width:8px;height:8px;border-radius:50%;flex:0 0 auto;cursor:pointer;border:1.5px solid var(--mute);background:#fff}.wb-root .st.doing{border-color:var(--accent);background:var(--accent)}.wb-root .st.done{border-color:var(--accent);background:var(--accent-soft)}.wb-root .tlist-row .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;word-break:break-all}.wb-root .tag{font-size:10.5px;color:var(--sub);background:#f2f4f2;border-radius:5px;padding:1px 6px;white-space:nowrap}.wb-root .due{font-size:11px;color:var(--mute);white-space:nowrap;min-width:38px;text-align:right}.wb-root .due.today{color:var(--warn);font-weight:600}.wb-root .kanban{display:grid;grid-template-columns:repeat(3,1fr);gap:11px}@media(max-width:820px){.wb-root .kanban{grid-template-columns:1fr}}.wb-root .col{background:#f4f6f4;border-radius:10px;padding:10px}.wb-root .col h4{margin:0 0 8px;font-size:11.5px;color:var(--sub);display:flex;justify-content:space-between}.wb-root .tcard{background:#fff;border:1px solid var(--line);border-radius:8px;padding:8px 10px;margin-bottom:7px;font-size:12.5px;box-shadow:var(--shadow)}.wb-root .tcard .tnm{display:block;margin-bottom:4px;line-height:1.4;overflow-wrap:anywhere;word-break:break-word}.wb-root .tcard .m{display:flex;gap:6px;font-size:10.5px;color:var(--mute)}.wb-root .cal{display:grid;grid-template-columns:repeat(7,1fr);gap:7px}@media(max-width:820px){.wb-root .cal{grid-template-columns:repeat(4,1fr)}}.wb-root .day{background:var(--paper);border:1px solid var(--line);border-radius:9px;padding:7px;min-height:96px;box-shadow:var(--shadow)}.wb-root .day.today{border-color:var(--accent);background:#fbfdfc}.wb-root .dh{display:flex;justify-content:space-between;align-items:baseline;font-size:10.5px;color:var(--mute);margin-bottom:5px}.wb-root .day.today .dh{color:var(--accent);font-weight:700}.wb-root .dh b{font-size:13px}.wb-root .ce{font-size:10.5px;background:#f2f4f2;border-radius:4px;padding:2px 4px;margin-bottom:3px;line-height:1.35;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow-wrap:anywhere}.wb-root .ce.doing{background:var(--accent-soft);color:var(--accent)}.wb-root .ce.done{text-decoration:line-through;color:var(--mute)}.wb-root .empty-d{font-size:10.5px;color:#c6ccc9}.wb-root .review-box{background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);padding:15px;margin-bottom:12px;box-shadow:var(--shadow)}.wb-root .plan-theme{\n  font-size:13.5px;font-weight:600;padding:8px 10px;border-radius:8px;\n  border:1px dashed var(--line);outline:none;margin-bottom:4px;\n}.wb-root .plan-theme:focus{border-style:solid;border-color:var(--accent);background:#fbfdfc}.wb-root .plan-theme:empty::before{content:\"点这里写本周主题…\";color:var(--mute);font-weight:400}.wb-root .plan-row{display:flex;align-items:center;gap:9px;padding:7px 4px;font-size:13px}.wb-root .plan-row+.plan-row{border-top:1px solid var(--line2)}.wb-root .plan-row input[type=checkbox]{width:15px;height:15px;accent-color:var(--accent);cursor:pointer}.wb-root .plan-row.done .nm{text-decoration:line-through;color:var(--mute)}.wb-root .pn{width:17px;height:17px;border-radius:50%;background:#eff2f0;color:var(--sub);font-size:10.5px;font-weight:700;display:grid;place-items:center;flex:0 0 auto}.wb-root .plan-row .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;word-break:break-all}.wb-root .carry-row{font-size:12px;color:var(--warn);background:var(--warn-soft);border-radius:6px;padding:7px 10px;margin-top:4px}.wb-root .plan-note, .wb-root .loop-note{font-size:11.5px;color:var(--mute);margin-top:11px;line-height:1.6}.wb-root .loop-note{color:var(--sub);background:#f6f8f6;border-radius:6px;padding:8px 10px}.wb-root .rstat{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin:11px 0}.wb-root .rstat .s{background:#f7f9f7;border-radius:8px;padding:9px;text-align:center}.wb-root .rstat .s b{display:block;font-size:18px;letter-spacing:-.5px}.wb-root .rstat .s span{font-size:10.5px;color:var(--mute)}.wb-root .rlist{display:flex;flex-direction:column;gap:5px;font-size:12.5px;color:var(--sub)}.wb-root .summary textarea{\n  width:100%;min-height:74px;border:1px solid var(--line);border-radius:8px;\n  padding:9px 11px;font-size:12.5px;resize:vertical;outline:none;background:#fff;\n}.wb-root .summary textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}.wb-root .auto-note{font-size:11px;color:var(--sub);background:#f6f8f6;border-radius:6px;padding:6px 10px;margin-bottom:10px}.wb-root .src{display:flex;align-items:center;gap:11px;background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:12px 14px;margin-bottom:9px;box-shadow:var(--shadow)}.wb-root .src .logo{width:31px;height:31px;border-radius:9px;background:#eff2f0;color:var(--sub);display:grid;place-items:center;font-weight:700;font-size:13px;flex:0 0 auto}.wb-root .src .info{flex:1;min-width:0}.wb-root .src h4{margin:0 0 2px;font-size:13px;color:var(--ink)}.wb-root .src p{margin:0;font-size:11.5px;color:var(--sub)}.wb-root .ro{font-size:10px;color:var(--mute);border:1px solid var(--line);border-radius:4px;padding:1px 5px;white-space:nowrap}.wb-root .ro.live{color:var(--accent);border-color:#bcd8d2;background:#f2f8f6}.wb-root .ro.err{color:var(--warn);border-color:#e6cbc0;background:#fdf5f2}.wb-root .src .src-state{font-size:11px;color:var(--mute);margin-top:5px}.wb-root .src .src-state.ok{color:var(--accent)}.wb-root .src .src-state.bad{color:var(--warn)}.wb-root .src-fresh{display:flex;align-items:center;gap:9px;margin-bottom:12px;font-size:11.5px;color:var(--mute)}.wb-root .src-fresh button{border:1px solid var(--line);background:var(--paper);border-radius:6px;padding:3px 9px;font-size:11.5px;color:var(--sub)}.wb-root .src-fresh button:hover{border-color:var(--accent);color:var(--accent)}.wb-root .note-foot{margin-top:16px;font-size:11px;color:var(--mute);line-height:1.7}.wb-root .empty{padding:26px 10px;text-align:center;color:var(--mute);font-size:12.5px;line-height:1.7}.wb-root .empty b{display:block;color:var(--sub);font-size:13px;margin-bottom:3px}.wb-root .focus-overlay{\n  position:fixed;inset:0;background:rgba(24,32,30,.42);backdrop-filter:blur(3px);\n  display:none;place-items:center;z-index:60;\n}.wb-root .focus-overlay.open{display:grid}.wb-root .focus-panel{\n  background:#fff;border-radius:16px;padding:26px 28px;width:min(400px,88vw);\n  box-shadow:0 18px 50px rgba(20,30,28,.22);text-align:center;\n}.wb-root .fp-label{font-size:10.5px;color:var(--mute);letter-spacing:1px;font-weight:600}.wb-root .fp-title{font-size:17px;font-weight:600;margin:9px 0 4px;line-height:1.4}.wb-root .fp-sub{font-size:11.5px;color:var(--sub);margin-bottom:18px}.wb-root .fp-timer{font-size:44px;font-weight:700;letter-spacing:-2px;font-variant-numeric:tabular-nums;line-height:1}.wb-root .fp-timer.warn{color:var(--warn)}.wb-root .fp-bar{height:4px;background:#eceeeb;border-radius:2px;overflow:hidden;margin:16px 0 20px}.wb-root .fp-bar i{display:block;height:100%;background:var(--accent);transition:width 1s linear}.wb-root .fp-ops{display:flex;flex-wrap:wrap;gap:7px;justify-content:center}.wb-root .fp-ops button{border:1px solid var(--line);border-radius:8px;padding:7px 13px;font-size:12.5px;color:var(--sub);background:#fff}.wb-root .fp-ops button:hover{border-color:var(--mute)}.wb-root .fp-ops .primary{background:var(--accent);color:#fff;border-color:var(--accent);font-weight:600}.wb-root .fp-ops .primary:hover{background:#28605a}.wb-root .fp-ops .defer{color:var(--warn);border-color:#eed7cc}.wb-root .fp-hint{margin-top:16px;font-size:10.5px;color:var(--mute)}@media(max-width:880px){.wb-root .app{flex-direction:column;height:auto;min-height:100vh;overflow:visible}.wb-root .side{\n    width:auto;flex:0 0 auto;flex-direction:row;align-items:center;gap:10px;\n    padding:8px 12px;border-right:none;border-bottom:1px solid var(--line);\n    overflow-x:auto;overflow-y:hidden;background:#fbfcfb;\n  }.wb-root .brand{padding:0;flex:0 0 auto}.wb-root .brand small{display:none}.wb-root .brand h1{font-size:14px}.wb-root .nav{display:none}.wb-root .side-card, .wb-root .side-foot{display:none}.wb-root .side-msg{display:none}.wb-root .main{flex:1;min-height:0}.wb-root .topbar{height:auto;min-height:48px;flex-wrap:wrap;gap:8px;padding:7px 12px;flex:0 0 auto}.wb-root .tabs{overflow-x:auto;scrollbar-width:none;flex:1 1 100%}.wb-root .tabs::-webkit-scrollbar{display:none}.wb-root .filebar{margin-left:0;flex:1 1 100%;justify-content:flex-end}.wb-root .content{padding:14px 12px 48px;overflow:visible;flex:1 0 auto}.wb-root .vhead h2{font-size:17px}.wb-root .north, .wb-root .bottom-grid, .wb-root .kanban, .wb-root .grid2{grid-template-columns:1fr}.wb-root .cal{grid-template-columns:repeat(3,1fr)}.wb-root .rstat{grid-template-columns:repeat(2,1fr)}.wb-root .inbox-item{flex-wrap:wrap;gap:7px}.wb-root .inbox-item .txt{flex:1 1 100%;white-space:normal}.wb-root .quad-select{max-width:none;flex:1 1 auto}.wb-root .quad-tip{flex:0 0 auto}.wb-root .ops{margin-left:auto}.wb-root .trow{flex-wrap:wrap;row-gap:6px;gap:7px}.wb-root .trow .title{flex:1 1 auto;min-width:88px;white-space:normal}.wb-root .trow .pill{font-size:10px;padding:0 4px}.wb-root .trow .defer-badge{font-size:9.5px;padding:0 4px}.wb-root .trow .go-btn{font-size:10.5px;padding:2px 6px;margin-left:auto}.wb-root .focus-panel{padding:22px 18px}.wb-root .fp-timer{font-size:38px}\n}@media(max-width:520px){.wb-root .cal{grid-template-columns:repeat(2,1fr)}.wb-root .rstat{grid-template-columns:repeat(2,1fr)}.wb-root .fp-ops button{flex:1 1 calc(50% - 4px)}\n}.wb-root .toast{\n  position:fixed;left:50%;bottom:28px;transform:translate(-50%,14px);\n  background:#243430;color:#fff;border-radius:9px;padding:9px 15px;font-size:12.5px;\n  display:flex;align-items:center;gap:12px;opacity:0;pointer-events:none;\n  transition:opacity .18s,transform .18s;z-index:80;box-shadow:0 8px 24px rgba(0,0,0,.18);\n}.wb-root .toast.show{opacity:1;transform:translate(-50%,0);pointer-events:auto}.wb-root .toast button{color:#8ecfc4;font-size:12.5px;font-weight:600;text-decoration:underline}.wb-root .due-in{border:1px solid var(--line);border-radius:5px;padding:1px 3px;font-size:10.5px;color:var(--sub);background:#fff;outline:none;width:104px;flex:0 0 auto}.wb-root .due-in:focus{border-color:var(--accent)}.wb-root .due-in.empty{color:var(--mute);border-style:dashed}.wb-root .tag-in{border:1px solid var(--line);border-radius:5px;padding:2px 5px;font-size:10.5px;color:var(--sub);background:#fff;outline:none;width:88px;flex:0 0 auto;text-align:center}.wb-root .tag-in:focus{border-color:var(--accent)}.wb-root .tag-in.empty{color:var(--mute);border-style:dashed}.wb-root .pill.from-task{color:var(--accent);background:var(--accent-soft);border:1px solid #cfe4df;font-size:9.5px}.wb-root .row-ops{display:flex;gap:4px;flex:0 0 auto}.wb-root .row-ops button{font-size:10.5px;color:var(--sub);border:1px solid var(--line);border-radius:5px;padding:1px 6px;background:#fff;white-space:nowrap}.wb-root .row-ops button:hover{border-color:var(--accent);color:var(--accent)}.wb-root .cal-nav{display:flex;align-items:center;gap:9px;margin-bottom:9px;font-size:11.5px;color:var(--sub)}.wb-root .cal-nav button{border:1px solid var(--line);background:var(--paper);border-radius:6px;padding:3px 9px;font-size:11.5px;color:var(--sub)}.wb-root .cal-nav button:hover{border-color:var(--accent);color:var(--accent)}.wb-root .cal-nav span{font-weight:600;color:var(--ink)}.wb-root .task-hint{margin:0 0 11px;font-size:11.5px;color:var(--sub);background:#f6f8f6;border-radius:6px;padding:7px 10px;line-height:1.6}.wb-root .carry-box{margin-top:10px;border:1px dashed #e8d3c8;background:#fdf8f5;border-radius:8px;padding:9px 11px}.wb-root .cb-h{font-size:11px;font-weight:600;color:var(--warn);margin-bottom:6px}.wb-root .cb-row{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--sub);padding:3px 0}.wb-root .cb-nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.wb-root .cb-ops{display:flex;gap:4px;flex:0 0 auto}.wb-root .cb-ops button{font-size:10.5px;color:var(--sub);border:1px solid var(--line);border-radius:5px;padding:1px 6px;background:#fff}.wb-root .cb-ops button:hover{border-color:var(--accent);color:var(--accent)}.wb-root .stale-bar{display:flex;align-items:center;gap:9px;margin-bottom:11px;font-size:11.5px;color:var(--warn);background:var(--warn-soft);border-radius:6px;padding:7px 10px}.wb-root .stale-bar button{margin-left:auto;font-size:11px;border:1px solid #e6cbc0;border-radius:5px;padding:2px 8px;background:#fff;color:var(--warn)}"

    /* ---------------- 工作台逻辑（来自已验证的 v3 实现） ---------------- */
/* ============================================================
   个人工作台 v3
   架构原则：单一 state 是唯一真相源；所有视图从 state 派生；
   绝不保存 DOM（v2 用 innerHTML 快照导致清空/恢复永远漏）。
   ============================================================ */

const SCHEMA = 3;
const STORE_KEY = "workbench-v3";
const MAX_FOCUS = 3;

/* ---------- 工具 ---------- */
let ROOT = null;
const $  = (s, r) => (r || ROOT).querySelector(s);
const $$ = (s, r) => Array.from((r || ROOT).querySelectorAll(s));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const todayISO = () => isoOf(new Date());

function isoOf(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function parseISO(s) {
  const [y, m, d] = String(s).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
/** 本周一 00:00 */
function weekStart(base = new Date()) {
  const x = new Date(base);
  const shift = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - shift);
  x.setHours(0, 0, 0, 0);
  return x;
}
const WEEK_CN = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

/** 把 ISO 日期显示成「今天 / 明天 / 11-28」 */
function dueLabel(iso) {
  if (!iso) return "";
  const t = todayISO();
  if (iso === t) return "今天";
  if (iso === isoOf(addDays(new Date(), 1))) return "明天";
  const d = parseISO(iso);
  return String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ---------- 状态模型 ---------- */
function emptyState() {
  return {
    version: SCHEMA,
    savedAt: null,
    okr: [],                  // {id,title,pct,meta}
    focus: [],                // {id,title,tag,done,defer,doneOn,day,taskId} day=放进今日的那天
    carry: [],                // {id,title,tag,taskId,defer,fromDay} 跨天没收口的三件，不丢
    tasks: [],                // {id,title,tag,due,status}
    inbox: [],                // {id,text,q,created}
    plan: { theme: "", items: [], weekOf: isoOf(weekStart()) },  // items: {id,title,tag,done,taskId}
    review: { note: "", closedAt: null },
    milestones: [],           // {id,title,when}
    snapshots: {
      knowledge: { added: null, sessions: null }
    },
    streak: 0,
    lastActiveOn: null,
    lastRolloverOn: null,     // 上次做日界收口的日期
    ui: { taskPane: "list", weekPane: "plan", tag: "全部", calWeek: 0 },
    live: null            // 服务端读到的真实数据，只读，不参与编辑
  };
}

/** 首次打开时的示例数据（可一键清空，也可再载入） */
function seedState() {
  const s = emptyState();
  const t = todayISO();
  const ws = weekStart();
  s.okr = [
    { id: uid(), title: "把手上那件大事推到交付", pct: 60, meta: "里程碑：本周五评审" },
    { id: uid(), title: "每周一次沉淀", pct: 75, meta: "本周 3 条新增 · MNEMON 只读" },
    { id: uid(), title: "每周运动三次", pct: 43, meta: "本周 1 次" }
  ];
  s.focus = [
    { id: uid(), title: "把方案初稿写完", tag: "#工作", done: true, defer: 0, doneOn: t, day: t },
    { id: uid(), title: "回掉积压的消息", tag: "#工作", done: false, defer: 0, doneOn: null, day: t },
    { id: uid(), title: "整理本周数据", tag: "#复盘", done: false, defer: 2, doneOn: null, day: t }
  ];
  s.tasks = [
    { id: uid(), title: "方案初稿", tag: "#工作", due: t, status: "doing" },
    { id: uid(), title: "收集参考资料", tag: "#工作", due: isoOf(addDays(ws, 4)), status: "todo" },
    { id: uid(), title: "大纲定稿", tag: "#工作", due: "", status: "done" },
    { id: uid(), title: "回掉积压的消息", tag: "#工作", due: "", status: "todo" },
    { id: uid(), title: "跟团队同步一次进度", tag: "#工作", due: "", status: "todo" },
    { id: uid(), title: "本周数据整理", tag: "#复盘", due: "", status: "doing" },
    { id: uid(), title: "运动三次", tag: "#健康", due: "", status: "todo" },
    { id: uid(), title: "买咖啡豆", tag: "#生活", due: "", status: "todo" }
  ];
  s.inbox = [
    { id: uid(), text: "看到一篇想读的文章", q: "", created: t },
    { id: uid(), text: "下周约朋友吃饭", q: "2", created: t },
    { id: uid(), text: "买咖啡豆", q: "4", created: t }
  ];
  s.plan = {
    theme: "把方案推到评审，顺手清掉积压",
    weekOf: isoOf(ws),
    items: [
      { id: uid(), title: "方案初稿定稿并送评审", tag: "#工作", done: false },
      { id: uid(), title: "完成一次复盘", tag: "#复盘", done: true },
      { id: uid(), title: "运动三次", tag: "#健康", done: true }
    ]
  };
  s.milestones = [
    { id: uid(), title: "方案评审", when: dueLabel(isoOf(addDays(ws, 4))) },
    { id: uid(), title: "周末收口复盘", when: "周日 20:00" }
  ];
  s.snapshots = { knowledge: { added: 3, sessions: 14 } };
  s.streak = 12;
  s.lastActiveOn = t;
  s.lastRolloverOn = t;
  return s;
}

/** 从 v2 的草稿迁移（只搬能搬的；v2 的 html 快照一律丢弃，那是问题的根源） */
function migrate(old) {
  const s = emptyState();
  if (!old || typeof old !== "object") return s;
  const take = (arr, map) => Array.isArray(arr) ? arr.map(map).filter(Boolean) : [];
  s.focus = take(old.focus, (f) =>
    f && f.title ? { id: uid(), title: String(f.title), tag: f.tag || "", done: !!f.done, defer: Number(f.defer) || 0, doneOn: f.done ? todayISO() : null } : null);
  s.inbox = take(old.inbox, (n) =>
    n && n.text ? { id: uid(), text: String(n.text), q: String(n.q || n.quad || ""), created: todayISO() } : null);
  s.tasks = take(old.tasks, (t) =>
    t && t.nm ? { id: uid(), title: String(t.nm), tag: t.tag || "", due: "", status: t.status || "todo" } : null);
  if (old.planNote) s.plan.theme = String(old.planNote).replace(/^🎯\s*本周主题[：:]\s*/, "");
  if (old.reviewNote) s.review.note = String(old.reviewNote);
  return s;
}

/** 把任意来源的 state 规整成可用形状：缺字段补默认、类型不对就丢掉该字段。
    导入的备份是外部文件，可能被手改过或来自更早/更晚的版本，直接 Object.assign
    会让 state.ui / state.plan 变成 null 之类，随后一渲染就抛错、白屏。
    而且 persist 会把这个坏 state 写回去，刷新后永久白屏——所以必须先规整再落地。 */
function normalizeState(raw) {
  const base = emptyState();
  if (!raw || typeof raw !== "object") return base;
  const s = base;
  const arr = (v) => (Array.isArray(v) ? v : []);
  const str = (v, d = "") => (typeof v === "string" ? v : (v == null ? d : String(v)));
  const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

  s.version = SCHEMA;
  s.savedAt = str(raw.savedAt, base.savedAt);
  s.okr = arr(raw.okr).filter((o) => o && typeof o === "object").map((o) => ({
    id: str(o.id) || uid(),
    title: str(o.title),
    pct: Math.max(0, Math.min(100, num(o.pct))),
    meta: str(o.meta),
  }));
  s.focus = arr(raw.focus).filter((f) => f && typeof f === "object").map((f) => ({
    id: str(f.id) || uid(),
    title: str(f.title),
    tag: str(f.tag),
    done: !!f.done,
    defer: Math.max(0, num(f.defer)),
    doneOn: f.doneOn ? str(f.doneOn) : null,
    taskId: f.taskId ? str(f.taskId) : null,
    day: f.day ? str(f.day) : null,
    planId: f.planId ? str(f.planId) : null,
  })).filter((f) => f.title);
  s.carry = arr(raw.carry).filter((c) => c && typeof c === "object").map((c) => ({
    id: str(c.id) || uid(),
    title: str(c.title),
    tag: str(c.tag),
    taskId: c.taskId ? str(c.taskId) : null,
    defer: Math.max(0, num(c.defer)),
    fromDay: str(c.fromDay),
  })).filter((c) => c.title);
  s.tasks = arr(raw.tasks).filter((t) => t && typeof t === "object").map((t) => ({
    id: str(t.id) || uid(),
    title: str(t.title || t.nm),
    tag: str(t.tag),
    due: str(t.due),
    status: ["todo", "doing", "done"].includes(t.status) ? t.status : "todo",
  })).filter((t) => t.title);
  s.inbox = arr(raw.inbox).filter((n) => n && typeof n === "object").map((n) => ({
    id: str(n.id) || uid(),
    text: str(n.text),
    q: ["1", "2", "3", "4", ""].includes(String(n.q)) ? String(n.q) : "",
    created: str(n.created, todayISO()),
  })).filter((n) => n.text);

  const rp = raw.plan && typeof raw.plan === "object" ? raw.plan : {};
  s.plan = {
    theme: str(rp.theme),
    weekOf: str(rp.weekOf, isoOf(weekStart())),
    items: arr(rp.items).filter((p) => p && typeof p === "object").map((p) => ({
      id: str(p.id) || uid(),
      title: str(p.title),
      tag: str(p.tag),
      done: !!p.done,
      taskId: p.taskId ? str(p.taskId) : null,
    })).filter((p) => p.title),
  };

  const rv = raw.review && typeof raw.review === "object" ? raw.review : {};
  s.review = { note: str(rv.note), closedAt: rv.closedAt ? str(rv.closedAt) : null };

  s.milestones = arr(raw.milestones).filter((m) => m && typeof m === "object").map((m) => ({
    id: str(m.id) || uid(),
    title: str(m.title),
    when: str(m.when),
  })).filter((m) => m.title);

  const rs = raw.snapshots && typeof raw.snapshots === "object" ? raw.snapshots : {};
  const rk = rs.knowledge && typeof rs.knowledge === "object" ? rs.knowledge : {};
  s.snapshots = {
    knowledge: { added: num(rk.added), sessions: num(rk.sessions) },
  };

  s.streak = Math.max(0, num(raw.streak));
  s.lastActiveOn = raw.lastActiveOn ? str(raw.lastActiveOn) : null;
  s.lastRolloverOn = raw.lastRolloverOn ? str(raw.lastRolloverOn) : null;

  const ru = raw.ui && typeof raw.ui === "object" ? raw.ui : {};
  s.ui = {
    taskPane: ["list", "board", "cal"].includes(ru.taskPane) ? ru.taskPane : "list",
    weekPane: ["plan", "review"].includes(ru.weekPane) ? ru.weekPane : "plan",
    tag: typeof ru.tag === "string" ? ru.tag : "全部",
    calWeek: Number.isFinite(Number(ru.calWeek)) ? Number(ru.calWeek) : 0,
  };
  return s;
}

/* ---------- 持久化 ---------- */
/** 旧版本会自动打 #待定 / #搁置 / #明天 / #委托 这类标签，那是我替用户做的分类，
    不是他自己的分类法。载入时统一清掉，让他重新决定。 */
const LEGACY_AUTO_TAGS = ["#待定", "#搁置", "#明天", "#委托", "#今日", "#任务池"];
function cleanLegacyTags(s) {
  let touched = false;
  const strip = (arr) => (arr || []).forEach((o) => {
    if (o && LEGACY_AUTO_TAGS.includes(o.tag)) { o.tag = ""; touched = true; }
  });
  strip(s.tasks);
  strip(s.focus);
  strip(s.plan && s.plan.items);
  return touched;
}

let state = emptyState();
let uiTimer = null;

function setSaveStatus(text, kind) {
  $$("#saveStatus, #saveStatus2").forEach((el) => {
    el.textContent = text;
    el.className = "save-status " + (kind || "ok");
  });
}
/* 本地存储可能被宿主禁用（DSH 渲染进程 / 沙箱 iframe），一律走安全封装 */
const SAFE_STORE = (() => {
  try {
    const k = "__wb_probe__";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return localStorage;
  } catch (e) {
    const mem = Object.create(null);
    return {
      getItem: (k) => (k in mem ? mem[k] : null),
      setItem: (k, v) => { mem[k] = String(v); },
      removeItem: (k) => { delete mem[k]; },
      __memory: true,
    };
  }
})();

function persist() {
  state.savedAt = new Date().toISOString();
  if (SAFE_STORE.__memory) {
    // 内存兜底：setItem 永远不会失败，所以不能靠 catch 判断——
    // 必须在这里如实告诉用户「刷新就没了」，否则是在骗人。
    setSaveStatus("⚠ 存不了：本地存储被禁用，刷新会丢", "dirty");
    return;
  }
  try {
    SAFE_STORE.setItem(STORE_KEY, JSON.stringify(state));
    setSaveStatus("✓ 已自动保存", "ok");
  } catch (e) {
    setSaveStatus("⚠ 存不了：" + (e && e.name === "QuotaExceededError" ? "空间满了" : "写入失败"), "dirty");
  }
}
/** 改数据 → 落盘 → 重渲染 */
function commit(rerender = true) {
  persist();
  if (rerender) render();
}

/* ---------- 派生计算 ---------- */
const taskById = (id) => (id ? state.tasks.find((t) => t.id === id) : null);

/* 状态互通：任务池里的任务状态是唯一真相。凡是从任务来的条目都带 taskId，
   完成与否一律看任务池那条（这样在任务池里改回待办，这里也跟着退回去）；
   直接在今日三件 / 周计划里新建的条目没有 taskId，用自己的 done。 */
function focusDone(f) {
  if (!f) return false;
  const t = taskById(f.taskId);
  if (t) return t.status === "done";
  // 从周计划拆进来的条目：计划项勾了完成，这里也算完成。
  // 否则同一条事在「本周计划」显示已完成、在「今日三件」还是待办。
  if (f.planId) {
    const p = (state.plan.items || []).find((x) => x.id === f.planId);
    if (p && p.done) return true;
  }
  return !!f.done;
}
function planDone(p) {
  if (!p) return false;
  const t = taskById(p.taskId);
  if (t) return t.status === "done";
  // 反过来：计划项被拆进今日三件后，在今日勾完成也算这一项完成
  if (p.done) return true;
  return state.focus.some((f) => f.planId === p.id && !!f.done);
}
/** 反方向：在今日三件 / 周计划里勾掉，任务池那条也跟着变 */
function syncTaskFrom(item, done) {
  const t = taskById(item && item.taskId);
  if (!t) return;
  if (done) {
    // 记下原来的状态，取消完成时好退回去（三态不该被压成两态）
    if (t.status !== "done") t.prevStatus = t.status;
    t.status = "done";
  } else if (t.status === "done") {
    t.status = t.prevStatus === "doing" ? "doing" : "todo";
  }
}

const activeFocus = () => state.focus.filter((f) => !focusDone(f));
/* 顺延 = 今天被推迟的（defer>0）+ 昨天没收口的（carry 数组）。
   之前只算前者，导致「昨天那三件」在周复盘里完全看不见——它们既不在计划里，也不算顺延。 */
const carryFocus = () => activeFocus().filter((f) => f.defer > 0)
  .concat(state.carry.map((c) => ({ id: c.id, title: c.title, tag: c.tag, defer: c.defer || 1, taskId: c.taskId })));

/* ---------- 日界 / 周边界 ----------
   没有这一步，「今日三件」会跨天累积成十件，「本周计划」会跨周挂着上周的账。
   收口原则：不偷偷删用户的东西——没做完的挪进「昨天没收口」，让他自己决定捡不捡。 */
function rolloverDay() {
  const t = todayISO();
  if (state.lastRolloverOn === t) return false;
  let touched = false;
  const keep = [];
  state.focus.forEach((f) => {
    // 没标 day 的老数据当成今天的，不折腾
    const day = f.day || t;
    if (day === t) { keep.push(f); return; }
    if (focusDone(f)) { touched = true; return; }   // 昨天的已完成件自然退场
    // 昨天没做完：挪进 carry，等他决定是继续做还是丢掉
    state.carry.unshift({ id: f.id, title: f.title, tag: f.tag || "", taskId: f.taskId || null, defer: f.defer || 0, fromDay: day });
    touched = true;
  });
  if (touched) state.focus = keep;
  state.lastRolloverOn = t;
  return true;
}

/** 本周计划是否还是上周的 */
const planIsStale = () => !!(state.plan.weekOf && state.plan.weekOf !== isoOf(weekStart()));
const tagKeyOf    = (t) => (t && t.tag) || "";
const tagsOf      = () => state.tasks.reduce((m, t) => { const k = tagKeyOf(t); m[k] = (m[k] || 0) + 1; return m; }, {});
/** 打标签时的候选：已有标签 + 几个常用默认值 */
const DEFAULT_TAGS = ["#工作", "#生活", "#学习", "#健康"];
function allTags() {
  const used = Object.keys(tagsOf()).filter(Boolean);
  return used.concat(DEFAULT_TAGS.filter((d) => !used.includes(d)));
}

/* 统一读数：插件实时数据优先，手填快照兜底。周复盘与今日页共用同一口径。 */
function knowledgeReading() {
  const L = state.live;
  const mn = L && L.mnemon ? L.mnemon : null;
  const k = state.snapshots.knowledge || {};
  // 数值一律收敛成 number：这些字段会被拼进 innerHTML，
  // 而 MNEMON 文件内容可被任何写记忆的 agent 影响，不能当成可信数字。
  const n = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  if (mn) return { added: n(mn.memWeek), docs: n(mn.docActive), docsWeek: n(mn.docWeek), sessions: L.sessions && L.sessions.week != null ? n(L.sessions.week) : null, src: "live" };
  return { added: k.added, docs: null, docsWeek: null, sessions: k.sessions, src: "manual" };
}

function weekStats() {
  const items = state.plan.items || [];
  const done = items.filter((i) => planDone(i)).length;
  return {
    planned: items.length,
    done,
    pct: items.length ? Math.round((done / items.length) * 100) : 0,
    carry: carryFocus().length,
    added: knowledgeReading().added
  };
}

/* 长期目标进度：一律手填 */
function okrPct(o) {
  return Math.max(0, Math.min(100, Number(o && o.pct) || 0));
}

/* ---------- 渲染：今日 ---------- */
function renderToday() {
  // 长期目标
  $("#okrBar").innerHTML = state.okr.length
    ? state.okr.map((o) => `
      <div class="okr" data-id="${o.id}">
        <button class="okr-del" data-act="okr-del" title="删除这个目标">×</button>
        <div class="okr-top"><b contenteditable="true" data-field="okr-title">${esc(o.title)}</b><span contenteditable="true" data-field="okr-pct">${okrPct(o)}%</span></div>
        <div class="bar"><i style="width:${okrPct(o)}%"></i></div>
        <div class="okr-meta" contenteditable="true" data-field="okr-meta">${esc(o.meta)}</div>
      </div>`).join("") + `
      <div class="okr okr-add" data-act="okr-add">＋ 加一个目标</div>`
    : `<div class="card" style="grid-column:1/-1"><div class="empty"><b>还没有设定长期目标</b>长期目标回答“这几个月往哪走”，今日三件回答“今天走哪一步”。没有上面这层，三件容易变成纯救火。
        <div style="margin-top:11px"><button class="go-btn" data-act="okr-add">＋ 加一个目标</button></div></div></div>`;

  // 三件
  const rows = activeFocus().length;
  let seen = 0;   // 只数「未完成的第几件」，已完成的不占序号
  $("#focusList").innerHTML = state.focus.length
    ? state.focus.map((f) => {
      const dn = focusDone(f);
      const fromTask = !!f.taskId;
      const idx = dn ? -1 : seen++;
      // 只把超出的那几件标红；原来 rows>3 时前 3 件也一起变红，跟文案对不上
      const over = !dn && idx >= MAX_FOCUS;
      return `
      <div class="trow${dn ? " done" : ""}${over ? " over" : ""}" data-id="${f.id}">
        <input type="checkbox" ${dn ? "checked" : ""} data-act="focus-toggle">
        <span class="title">${esc(f.title)}</span>
        <span class="pill">${esc(f.tag || "无标签")}</span>
        ${fromTask ? '<span class="pill from-task" title="来自任务池，状态与任务池同步">任务池</span>' : ""}
        ${f.defer > 0 ? `<span class="defer-badge">顺延×${f.defer}</span>` : ""}
        <button class="go-btn" data-act="focus-start">▶ 现在做</button>
        <button class="icon-del" data-act="focus-del" title="移除">×</button>
      </div>`;
    }).join("")
    : `<div class="empty"><b>今天还没定三件</b>三件就够。第四件请写进暂存区，明天再说。</div>`;

  const over = rows > MAX_FOCUS;
  const badge = $("#focusBadge");
  badge.textContent = rows + "/" + MAX_FOCUS;
  badge.classList.toggle("over", over);
  $("#overHint").hidden = !over;

  // 昨天没收口的三件：不偷偷删，摆出来让他自己决定
  const carryBox = $("#carryBox");
  if (carryBox) {
    carryBox.innerHTML = state.carry.length
      ? `<div class="carry-box"><div class="cb-h">昨天没收口 · ${state.carry.length} 件</div>` +
        state.carry.map((c) => `
          <div class="cb-row" data-cid="${c.id}">
            <span class="cb-nm">${esc(c.title)}</span>
            ${c.defer > 0 ? `<span class="defer-badge">顺延×${c.defer}</span>` : ""}
            <span class="cb-ops">
              <button data-act="carry-pick">今天继续</button>
              <button data-act="carry-drop">丢掉</button>
            </span>
          </div>`).join("") + "</div>"
      : "";
  }

  // Q2 提醒
  const hasQ2 = state.inbox.some((n) => n.q === "2");
  const hint = $("#q2Hint");
  hint.classList.toggle("met", hasQ2);
  hint.textContent = hasQ2
    ? "✓ 暂存区躺着 Q2 的事——今天挑一件进三件，别让它只进不出"
    : "↳ 四象限提醒：今天从 Q2（重要不紧急）挑一件进三件，别只救火";

  // 连击
  $("#streakNum").textContent = state.streak || 0;
  $("#streakNote").textContent = state.streak
    ? "上次完成：" + (state.lastActiveOn === todayISO() ? "今天" : dueLabel(state.lastActiveOn))
    : "今天完成一件就点亮";

  // 侧栏
  $("#miniCount").innerHTML = rows + '<small>/' + MAX_FOCUS + "</small>";
  $("#miniCount").classList.toggle("over", over);
  const top = activeFocus().slice(0, 3);
  $("#miniList").innerHTML = top.length
    ? top.map((f) => `<div>${esc(f.title)}</div>`).join("")
    : '<div class="qempty">今天还没定</div>';
  $("#navInboxBadge").textContent = state.inbox.length;

  // 快速笔记
  $("#quickList").innerHTML = state.inbox.length
    ? state.inbox.slice(0, 3).map((n) => `<div>${esc(n.text)}</div>`).join("")
    : '<div class="qempty">还没有速记，想到就记一条</div>';

  // 里程碑
  $("#milestoneList").innerHTML = state.milestones.length
    ? state.milestones.map((m) => `<div class="mile"><span class="mdot"></span>${esc(m.title)}<span>${esc(m.when)}</span></div>`).join("")
    : '<div class="mile"><span class="mdot"></span>本周暂无里程碑</div>';

  // 本周进度
  const st = weekStats();
  $("#weekPct").innerHTML = st.planned ? st.pct + "%<small>计划完成</small>" : '—<small>还没计划</small>';
  $("#weekPctNote").textContent = st.planned
    ? `${st.done}/${st.planned} 完成 · 顺延 ${st.carry} 件`
    : "去「周计划」定三件，这里才有进度";

  // 本周节奏：本周有截止日的任务
  const ws = weekStart(), we = addDays(ws, 7);
  const rhythm = state.tasks
    .filter((t) => t.due && parseISO(t.due) >= ws && parseISO(t.due) < we && t.status !== "done")
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 4);
  $("#rhythmList").innerHTML = rhythm.length
    ? rhythm.map((t) => `<div>${esc(t.title)}<span>${dueLabel(t.due)}</span></div>`).join("")
    : '<div style="color:var(--mute)">本周没有排期的事</div>';

  // 真实数据（优先）/ 手填快照（兜底）
  const L = state.live;
  const mn = L && L.mnemon ? L.mnemon : null;
  const k = state.snapshots.knowledge;
  if (mn) {
    const se = L && L.sessions;
    $("#knowMeta").textContent = `本周新增 ${mn.memWeek} 条沉淀 · 活跃文档 ${mn.docActive} 篇` +
      (se ? ` · 会话 ${se.week} 个` : "") + " · 不回写";
    $("#knowSrc").textContent = "MNEMON · 实时";
  } else if (k.added != null) {
    $("#knowMeta").textContent = `新增 ${k.added} 条沉淀 · 本周会话 ${k.sessions ?? 0} 个 · 不回写`;
    $("#knowSrc").textContent = "手填";
  } else {
    $("#knowMeta").textContent = "未接入 · 去数据源读取";
    $("#knowSrc").textContent = "MNEMON";
  }
}

/* ---------- 渲染：暂存区 ---------- */
const QUAD = { "1": "Q1 重要紧急", "2": "Q2 重要不紧急", "3": "Q3 紧急不重要", "4": "Q4 不重要不紧急" };
const QUAD_TIP = { "1": "→ 今日候选", "2": "→ 排进任务池", "3": "→ 批量/委托", "4": "→ 删/搁置" };

function renderInbox() {
  $("#navInboxBadge").textContent = state.inbox.length;
  $("#inboxList").innerHTML = state.inbox.length
    ? state.inbox.map((n) => `
      <div class="inbox-item" data-id="${n.id}">
        <span class="txt">${esc(n.text)}</span>
        <select class="quad-select${n.q ? " q" + n.q : ""}" data-act="quad-set">
          <option value="">标象限…</option>
          ${Object.keys(QUAD).map((k) => `<option value="${k}" ${n.q === k ? "selected" : ""}>${QUAD[k]}</option>`).join("")}
        </select>
        <span class="quad-tip">${n.q ? QUAD_TIP[n.q] : ""}</span>
        <span class="ops">
          <button data-act="inbox-task">→任务</button>
          <button data-act="inbox-tomorrow">→明天</button>
          <button class="danger" data-act="inbox-del">删</button>
        </span>
      </div>`).join("")
    : `<div class="card"><div class="empty"><b>暂存区是空的</b>这里接住「现在想到、但不该现在做」的东西。输入时不分类，每天集中分流一次。</div></div>`;
}

/* ---------- 渲染：任务池 ---------- */
function renderTasks() {
  const tags = tagsOf();
  const cur = state.ui.tag == null ? "全部" : state.ui.tag;
  $("#tagbar").innerHTML = ['<button data-tag="全部" class="' + (cur === "全部" ? "active" : "") + '">全部 ' + state.tasks.length + "</button>"]
    .concat(Object.keys(tags).map((t) =>
      `<button data-tag="${esc(t)}" class="${cur === t ? "active" : ""}">${t ? esc(t) : "无标签"} ${tags[t]}</button>`))
    .join("");

  const list = visibleTasks();

  // 标签候选：用户写过的标签都出现在下拉提示里，但输入框接受任意值
  const sug = $("#tagSuggest");
  if (sug) sug.innerHTML = allTags().map((g) => `<option value="${esc(g)}"></option>`).join("");

  // 列表
  $("#taskList").innerHTML = list.length
    ? list.map((t) => `
      <div class="tlist-row${t.status === "done" ? " done" : ""}" data-id="${t.id}">
        <span class="st ${t.status}" data-act="task-cycle" title="点一下切换：待办 → 进行中 → 已完成"></span>
        <span class="nm">${esc(t.title)}</span>
        <input class="tag-in${t.tag ? "" : " empty"}" data-act="task-tag" list="tagSuggest" value="${esc(t.tag || "")}" placeholder="标签" title="随便写，回车生效；留空就是无标签" autocomplete="off">
        <input type="date" class="due-in${t.due ? "" : " empty"}" data-act="task-due" value="${t.due || ""}" title="排期：选个日期就进日历">
        <div class="row-ops">
          <button data-act="task-to-focus" title="放进今天的聚焦">进今日</button>
          <button data-act="task-to-plan" title="放进本周计划">进本周</button>
        </div>
        <button class="icon-del" data-act="task-del" title="删除">×</button>
      </div>`).join("")
    : `<div class="empty"><b>没有任务</b>从暂存区点「→任务」分流过来，或直接在下面加一条。</div>`;

  // 看板（同一份数据派生，不再各写一份 DOM）
  const cols = [["todo", "待办"], ["doing", "进行中"], ["done", "已完成"]];
  $("#board").innerHTML = cols.map(([k, label]) => {
    const items = list.filter((t) => t.status === k);
    return `<div class="col"><h4>${label}<span>${items.length}</span></h4>` + (items.length
      ? items.map((t) => `<div class="tcard" data-id="${t.id}"><span class="tnm">${esc(t.title)}</span><div class="m"><span>${esc(t.tag || "无标签")}</span>${t.due ? `<span>${esc(dueLabel(t.due))}</span>` : ""}</div></div>`).join("")
      : '<div class="ce" style="background:none;color:var(--mute)">空</div>') + "</div>";
  }).join("");

  // 日历（可翻周）
  const off = state.ui.calWeek || 0;
  const ws = addDays(weekStart(), off * 7), t = todayISO();
  $("#cal").innerHTML = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(ws, i), iso = isoOf(d), isToday = iso === t;
    const items = list.filter((x) => x.due === iso);
    return `<div class="day${isToday ? " today" : ""}">
      <div class="dh"><span>${isToday ? "今天" : WEEK_CN[i]}</span>${isToday ? "<b>" + d.getDate() + "</b>" : "<span>" + d.getDate() + "</span>"}</div>
      ${items.length ? items.map((x) => `<div class="ce ${x.status}">${esc(x.title)}</div>`).join("") : '<div class="empty-d">—</div>'}
    </div>`;
  }).join("");

  const nav = $("#calNav");
  if (nav) {
    const wEnd = addDays(ws, 6);
    const fmt = (d) => (d.getMonth() + 1) + "月" + d.getDate() + "日";
    nav.innerHTML = '<button data-act="cal-prev">← 上一周</button>' +
      '<span>' + fmt(ws) + " – " + fmt(wEnd) + (off === 0 ? " · 本周" : "") + '</span>' +
      '<button data-act="cal-next">下一周 →</button>' +
      (off === 0 ? "" : '<button data-act="cal-today">回到本周</button>');
  }
}
function visibleTasks() {
  const cur = state.ui.tag == null ? "全部" : state.ui.tag;
  return cur === "全部" ? state.tasks : state.tasks.filter((t) => tagKeyOf(t) === cur);
}

/* ---------- 渲染：周计划 · 复盘 ---------- */
function renderWeek() {
  const theme = $("#planTheme");
  if (document.activeElement !== theme) theme.textContent = state.plan.theme || "";

  // 本周计划还是上周的？不偷偷清空，明确提示并给一个动作
  const stale = $("#planStale");
  if (stale) {
    stale.innerHTML = planIsStale()
      ? `<div class="stale-bar">这份计划是 ${esc(state.plan.weekOf)} 那一周的，还没开新周。<button data-act="plan-rollover">开新的一周</button></div>`
      : "";
  }

  $("#planItems").innerHTML = state.plan.items.length
    ? state.plan.items.map((p, i) => {
      const dn = planDone(p);
      return `
      <div class="plan-row${dn ? " done" : ""}" data-id="${p.id}">
        <span class="pn">${i + 1}</span>
        <input type="checkbox" ${dn ? "checked" : ""} data-act="plan-toggle">
        <span class="nm">${esc(p.title)}</span>
        <span class="tag">${esc(p.tag || "无标签")}</span>
        ${p.taskId ? '<span class="pill from-task" title="来自任务池，状态与任务池同步">任务池</span>' : ""}
        <button class="go-btn" data-act="plan-split">拆进今日</button>
        <button class="icon-del" data-act="plan-del">×</button>
      </div>`;
    }).join("")
    : `<div class="empty"><b>本周还没定计划</b>不用多，三件就够——它们会被拆进每天的聚焦。</div>`;

  const carry = carryFocus();
  $("#planCarry").innerHTML = carry.length
    ? carry.map((f) => `<div class="carry-row">→ ${esc(f.title)}（顺延 ×${f.defer}，本周必须收口）</div>`).join("")
    : '<div class="carry-row" style="background:#f5f7f5;color:var(--sub)">本周没有顺延项，干净。</div>';

  const st = weekStats();
  $("#rstat").innerHTML = [
    [st.planned ? `${st.done}/${st.planned}` : "—", "计划完成"],
    [st.carry, "顺延"],
    [st.added != null ? st.added : "—", "新增沉淀"]
  ].map(([v, l]) => `<div class="s"><b>${v}</b><span>${l}</span></div>`).join("");

  const knowR = knowledgeReading();
  const doneItems = state.plan.items.filter((i) => planDone(i));
  const todoItems = state.plan.items.filter((i) => !planDone(i));
  $("#rlist").innerHTML = [
    doneItems.length ? `<div>✔ 完成：${doneItems.map((i) => esc(i.title)).join("、")}</div>` : "",
    todoItems.length ? `<div>○ 未完：${todoItems.map((i) => esc(i.title)).join("、")}</div>` : "",
    carry.length ? `<div>→ 顺延：${carry.map((f) => esc(f.title)).join("、")}</div>` : "",
    knowR.added != null ? `<div>🧠 沉淀：新增 ${knowR.added} 条${knowR.src === "live" ? "（MNEMON 实时）" : "（手填）"}</div>` : ""
  ].filter(Boolean).join("");

  $("#loopNote").textContent = carry.length
    ? `↳ 上面 ${carry.length} 件顺延项已经挂进下周的「上周顺延进来」，闭环不丢。`
    : "↳ 没有顺延项，这周收得干净。";

  const note = $("#reviewNote");
  if (document.activeElement !== note) note.value = state.review.note || "";

  // 子标签 / 任务池子标签状态还原
  $$("#taskTabs button").forEach((b) => b.classList.toggle("active", b.dataset.pane === state.ui.taskPane));
  $$("#pane-list, #pane-board, #pane-cal").forEach((p) => p.classList.remove("active"));
  $("#pane-" + (state.ui.taskPane || "list")).classList.add("active");
  $$("#weekTabs button").forEach((b) => b.classList.toggle("active", b.dataset.wpane === state.ui.weekPane));
  $$("#wplan-plan, #wplan-review").forEach((p) => p.classList.remove("active"));
  $("#wplan-" + (state.ui.weekPane || "plan")).classList.add("active");
}

/* ---------- 数据源：真实读取 ---------- */
let liveBusy = false, liveError = null, liveAt = null;
let STATS_URL = "/workbench/stats";

async function pullLive(opts = {}) {
  if (liveBusy) return;
  liveBusy = true;
  liveError = null;
  renderSources();
  try {
    const q = [];
    if (opts.refresh) q.push("refresh=1");
    const r = await fetch(STATS_URL + (q.length ? "?" + q.join("&") : ""), { cache: "no-store" });
    if (!r.ok) throw new Error("工作台接口返回 " + r.status);
    const d = await r.json();
    if (d.error) throw new Error(d.error);
    state.live = d;
    liveAt = new Date();
    persist();
  } catch (e) {
    liveError = String(e.message || e);
  } finally {
    liveBusy = false;
    renderSources();
    renderToday();
    renderWeek();   // 实时数据到达后周计划/复盘的自动对账也要跟着刷新
  }
}

function fmtWhen(ts) {
  if (!ts) return "";
  const d = new Date(ts * 1000);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/* ---------- 渲染：数据源 ---------- */
function renderSources() {
  const L = state.live;

  /* 顶部状态条 */
  const stale = liveAt ? Math.round((Date.now() - liveAt.getTime()) / 60000) : null;
  $("#liveBar").innerHTML = `
    <span>${liveBusy ? "正在读取…" : L ? `上次读取 ${stale != null ? stale + " 分钟前" : "刚刚"}` : "还没读取过"}</span>
    ${liveError ? `<span class="src-state bad">· ${esc(liveError)}</span>` : ""}
    <button data-act="live-pull"${liveBusy ? " disabled" : ""}>${liveBusy ? "读取中…" : "重新读取"}</button>`;

  /* 两个源 */
  const mn = L && L.mnemon ? L.mnemon : null;
  const se = L && L.sessions ? L.sessions : null;

  const card = (logo, name, desc, stateHtml, extra = "") => `
    <div class="src">
      <div class="logo">${logo}</div>
      <div class="info"><h4>${name}</h4><p>${desc}</p>${extra}</div>
      ${stateHtml}
    </div>`;

  let html = "";

  /* MNEMON */
  html += card("M", "MNEMON",
    "记忆条目 / 项目文档",
    mn ? `<span class="ro live">已接入</span>` : `<span class="ro">未读取</span>`,
    mn
      ? `<div class="src-state ok">本周新增 ${esc(mn.memWeek)} 条记忆 · 活跃文档 ${esc(mn.docActive)} 篇（本周动过 ${esc(mn.docWeek)} 篇）</div>`
      : `<div class="src-state">读本机 ~/.mnemon，无需联网</div>`);

  /* DSH 会话 */
  const proj = se && se.projects.length
    ? `<div class="src-state">${se.projects.map((p) => `${esc(p.name)} ${p.n}`).join(" · ")}</div>`
    : "";
  html += card("D", "DSH 会话",
    "本周工作痕迹",
    se ? `<span class="ro live">已接入</span>` : `<span class="ro">未读取</span>`,
    se ? `<div class="src-state ok">本周 ${esc(se.week)} 个会话，分布在 ${esc(se.projectCount)} 个工作区</div>${proj}`
       : `<div class="src-state">读本机 ~/.dsh/sessions，无需联网</div>`);

  $("#sourceList").innerHTML = html;
}

/* ---------- 主渲染 ---------- */
function render() {
  renderToday();
  renderInbox();
  renderTasks();
  renderWeek();
  renderSources();
}

/* ---------- 视图切换 ---------- */
function go(name) {
  $$(".view").forEach((v) => v.classList.remove("active"));
  const view = $("#v-" + name);
  if (view) view.classList.add("active");
  $$("#tabs button, #nav button").forEach((b) => b.classList.toggle("active", b.dataset.go === name));
  $("#content").scrollTop = 0;
}

/* ---------- toast / 撤销 ---------- */
let toastTimer = null, lastUndo = null;
function toast(msg, undoFn, undoLabel) {
  const el = $("#toast");
  el.innerHTML = `<span>${esc(msg)}</span>` + (undoFn ? `<button data-act="undo">${undoLabel || "撤销"}</button>` : "");
  lastUndo = undoFn || null;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.classList.remove("show"); lastUndo = null; }, undoFn ? 6000 : 2400);
}

/* ---------- 业务动作 ---------- */
function addInbox(text) {
  const t = String(text || "").trim();
  if (!t) return false;
  state.inbox.unshift({ id: uid(), text: t, q: "", created: todayISO() });
  commit();
  return true;
}

function addTask(title, tag, due) {
  const t = String(title || "").trim();
  if (!t) return;
  state.tasks.unshift({ id: uid(), title: t, tag: tag || "", due: due || "", status: "todo" });
}

/** 完成聚焦项时更新连续天数 */
function touchStreak() {
  const t = todayISO();
  if (state.lastActiveOn === t) return;
  const y = isoOf(addDays(new Date(), -1));
  state.streak = state.lastActiveOn === y ? (state.streak || 0) + 1 : 1;
  state.lastActiveOn = t;
}

function toggleFocus(id) {
  const f = state.focus.find((x) => x.id === id);
  if (!f) return;
  const next = !focusDone(f);
  f.done = next;
  f.doneOn = next ? todayISO() : null;
  syncTaskFrom(f, next);
  // 从周计划拆进来的，勾选要回写到计划项，否则两边各说各话
  if (f.planId) {
    const p = state.plan.items.find((x) => x.id === f.planId);
    if (p && !p.taskId) p.done = next;
  }
  if (next) { touchStreak(); f.defer = 0; }
  commit();
  if (next) toast("做完一件。" + (state.streak > 1 ? `连续 ${state.streak} 天` : "今天开张"));
}

function deferFocus(id) {
  const f = state.focus.find((x) => x.id === id);
  if (!f) return;
  f.defer = (f.defer || 0) + 1;
  commit();
}

/** 单点聚焦 */
let fpId = null, fpLeft = 120, fpTimer = null;
function openFocus(id) {
  const f = state.focus.find((x) => x.id === id);
  if (!f) return;
  fpId = id;
  fpLeft = 120;
  $("#fpTitle").textContent = f.title;
  $("#focusOverlay").classList.add("open");
  drawTimer();
  startTimer();
}
function startTimer() {
  clearInterval(fpTimer);
  fpTimer = setInterval(() => {
    fpLeft--;
    drawTimer();
    if (fpLeft <= 0) clearInterval(fpTimer);
  }, 1000);
}
function drawTimer() {
  const m = String(Math.floor(Math.max(fpLeft, 0) / 60)).padStart(2, "0");
  const s = String(Math.max(fpLeft, 0) % 60).padStart(2, "0");
  const el = $("#fpTimer");
  el.textContent = m + ":" + s;
  el.classList.toggle("warn", fpLeft <= 20);
  $("#fpBar").style.width = (Math.max(fpLeft, 0) / 120 * 100) + "%";
}
function closeFocus() {
  clearInterval(fpTimer);
  $("#focusOverlay").classList.remove("open");
  fpId = null;
}

/* ---------- 事件委托（挂载后绑定一次，重渲染不用重绑） ---------- */
let eventsBound = false;
function bindEvents() {
  if (eventsBound) return;
  eventsBound = true;
ROOT.addEventListener("click", (e) => {
  const goto = e.target.closest("[data-go]");
  if (goto) { go(goto.dataset.go); return; }

  const tagBtn = e.target.closest("#tagbar button");
  if (tagBtn) { state.ui.tag = tagBtn.dataset.tag; commit(); return; }

  const paneBtn = e.target.closest("#taskTabs button");
  if (paneBtn) { state.ui.taskPane = paneBtn.dataset.pane; commit(); return; }

  const weekBtn = e.target.closest("#weekTabs button");
  if (weekBtn) { state.ui.weekPane = weekBtn.dataset.wpane; commit(); return; }

  const act = e.target.closest("[data-act]");
  if (!act) return;
  const id = act.closest("[data-id]")?.dataset.id;
  const el = act;   // 有些动作（如 carry-*）的标识挂在 [data-cid] 上，用 el 取最近容器

  switch (act.dataset.act) {
    /* --- 暂存区 --- */
    case "note-from-side": {
      const inp = $("#sideNote");
      if (addInbox(inp.value)) { inp.value = ""; }
      break;
    }
    case "note-from-quick": {
      const inp = $("#quickNote");
      if (addInbox(inp.value)) { inp.value = ""; }
      break;
    }
    case "note-from-inbox": {
      const inp = $("#inboxInput");
      if (addInbox(inp.value)) { inp.value = ""; }
      break;
    }
    case "quad-set": break; // select 走 change
    case "inbox-task": {
      const n = state.inbox.find((x) => x.id === id);
      if (!n) break;
      // 象限只决定「去哪」，不自动打标签——标签是用户自己的分类法，
      // 替用户塞一个 #搁置 会让他以为任务被系统判了死刑。
      addTask(n.text, "", "");
      state.inbox = state.inbox.filter((x) => x.id !== id);
      commit();
      toast("已转成任务：" + n.text);
      break;
    }
    case "inbox-tomorrow": {
      const n = state.inbox.find((x) => x.id === id);
      if (!n) break;
      addTask(n.text, "", isoOf(addDays(new Date(), 1)));
      state.inbox = state.inbox.filter((x) => x.id !== id);
      commit();
      toast("已排到明天：" + n.text);
      break;
    }
    case "inbox-del": {
      const idx = state.inbox.findIndex((x) => x.id === id);
      if (idx < 0) break;
      const [gone] = state.inbox.splice(idx, 1);
      commit();
      toast("已删除", () => { state.inbox.splice(idx, 0, gone); commit(); });
      break;
    }

    /* --- 长期目标 --- */
    case "okr-add": {
      state.okr.push({ id: uid(), title: "", pct: 0, meta: "" });
      commit();
      const last = $$("#okrBar .okr[data-id]").pop();
      last?.querySelector('[data-field="okr-title"]')?.focus();
      break;
    }
    case "okr-del": {
      const idx = state.okr.findIndex((x) => x.id === id);
      if (idx < 0) break;
      const [gone] = state.okr.splice(idx, 1);
      commit();
      toast("已删除目标", () => { state.okr.splice(idx, 0, gone); commit(); });
      break;
    }

    /* --- 今日三件 --- */
    case "focus-toggle": break; // change 处理
    case "focus-del": {
      const idx = state.focus.findIndex((x) => x.id === id);
      if (idx < 0) break;
      const [gone] = state.focus.splice(idx, 1);
      commit();
      toast("已移除", () => { state.focus.splice(idx, 0, gone); commit(); });
      break;
    }
    case "focus-start": openFocus(id); break;

    /* --- 昨天没收口 --- */
    case "carry-pick": {
      const cid = el.closest("[data-cid]")?.dataset.cid;
      const idx = state.carry.findIndex((c) => c.id === cid);
      if (idx < 0) break;
      const [c] = state.carry.splice(idx, 1);
      state.focus.push({
        id: uid(), taskId: c.taskId || null, title: c.title, tag: c.tag || "",
        done: false, defer: (c.defer || 0) + 1, doneOn: null, day: todayISO()
      });
      commit();
      toast("捡回来了：" + c.title);
      break;
    }
    case "carry-drop": {
      const cid = el.closest("[data-cid]")?.dataset.cid;
      const idx = state.carry.findIndex((c) => c.id === cid);
      if (idx < 0) break;
      const [gone] = state.carry.splice(idx, 1);
      commit();
      toast("丢掉了（不算你完成）", () => { state.carry.splice(idx, 0, gone); commit(); });
      break;
    }

    /* --- 任务池 --- */
    case "task-cycle": {
      const t = state.tasks.find((x) => x.id === id);
      if (!t) break;
      t.status = t.status === "todo" ? "doing" : t.status === "doing" ? "done" : "todo";
      commit();
      break;
    }
    case "cal-prev": {
      state.ui.calWeek = (state.ui.calWeek || 0) - 1;
      commit();
      break;
    }
    case "cal-next": {
      state.ui.calWeek = (state.ui.calWeek || 0) + 1;
      commit();
      break;
    }
    case "cal-today": {
      state.ui.calWeek = 0;
      commit();
      break;
    }
    case "task-to-focus": {
      const t = state.tasks.find((x) => x.id === id);
      if (!t) break;
      if (t.status === "done") { toast("这条已经完成了，不用再放进今日"); break; }
      if (state.focus.some((f) => f.taskId === t.id && !focusDone(f))) { toast("今天三件里已经有了"); break; }
      state.focus.push({ id: uid(), taskId: t.id, title: t.title, tag: t.tag || "", done: false, defer: 0, doneOn: null, day: todayISO() });
      commit();
      toast("已放进今日三件：" + t.title);
      break;
    }
    case "task-to-plan": {
      const t = state.tasks.find((x) => x.id === id);
      if (!t) break;
      if (state.plan.items.some((p) => p.taskId === t.id)) { toast("本周计划里已经有了"); break; }
      state.plan.items.push({ id: uid(), taskId: t.id, title: t.title, tag: t.tag || "", done: false });
      commit();
      toast("已放进本周计划：" + t.title);
      break;
    }
    case "task-del": {
      const idx = state.tasks.findIndex((x) => x.id === id);
      if (idx < 0) break;
      const [gone] = state.tasks.splice(idx, 1);
      // 今日三件 / 周计划里引用这条任务的条目会变成悬空 taskId——
      // 它们会一直显示「未完成」且再也勾不动（找不到任务池那条）。
      // 断开链接前先把完成状态落到条目自己身上，别把已完成的变成没做。
      const wasDone = gone.status === "done";
      const linked = [];
      state.focus.forEach((f) => {
        if (f.taskId === gone.id) { f.taskId = null; if (wasDone) f.done = true; linked.push(f); }
      });
      state.plan.items.forEach((p) => {
        if (p.taskId === gone.id) { p.taskId = null; if (wasDone) p.done = true; linked.push(p); }
      });
      commit();
      toast(linked.length
        ? "已删除任务（今日三件/周计划里那几条已断开联动，可以单独勾选）"
        : "已删除",
        () => {
          state.tasks.splice(idx, 0, gone);
          linked.forEach((o) => { o.taskId = gone.id; });
          commit();
        });
      break;
    }

    /* --- 周计划 --- */
    case "plan-rollover": {
      // 开新周：把没做完的搬进 carry（顺延），完成的归档掉；主题清空等他重写
      const unfinished = state.plan.items.filter((p) => !planDone(p));
      unfinished.forEach((p) => {
        if (!state.carry.some((c) => c.title === p.title)) {
          state.carry.unshift({ id: uid(), title: p.title, tag: p.tag || "", taskId: p.taskId || null, defer: 1, fromDay: state.plan.weekOf || "" });
        }
      });
      const doneN = state.plan.items.length - unfinished.length;
      state.plan = { theme: "", items: [], weekOf: isoOf(weekStart()) };
      commit();
      toast(`开新的一周：${doneN} 件归档，${unfinished.length} 件顺延过来`);
      break;
    }
    case "plan-toggle": break;
    case "plan-split": {
      const p = state.plan.items.find((x) => x.id === id);
      if (!p) break;
      // 去重按「计划项 id」而不是 taskId：手工加的周计划项没有 taskId，
      // 原来的判断条件 `f.taskId && f.taskId === p.taskId` 对它们永远不成立，
      // 同一条能被无限次拆进今日。
      if (state.focus.some((f) => f.planId === p.id && !focusDone(f))) {
        toast("今天的三件里已经有了");
        break;
      }
      if (state.focus.some((f) => f.taskId && p.taskId && f.taskId === p.taskId && !focusDone(f))) {
        toast("今天的三件里已经有了");
        break;
      }
      state.focus.push({ id: uid(), taskId: p.taskId || null, planId: p.id, title: p.title, tag: p.tag || "", done: false, defer: 0, doneOn: null, day: todayISO() });
      commit();
      toast("已拆进今日三件：" + p.title);
      break;
    }
    case "plan-del": {
      state.plan.items = state.plan.items.filter((x) => x.id !== id);
      commit();
      break;
    }
    case "gen-review": {
      // 已经有手写内容时先问一句，别把用户写的东西冲掉
      const existing = (state.review.note || "").trim();
      if (existing && !existing.startsWith("本周计划完成")) {
        if (!confirm("复盘框里已经有你写的内容，生成草稿会覆盖它。继续？")) break;
      }
      const st = weekStats();
      const doneItems = state.plan.items.filter((i) => planDone(i)).map((i) => i.title);
      const carry = carryFocus().map((f) => f.title);
      state.review.note = [
        `本周计划完成 ${st.done}/${st.planned}${st.planned ? "（" + st.pct + "%）" : ""}。`,
        doneItems.length ? "完成：" + doneItems.join("、") + "。" : "",
        carry.length ? "顺延：" + carry.join("、") + "。" : "没有顺延项。",
        st.added != null ? `新增沉淀 ${st.added} 条。` : "",
        "下周最重要的一件事："
      ].filter(Boolean).join(" ");
      state.review.closedAt = new Date().toISOString();
      commit();
      toast("草稿已生成，补一句就收口");
      break;
    }

    /* --- 数据源（真实读取） --- */
    case "live-pull": pullLive({ refresh: true }); break;

    /* --- 数据源（手填快照，保留兼容） --- */
    case "snapshot-save": {
      const num = (sel) => {
        const v = $(sel)?.value;
        return v === "" || v == null ? null : Number(v);
      };
      state.snapshots.knowledge = { added: num('[data-field="know-added"]'), sessions: num('[data-field="know-sessions"]') };
      commit();
      toast("快照已存");
      break;
    }

    /* --- 顶栏 / 遮罩 / toast --- */
    case "export": {
      // live 是每次读取都会变的运行时数据，不该进备份：
      // 导出一份三个月前的文件，里面还写着当时的体重/会话数，导入后当成真的，那是假数据。
      const { live, ...keep } = state;
      const blob = new Blob([JSON.stringify(keep, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "个人工作台-" + todayISO() + ".json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 800);
      toast("已导出备份");
      break;
    }
    case "import": $("#fileInput").click(); break;
    case "clear": {
      if (!confirm("清空会删掉全部内容（包含目标、任务、计划、示例数据），只保留一份空表。建议先点「备份」导出。确定清空？")) break;
      state = emptyState();
      persist();
      render();
      toast("已清空（想恢复就导入之前备份的文件）");
      break;
    }
    case "fp-done": {
      if (fpId) toggleFocus(fpId);
      closeFocus();
      break;
    }
    case "fp-again": fpLeft = 120; drawTimer(); startTimer(); break;
    case "fp-defer": if (fpId) deferFocus(fpId); closeFocus(); break;
    case "fp-exit": closeFocus(); break;
    case "undo": if (lastUndo) { const fn = lastUndo; lastUndo = null; $("#toast").classList.remove("show"); fn(); } break;
  }
});

/* change：勾选框 / 下拉 */
ROOT.addEventListener("change", (e) => {
  const el = e.target;
  if (el.dataset.act === "focus-toggle") {
    const id = el.closest("[data-id]")?.dataset.id;
    if (!id) return;
    // checkbox 自己改不了 state，交给 toggleFocus（先回滚 DOM 再统一渲染）
    el.checked = !el.checked;
    toggleFocus(id);
    return;
  }
  if (el.dataset.act === "task-due") {
    const id = el.closest("[data-id]")?.dataset.id;
    const t = state.tasks.find((x) => x.id === id);
    if (!t) return;
    t.due = el.value || "";
    commit();
    toast(t.due ? "已排到 " + dueLabel(t.due) : "已清空日期");
    return;
  }
  if (el.dataset.act === "task-tag") {
    const id = el.closest("[data-id]")?.dataset.id;
    const t = state.tasks.find((x) => x.id === id);
    if (!t) return;
    let v = String(el.value || "").trim();
    // 标签是用户自己的分类法：写什么都行。只做两件最小规范化——
    // 去掉多余空格、没有 # 前缀就补一个（保持和旧数据一致的外观）。
    v = v.replace(/\s+/g, "");
    if (v && v[0] !== "#") v = "#" + v;
    if (v === "#") v = "";
    t.tag = v;
    // 今日三件 / 周计划里跟着这条任务走的条目，标签一起更新
    state.focus.forEach((f) => { if (f.taskId === t.id) f.tag = t.tag; });
    state.plan.items.forEach((p) => { if (p.taskId === t.id) p.tag = t.tag; });
    // 如果当前正按某个标签筛选，改完标签后这条可能不该显示了
    if (state.ui.tag && state.ui.tag !== "全部" && state.ui.tag !== t.tag) state.ui.tag = "全部";
    commit();
    toast(t.tag ? "标签改成 " + t.tag : "已清掉标签");
    return;
  }
  if (el.dataset.act === "quad-set") {
    const id = el.closest("[data-id]")?.dataset.id;
    const n = state.inbox.find((x) => x.id === id);
    if (!n) return;
    n.q = el.value;
    commit();
    if (n.q === "2") toast("Q2 的事，别只进不出——记得挑一件进今天");
    return;
  }
  if (el.dataset.act === "plan-toggle") {
    const id = el.closest("[data-id]")?.dataset.id;
    const p = state.plan.items.find((x) => x.id === id);
    if (!p) return;
    p.done = el.checked;
    syncTaskFrom(p, el.checked);
    // 拆进今日三件的同一条，状态跟着走
    state.focus.forEach((f) => {
      if (f.planId === p.id && !f.taskId) {
        f.done = el.checked;
        f.doneOn = el.checked ? todayISO() : null;
      }
    });
    commit();
    return;
  }
  if (el.id === "fileInput") {
    const f = el.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (!data || typeof data !== "object") throw new Error("文件内容不是有效的备份");
        // 版本不对就明确拒绝，不要假装成功——静默丢数据比报错更糟
        const ver = Number(data.version);
        if (data.version != null && ver !== SCHEMA) {
          throw new Error(`版本不符：备份是 v${data.version}，当前是 v${SCHEMA}。请用新版导出后再导入。`);
        }
        const next = normalizeState(data);
        const total = next.tasks.length + next.focus.length + next.inbox.length + next.plan.items.length;
        if (total === 0 && !next.review.note && !next.plan.theme) {
          throw new Error("这个备份里没有任何内容，已取消导入（现有数据没动）。");
        }
        state = next;
        cleanLegacyTags(state);
        persist();
        render();
        toast("已导入 " + total + " 条");
      } catch (err) {
        alert("导入失败：" + err.message);
      }
    };
    r.readAsText(f);
    el.value = "";
  }
});

/* 输入：轻量字段只落盘，不重渲染（避免打字时丢焦点） */
ROOT.addEventListener("input", (e) => {
  const el = e.target;
  if (el.id === "reviewNote") { state.review.note = el.value; persist(); return; }
  if (el.id === "planTheme") { state.plan.theme = el.textContent.trim(); persist(); return; }
  if (el.dataset.field === "okr-title" || el.dataset.field === "okr-meta" || el.dataset.field === "okr-pct") {
    const id = el.closest("[data-id]")?.dataset.id;
    const o = state.okr.find((x) => x.id === id);
    if (!o) return;
    if (el.dataset.field === "okr-title") o.title = el.textContent.trim();
    else if (el.dataset.field === "okr-meta") o.meta = el.textContent.trim();
    else {
      // 只取第一段数字，别把 1e3 里的 3 当成 13；超出 0–100 直接夹住
      const m = String(el.textContent).match(/-?\d+(?:\.\d+)?/);
      const v = m ? Number(m[0]) : 0;
      o.pct = Math.max(0, Math.min(100, Math.round(Number.isFinite(v) ? v : 0)));
    }
    persist();
    // 只更新进度条，不整体重渲染（否则光标会跳）
    const bar = el.closest(".okr")?.querySelector(".bar i");
    if (bar) bar.style.width = o.pct + "%";
    if (el.dataset.field === "okr-pct") {
      // 百分比夹住后要回显真实值，否则用户看到的是自己敲的 150，存的却是 100
      const want = o.pct + "%";
      if (el.textContent !== want) el.textContent = want;
    }
    return;
  }
});

/* 回车提交 */
ROOT.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const el = e.target;
  if (el.dataset.act === "task-tag" && e.key === "Enter") {
    e.preventDefault();
    el.blur();          // blur 触发 change，走上面那段逻辑
    return;
  }
  if (el.id === "focusNew") {
    e.preventDefault();
    const v = el.value.trim();
    if (!v) return;
    state.focus.push({ id: uid(), title: v, tag: "", done: false, defer: 0, doneOn: null, day: todayISO() });
    el.value = "";
    commit();
    if (activeFocus().length > MAX_FOCUS) toast("已经是第 " + activeFocus().length + " 件了，软提醒一下");
    return;
  }
  if (el.id === "taskNew") {
    e.preventDefault();
    const v = el.value.trim();
    if (!v) return;
    // 只在当前筛选的标签还存在时才沿用；否则新任务会被打上一个已不存在的标签
    const curTag = state.ui.tag && state.ui.tag !== "全部" && allTags().includes(state.ui.tag) ? state.ui.tag : "";
    addTask(v, curTag, "");
    el.value = "";
    commit();
    return;
  }
  if (el.id === "planNew") {
    e.preventDefault();
    const v = el.value.trim();
    if (!v) return;
    state.plan.items.push({ id: uid(), title: v, tag: "", done: false });
    el.value = "";
    commit();
    return;
  }
  if (["sideNote", "quickNote", "inboxInput"].includes(el.id)) {
    e.preventDefault();
    if (addInbox(el.value)) el.value = "";
    return;
  }
});

/* Esc 关遮罩 */
ROOT.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && $("#focusOverlay").classList.contains("open")) closeFocus();
});
$("#focusOverlay")?.addEventListener("click", (e) => { if (e.target.id === "focusOverlay") closeFocus(); });

}

/* ---------- 挂载 ---------- */
function mountWorkbench(root, opts = {}) {
  ROOT = root;
  STATS_URL = opts.statsUrl || "/workbench/stats";
  eventsBound = false;
  bindEvents();

  let loaded = null;
  try {
    const raw = SAFE_STORE.getItem(STORE_KEY);
    if (raw) loaded = JSON.parse(raw);
  } catch (e) { /* 存储坏了就走示例数据 */ }

  if (loaded && loaded.version === SCHEMA) {
    state = Object.assign(emptyState(), loaded);
  } else if (loaded) {
    state = migrate(loaded);   // v2 草稿 → 丢快照、只搬数据
  } else {
    const legacy = SAFE_STORE.getItem("workbench-prototype-v2-autosave");
    if (legacy) {
      try { state = migrate(JSON.parse(legacy)); } catch (e) { state = seedState(); }
    } else {
      state = seedState();
    }
  }
  // 跨天了就把昨天没做完的挪进「昨天没收口」。这一步必须在 render 之前，
  // 否则首屏会先显示昨天那几件、再闪一下变成空——那比不刷新更让人困惑。
  const rolled = rolloverDay();
  // 旧版本会自动给任务塞 #待定 / #搁置 这类标签，那是系统替用户做的分类，
  // 不是他自己的分类法。载入时清掉，让他重新决定。
  const cleaned = cleanLegacyTags(state);
  if (rolled || cleaned) persist();
  render();
  if (!loaded) persist();
  pullLive();

  return function unmount() {
    ROOT = null;
    eventsBound = false;
  };
}


    /* ---------------- React 外壳 ---------------- */
    function WorkbenchPanel() {
      const hostRef = useRef(null)

      useEffect(() => {
        const el = hostRef.current
        if (!el) return
        // 静态骨架只写一次；之后所有更新由核心的 render() 负责
        el.innerHTML = HTML
        const unmount = mountWorkbench(el, { statsUrl: '/workbench/stats' })
        return () => {
          if (typeof unmount === 'function') unmount()
          el.innerHTML = ''
        }
      }, [])

      return h('div', { className: 'wb-root', style: { height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' } },
        h('style', null, CSS),
        h('div', { ref: hostRef, style: { flex: '1 1 auto', minHeight: 0 } }))
    }

    function PanelIcon({ size, active }) {
      return h('span', {
        className: 'wb-panel-icon' + (active ? ' wb-panel-icon-active' : ''),
        style: { width: size, height: size },
        'aria-hidden': 'true',
      }, '工')
    }

    const ICON_CSS = `
.wb-panel-icon { display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; line-height: 1; color: var(--dsw-alias-label-secondary); }
.wb-panel-icon-active { color: var(--dsw-alias-brand-primary); }
`

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.effect(() => {
          const style = document.createElement('style')
          style.textContent = ICON_CSS
          document.head.appendChild(style)
          return () => style.remove()
        }, PKG + ': icon styles')

        ctx.effect(() => {
          const disposePage = ctx.slots.inject('main', () => ctx.slots.register({
            name: 'main',
            key: PANEL_ID,
          }, WorkbenchPanel))
          const disposeEntry = ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
            name: 'sidebar.panellist',
            id: PANEL_ID,
            order: 40,
            label: () => '个人工作台',
          }, PanelIcon))
          return () => { disposePage(); disposeEntry() }
        }, PKG + ': sidebar entry and panel')
      },
    }
  },
})
