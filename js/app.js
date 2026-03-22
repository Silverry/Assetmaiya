// ═══════════════════════════════════════════════════════════
//  app.js — 根组件 + 渲染入口
//  职责：App 组件管理全局状态（资产列表、筛选、分页），组合所有页面组件
//  依赖：data.js（INITIAL_ASSETS, CATEGORIES, tagById）、theme.js（V, I, font, mono, fmtSz, btnStyle）、
//        components.js（Badge）、pages.js（TagSidebar, DetailPanel）、
//        upload.js（UploadModal）、settings.js（SettingsModal）
//  被依赖：无（本文件是入口，最后加载）
// ═══════════════════════════════════════════════════════════

/**
 * App — 根组件，管理全局状态并组合所有子页面
 * 入口：ReactDOM.createRoot 渲染
 * 输入：无 props（从全局 INITIAL_ASSETS 初始化）
 * 副作用：监听 'app_data_updated' 事件（由 SettingsModal 触发）以刷新视图
 */
function App() {
  const [assets, setAssets] = useState(INITIAL_ASSETS);         // 写: handleUpload, DetailPanel.onDelete/onUpdate | 读: filtered, selAsset, 类别Tab计数
  const [search, setSearch] = useState("");                      // 写: 顶栏搜索框 | 读: filtered
  const [activeCat, setActiveCat] = useState(null);              // 写: 类别Tab点击 | 读: filtered, TagSidebar
  const [selectedTags, setSelectedTags] = useState(new Set());   // 写: toggleTag, 清除按钮 | 读: filtered, TagSidebar, 筛选栏
  const [viewMode, setViewMode] = useState("grid");              // 写: 视图切换按钮 | 读: 列表/网格渲染分支
  const [selected, setSelected] = useState(null);                // 写: 卡片点击, DetailPanel.onClose/onDelete | 读: selAsset, 卡片高亮
  const [sortBy, setSortBy] = useState("date");                  // 写: 排序下拉 | 读: filtered
  const [showSidebar, setShowSidebar] = useState(true);          // 写: 筛选按钮, TagSidebar.onHide | 读: 侧栏显隐
  const [showUpload, setShowUpload] = useState(false);           // 写: 上传按钮, UploadModal.onClose | 读: UploadModal 显隐
  const [showSettings, setShowSettings] = useState(false);       // 写: 设置按钮, SettingsModal.onClose | 读: SettingsModal 显隐
  // [UNCERTAIN] updateKey 值未被直接读取，仅通过 setUpdateKey 触发 re-render 以响应全局数据变更
  const [updateKey, setUpdateKey] = useState(0);
  const [page, setPage] = useState(1);                           // 写: 翻页按钮, 筛选条件变更时重置 | 读: visibleAssets 分页
  const [pageSize, setPageSize] = useState(50);                  // 写: 每页条数下拉 | 读: visibleAssets 分页

  const toggleTag = useCallback(id => { setSelectedTags(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }); }, []);

  useEffect(() => {
    const handler = () => setUpdateKey(k => k + 1);
    window.addEventListener('app_data_updated', handler);
    return () => window.removeEventListener('app_data_updated', handler);
  }, []);

  // 筛选+排序管线：类别 → 搜索 → 标签（维度间 AND，维度内 OR）→ 排序
  const filtered = useMemo(() => {
    let list = assets;
    if (activeCat) list = list.filter(a => a.catId === activeCat);
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(a => a.name.toLowerCase().includes(q)); }
    if (selectedTags.size > 0) {
      // 将选中标签按维度分组，实现"维度间 AND、维度内 OR"的筛选逻辑
      const tagsByDim = {};
      selectedTags.forEach(tid => {
        const t = tagById(tid);
        if (t) { tagsByDim[t.dId] = tagsByDim[t.dId] || []; tagsByDim[t.dId].push(tid); }
      });
      list = list.filter(a => {
        for (const dId in tagsByDim) {
          if (!tagsByDim[dId].some(tid => (a.tags ?? []).includes(tid))) return false;
        }
        return true;
      });
    }
    if (sortBy === "date") list = [...list].sort((a, b) => b.date.localeCompare(a.date));
    else if (sortBy === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "size") list = [...list].sort((a, b) => b.size - a.size);
    return list;
  }, [assets, activeCat, search, selectedTags, sortBy]);

  useEffect(() => { setPage(1); }, [activeCat, search, selectedTags, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const visibleAssets = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const selAsset = selected ? assets.find(a => a.id === selected) : null;

  const handleUpload = (newAssets) => {
    setAssets(prev => [...newAssets, ...prev]);
  };

  return (
    <div style={{ minHeight: "100vh", fontFamily: font, color: V.fg, background: "#FAFAFA", display: "flex", flexDirection: "column" }}>
      <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Noto+Sans+SC:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Top bar */}
      <div style={{ background: V.bg, borderBottom: `1px solid ${V.border}`, padding: "0 24px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32, height: 56 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, width: 204, flexShrink: 0 }}>资产库</h1>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", border: `1px solid ${V.border}`, borderRadius: V.r, background: V.muted }}>
            <span style={{ color: V.fgMuted }}>{I.Search(15)}</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索资产名称..." style={{ flex: 1, border: "none", outline: "none", fontSize: 14, fontFamily: font, color: V.fg, background: "transparent" }} />
            {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: V.fgMuted, display: "flex", padding: 0 }}>{I.X(15)}</button>}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: "auto" }}>
            <button onClick={() => setShowUpload(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: V.r, background: V.blue, color: "#fff", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", boxShadow: V.sh }}>{I.Upload(16)} 上传资产</button>
            <button onClick={() => setShowSettings(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: V.r, background: V.bg, color: V.fgSoft, fontSize: 13, fontWeight: 500, border: `1px solid ${V.border}`, cursor: "pointer", boxSizing: "border-box" }}>{I.Settings(16)}</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 0, marginTop: -1 }}>
          {[{ id: null, name: "全部", icon: "" }, ...CATEGORIES].map(c => {
            const isA = activeCat === c.id; const count = c.id === null ? assets.length : assets.filter(a => a.catId === c.id).length;
            return <button key={c.id || "all"} onClick={() => setActiveCat(isA && c.id !== null ? null : c.id)} style={{ padding: "10px 18px", fontSize: 13, fontWeight: isA ? 600 : 400, color: isA ? V.fg : V.fgMuted, background: "none", border: "none", borderBottom: isA ? `2px solid ${V.primary}` : "2px solid transparent", cursor: "pointer", fontFamily: font, transition: "all .12s" }}>{c.icon}{c.icon ? " " : ""}{c.name} <span style={{ fontSize: 11, color: V.fgMuted, fontFamily: mono, marginLeft: 4 }}>{count}</span></button>;
          })}
        </div>
      </div>

      {selectedTags.size > 0 && (
        <div style={{ background: V.bg, borderBottom: `1px solid ${V.border}`, padding: "8px 24px", display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: V.fgMuted, marginRight: 4 }}>筛选中:</span>
          {Array.from(selectedTags ?? []).map(tid => { const t = tagById(tid); return t ? <Badge key={tid} onRemove={() => toggleTag(tid)}>{t.name}</Badge> : null; })}
          <button onClick={() => setSelectedTags(new Set())} style={{ background: "none", border: "none", fontSize: 12, color: V.destructive, cursor: "pointer", fontFamily: font, marginLeft: 8 }}>清除全部</button>
        </div>
      )}

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {showSidebar && <TagSidebar activeCat={activeCat} selectedTags={selectedTags} onToggle={toggleTag} onClear={() => setSelectedTags(new Set())} onHide={() => setShowSidebar(false)} />}

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px 0", flexShrink: 0 }}>
            <button onClick={() => setShowSidebar(!showSidebar)} style={{ display: "flex", alignItems: "center", gap: 6, height: 30, padding: "0 10px", border: `1px solid ${showSidebar ? V.primary : V.border}`, borderRadius: V.r, background: showSidebar ? V.primary : V.bg, color: showSidebar ? V.primaryFg : V.fgSoft, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: font, boxSizing: "border-box" }}>{I.Filter(13)} 筛选{selectedTags.size > 0 ? ` (${selectedTags.size})` : ""}</button>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "0 10px", height: 30, border: `1px solid ${V.border}`, borderRadius: V.r, fontSize: 12, fontFamily: font, color: V.fgSoft, background: V.bg, outline: "none", cursor: "pointer", fontWeight: 500 }}>
              <option value="date">按日期</option><option value="name">按名称</option><option value="size">按大小</option>
            </select>
            <div style={{ display: "flex", border: `1px solid ${V.border}`, borderRadius: V.r, overflow: "hidden", height: 30, boxSizing: "border-box" }}>
              {[["grid", I.Grid], ["list", I.List]].map(([m, icon]) => <button key={m} onClick={() => setViewMode(m)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: "100%", border: "none", cursor: "pointer", background: viewMode === m ? V.primary : V.bg, color: viewMode === m ? V.primaryFg : V.fgMuted }}>{icon(14)}</button>)}
            </div>
            <div style={{ fontSize: 12, color: V.fgMuted, fontFamily: font, marginLeft: 6 }}>
              共 <span style={{ fontWeight: 600, color: V.fgSoft, fontFamily: mono }}>{filtered.length}</span> 条 &nbsp; 第 <span style={{ fontWeight: 600, color: V.fgSoft, fontFamily: mono }}>{currentPage}</span> / {totalPages} 页
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: V.fgMuted }}>
                <div style={{ fontSize: 40, marginBottom: 12, opacity: .3 }}>{I.Search(40)}</div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>没有找到匹配的资产</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>尝试调整搜索关键词或筛选条件</div>
              </div>
            ) : viewMode === "grid" ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                {visibleAssets.map(a => {
                  const isSel = selected === a.id; const cat = CATEGORIES.find(c => c.id === a.catId);
                  return <div key={a.id} onClick={() => setSelected(isSel ? null : a.id)} className={`app-grid-card ${isSel ? 'sel' : ''}`} style={{ borderRadius: V.rLg, overflow: "hidden", cursor: "pointer", border: `2px solid ${isSel ? V.ring : V.border}`, background: V.bg, boxShadow: isSel ? `0 0 0 2px ${V.ring}33` : V.sh, transition: "all .15s" }}>
                    <div style={{ aspectRatio: "4/3", background: a.color, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      {a.type === "video" && <div style={{ width: 36, height: 36, borderRadius: V.rFull, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{I.Play(18)}</div>}
                      {a.type === "image" && <span style={{ color: "rgba(0,0,0,.1)", fontSize: 32 }}>{I.Img(32)}</span>}
                      {cat && <span style={{ position: "absolute", top: 6, left: 6, padding: "1px 6px", borderRadius: V.rFull, fontSize: 10, background: "rgba(255,255,255,.85)", color: V.fgSoft, fontWeight: 500 }}>{cat.icon} {cat.name}</span>}
                    </div>
                    <div style={{ padding: "10px 12px" }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: V.fg, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>{a.name}</div>
                      <div style={{ display: "flex", gap: 8, fontSize: 11, color: V.fgMuted, fontFamily: mono }}><span>{fmtSz(a.size)}</span><span>{a.date}</span></div>
                      {(a.tags ?? []).length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 6 }}>
                        {(a.tags ?? []).slice(0, 3).map(tid => { const t = tagById(tid); return t ? <span key={tid} style={{ fontSize: 10, padding: "1px 5px", borderRadius: V.rFull, background: V.secondary, color: V.fgSoft }}>{t.name}</span> : null; })}
                        {(a.tags ?? []).length > 3 && <span style={{ fontSize: 10, padding: "1px 5px", borderRadius: V.rFull, background: V.secondary, color: V.fgMuted }}>+{(a.tags ?? []).length - 3}</span>}
                      </div>}
                    </div>
                  </div>;
                })}
              </div>
            ) : (
              <div style={{ border: `1px solid ${V.border}`, borderRadius: V.rLg, overflow: "hidden", background: V.bg }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 140px 100px", gap: 12, padding: "8px 16px", background: V.muted, borderBottom: `1px solid ${V.border}`, fontSize: 12, fontWeight: 600, color: V.fgMuted }}>
                  <span>名称</span><span>类别</span><span>标签</span><span style={{ textAlign: "right" }}>大小</span>
                </div>
                {visibleAssets.map((a, i) => {
                  const isSel = selected === a.id; const cat = CATEGORIES.find(c => c.id === a.catId);
                  return <div key={a.id} onClick={() => setSelected(isSel ? null : a.id)} className={`app-list-card ${isSel ? 'sel' : ''}`} style={{ display: "grid", gridTemplateColumns: "1fr 80px 140px 100px", gap: 12, padding: "10px 16px", cursor: "pointer", background: isSel ? V.blueBg : i % 2 === 0 ? "transparent" : V.muted, borderBottom: `1px solid ${V.border}`, transition: "background .1s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 6, background: a.color, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {a.type === "video" ? <span style={{ color: "rgba(0,0,0,.25)" }}>{I.Vid(14)}</span> : <span style={{ color: "rgba(0,0,0,.15)" }}>{I.Img(14)}</span>}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>{cat ? <span style={{ fontSize: 12, color: V.fgSoft }}>{cat.icon} {cat.name}</span> : <span style={{ fontSize: 12, color: V.fgMuted }}>—</span>}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 3, overflow: "hidden" }}>
                      {(a.tags ?? []).slice(0, 2).map(tid => { const t = tagById(tid); return t ? <span key={tid} style={{ fontSize: 10, padding: "1px 5px", borderRadius: V.rFull, background: V.secondary, color: V.fgSoft, whiteSpace: "nowrap" }}>{t.name}</span> : null; })}
                      {(a.tags ?? []).length > 2 && <span style={{ fontSize: 10, color: V.fgMuted }}>+{(a.tags ?? []).length - 2}</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: 12, color: V.fgMuted, fontFamily: mono }}>{fmtSz(a.size)}</div>
                  </div>;
                })}
              </div>
            )}
            {filtered.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", marginTop: 16, borderTop: `1px solid ${V.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 13, color: V.fgMuted }}>共 {filtered.length} 个资产</span>
                  <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} style={{ padding: "4px 8px", border: `1px solid ${V.border}`, borderRadius: V.r, fontSize: 13, fontFamily: font, color: V.fgSoft, background: V.bg, outline: "none", cursor: "pointer" }}>
                    <option value={30}>30 条/页</option>
                    <option value={50}>50 条/页</option>
                    <option value={100}>100 条/页</option>
                  </select>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ ...btnStyle("outline"), padding: "4px 12px", opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? "not-allowed" : "pointer" }}>上一页</button>
                  <span style={{ fontSize: 13, color: V.fgMuted, minWidth: 60, textAlign: "center" }}>{currentPage} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ ...btnStyle("outline"), padding: "4px 12px", opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}>下一页</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {selAsset && <DetailPanel asset={selAsset} onClose={() => setSelected(null)} onUpdate={u => setAssets(p => p.map(a => a.id === u.id ? u : a))} onDelete={id => { setAssets(p => p.filter(a => a.id !== id)); setSelected(null); }} />}
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUpload={handleUpload} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(<App />);
}
