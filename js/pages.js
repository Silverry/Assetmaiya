// ═══════════════════════════════════════════════════════════
//  pages.js — 主界面页面级组件
//  职责：TagSidebar（标签筛选侧栏）、DetailPanel（资产详情面板）
//  依赖：data.js（TAG_DIMS, CATEGORIES, ENTITIES, tagById）、
//        theme.js（V, I, font, mono, fmtSz, btnStyle）、
//        components.js（CBox, Badge, TagModal）
//  被依赖：app.js（App 组件渲染 TagSidebar 和 DetailPanel）
// ═══════════════════════════════════════════════════════════

// ── TagSidebar (标签筛选侧栏) ───────────────────────────
/**
 * 三级树形标签筛选侧栏（维度→组→标签），支持搜索、折叠、多选
 * @param {string|null} activeCat - 当前激活的类别 ID，null 表示全部
 * @param {Set} selectedTags - 已选中的标签 ID 集合
 * @param {function} onToggle - 切换单个标签的选中状态，参数为 tagId
 * @param {function} onClear - 清除所有已选标签
 * @param {function} onHide - 隐藏侧栏回调
 */
function TagSidebar({ activeCat, selectedTags, onToggle, onClear, onHide }) {
  // 默认只展开第一个维度，其余折叠（i !== 0 表示非首维度）
  const [cDims, setCDims] = useState(() => {
    const init = {};
    TAG_DIMS.forEach((d, i) => { if (i !== 0) init[d.id] = true; });
    return init;
  });
  // 默认只展开第一个维度的第一个组，其余折叠
  const [cGrps, setCGrps] = useState(() => {
    const init = {};
    TAG_DIMS.forEach((d, i) => {
      d.groups.forEach((g, j) => { if (i !== 0 || j !== 0) init[g.id] = true; });
    });
    return init;
  });
  const [q, setQ] = useState("");
  const ql = q.toLowerCase();
  const dimCnt = dim => { let c = 0; (dim.groups ?? []).forEach(g => (g.tagObjs ?? []).forEach(t => { if (selectedTags.has(t.id)) c++; })); return c; };
  const grpCnt = g => (g.tagObjs ?? []).filter(t => selectedTags.has(t.id)).length;
  const filteredDims = useMemo(() => activeCat ? TAG_DIMS.filter(d => d.catId === activeCat) : TAG_DIMS, [activeCat]);

  return (
    <div style={{ width: 260, flexShrink: 0, borderRight: `1px solid ${V.border}`, display: "flex", flexDirection: "column", background: V.bg, overflow: "hidden" }}>
      <div style={{ flexShrink: 0, padding: "12px 14px", borderBottom: `1px solid ${V.border}`, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: V.fgSoft }}>{I.Filter(15)}</span>
          <span style={{ fontSize: 14, fontWeight: 600 }}>标签筛选</span>
          {onHide && (
            <button onClick={onHide} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: V.fgMuted, display: "flex", alignItems: "center", justifyContent: "center", padding: 4, borderRadius: 4 }}
              onMouseEnter={e => e.currentTarget.style.background = V.muted}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
            </button>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", border: `1px solid ${V.border}`, borderRadius: 6, background: V.muted }}>
          <span style={{ color: V.fgMuted }}>{I.Search(12)}</span>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="搜索标签..."
            style={{ flex: 1, border: "none", outline: "none", fontSize: 12, fontFamily: font, color: V.fg, background: "transparent" }} />
          {q && <span onClick={() => setQ("")} style={{ cursor: "pointer", color: V.fgMuted, display: "flex" }}>{I.X(10)}</span>}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
        {filteredDims.map(dim => {
          const fGroups = ql ? dim.groups.map(g => ({ ...g, tagObjs: (g.tagObjs ?? []).filter(t => t.name.toLowerCase().includes(ql) || g.name.toLowerCase().includes(ql) || dim.name.toLowerCase().includes(ql)) })).filter(g => (g.tagObjs ?? []).length > 0) : dim.groups;
          if (ql && fGroups.length === 0) return null;
          const isDC = cDims[dim.id] && !ql; const dc = dimCnt(dim);
          return <div key={dim.id}>
            <div onClick={() => setCDims(p => ({ ...p, [dim.id]: !p[dim.id] }))} className="hover-dim" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", cursor: "pointer", background: V.muted, borderBottom: `1px solid ${V.border}`, borderTop: `1px solid ${V.border}`, marginTop: -1 }}>
              <span style={{ transform: isDC ? "rotate(-90deg)" : "none", transition: "transform .12s", color: V.fgMuted, flexShrink: 0 }}>{I.ChevD(10)}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: V.fg }}>{dim.name}</span>
              {dc > 0 && <span style={{ fontSize: 9, fontWeight: 600, padding: "0 5px", borderRadius: V.rFull, background: V.blue, color: "#fff", lineHeight: "16px", minWidth: 16, textAlign: "center" }}>{dc}</span>}
            </div>
            {!isDC && fGroups.map(g => {
              const isGC = cGrps[g.id] && !ql; const gc = grpCnt(g);
              return <div key={g.id}>
                <div onClick={() => setCGrps(p => ({ ...p, [g.id]: !p[g.id] }))} className="hover-group" style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px 6px 26px", cursor: "pointer" }}>
                  <span style={{ transform: isGC ? "rotate(-90deg)" : "none", transition: "transform .12s", color: V.fgMuted, flexShrink: 0 }}>{I.ChevD(9)}</span>
                  <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: V.fgSoft }}>{g.name}</span>
                  <span style={{ fontSize: 10, color: V.fgMuted, fontFamily: mono, flexShrink: 0 }}>{(g.tagObjs ?? []).length}</span>
                  {gc > 0 && <span style={{ fontSize: 8, fontWeight: 600, padding: "0 4px", borderRadius: V.rFull, background: V.blue, color: "#fff", lineHeight: "14px", minWidth: 14, textAlign: "center", flexShrink: 0 }}>{gc}</span>}
                </div>
                {!isGC && <div style={{ padding: "0 14px 2px 40px" }}>{(g.tagObjs ?? []).map(t => {
                  const on = selectedTags.has(t.id);
                  return <div key={t.id} onClick={() => onToggle(t.id)} className="hover-tag" style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 6px", cursor: "pointer", borderRadius: 4, fontSize: 12, color: on ? V.fg : V.fgSoft, fontWeight: on ? 500 : 400 }}>
                    <CBox on={on} onClick={() => { }} size={14} /><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
                  </div>;
                })}</div>}
              </div>;
            })}
          </div>;
        })}
      </div>
    </div>
  );
}

// ── DetailPanel (资产详情面板) ───────────────────────────
/**
 * 资产详情面板，展示预览（支持全屏）、基本信息、标签编辑、下载/删除操作
 * @param {Asset} asset - 当前选中的资产对象
 * @param {function} onClose - 关闭面板回调
 * @param {function} onUpdate - 更新资产回调，参数为修改后的 asset 对象
 * @param {function} onDelete - 删除资产回调，参数为 asset.id
 */
function DetailPanel({ asset, onClose, onUpdate, onDelete }) {
  const [tagOpen, setTagOpen] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");

  useEffect(() => {
    if (asset && asset.file && (asset.file instanceof Blob || asset.file instanceof File)) {
      const url = URL.createObjectURL(asset.file);
      setMediaUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setMediaUrl("");
    }
  }, [asset]);

  if (!asset) return null;
  const cat = CATEGORIES.find(c => c.id === asset.catId);
  const ent = ENTITIES.find(e => e.id === asset.entId);

  const handleDownload = () => {
    if (mediaUrl) {
      const a = document.createElement('a');
      a.href = mediaUrl;
      a.download = asset.file?.name || asset.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert('演示数据无法下载');
    }
  };

  return (
    <div style={{ width: 340, flexShrink: 0, borderLeft: `1px solid ${V.border}`, background: V.bg, display: "flex", flexDirection: "column", overflowY: "auto", animation: "panelSlide .2s ease" }}>
      <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${V.border}` }}>
        <span style={{ fontSize: 14, fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>资产详情</span>
        <button onClick={onClose} className="hover-detail-close" style={{ background: "none", border: "none", cursor: "pointer", color: V.fgMuted, display: "flex", padding: 4, borderRadius: 6 }}>{I.X(16)}</button>
      </div>
      <div onClick={() => setFullScreen(true)} style={{ position: "relative", aspectRatio: "4/3", background: asset.color || V.muted, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden" }}>
        {mediaUrl ? (
          asset.type === "image" ? (
            <img src={mediaUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <video src={mediaUrl} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )
        ) : (
          <>
            {asset.type === "video" && <div style={{ width: 48, height: 48, borderRadius: V.rFull, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{I.Play(24)}</div>}
            {asset.type === "image" && <span style={{ color: "rgba(0,0,0,.15)", fontSize: 48 }}>{I.Img(48)}</span>}
          </>
        )}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", transition: "background .2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0)"} />
        <span style={{ position: "absolute", top: 8, right: 8, padding: "2px 8px", borderRadius: V.rFull, fontSize: 11, fontWeight: 500, fontFamily: mono, background: "rgba(255,255,255,.9)", color: V.fgSoft, zIndex: 2 }}>{asset.type}</span>
      </div>
      <div style={{ padding: "12px 16px", display: "flex", gap: 8, borderBottom: `1px solid ${V.border}` }}>
        <button onClick={handleDownload} style={{ ...btnStyle("outline"), flex: 1, fontSize: 13, gap: 6, color: V.fg, borderColor: V.border }}>
          {I.Download(14)} 下载
        </button>
        <button onClick={() => { if (window.confirm("确定要删除该资产吗？")) onDelete(asset.id); }} style={{ ...btnStyle("outline"), flex: 1, fontSize: 13, gap: 6, color: V.destructive, borderColor: "rgba(239, 68, 68, 0.3)", background: "rgba(239, 68, 68, 0.05)" }}>
          {I.Trash(14)} 删除
        </button>
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: V.fg, marginBottom: 4, wordBreak: "break-all" }}>{asset.name}</div>
          <div style={{ display: "flex", gap: 12, fontSize: 12, color: V.fgMuted, fontFamily: mono }}><span>{fmtSz(asset.size)}</span><span>{asset.date}</span></div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: V.fgMuted, marginBottom: 6 }}>类别</div>
          {cat ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: V.rFull, fontSize: 13, fontWeight: 500, background: V.amberBg, color: "#92400E" }}>{cat.icon} {cat.name}</span> : <span style={{ fontSize: 13, color: V.fgMuted }}>未分类</span>}
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: V.fgMuted }}>标签</span>
            <button onClick={() => setTagOpen(true)} style={{ ...btnStyle("ghost"), padding: "2px 6px", fontSize: 12, color: V.blue, background: "transparent" }}>编辑标签</button>
          </div>
          {(asset.tags ?? []).length > 0 ? <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{(asset.tags ?? []).map(tid => { const t = tagById(tid); return t ? <Badge key={tid} onRemove={() => onUpdate({ ...asset, tags: (asset.tags ?? []).filter(x => x !== tid) })}>{t.dName} · {t.name}</Badge> : null; })}</div> : <span style={{ fontSize: 13, color: V.fgMuted }}>无标签</span>}
        </div>
        {ent && <div><div style={{ fontSize: 12, fontWeight: 500, color: V.fgMuted, marginBottom: 6 }}>关联实体</div><span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: V.rFull, fontSize: 13, fontWeight: 500, background: V.purpleBg, color: V.purple }}>{I.Cube(12)} {ent.name}</span></div>}
      </div>
      {tagOpen && <TagModal catId={asset.catId} selected={asset.tags} onConfirm={t => { onUpdate({ ...asset, tags: t }); setTagOpen(false); }} onClose={() => setTagOpen(false)} />}

      {fullScreen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn .2s ease" }} onClick={() => setFullScreen(false)}>
          <button style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,.1)", border: "none", color: "#fff", padding: 8, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setFullScreen(false)}>
            {I.X(24)}
          </button>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: "90%", maxHeight: "90%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {mediaUrl ? (
              asset.type === "image" ? (
                <img src={mediaUrl} style={{ maxWidth: "100%", maxHeight: "90vh", objectFit: "contain", borderRadius: 8 }} />
              ) : (
                <video src={mediaUrl} controls autoPlay style={{ maxWidth: "100%", maxHeight: "90vh", objectFit: "contain", borderRadius: 8 }} />
              )
            ) : (
              <div style={{ color: "rgba(255,255,255,.5)", fontSize: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                {asset.type === "image" ? <span style={{ fontSize: 64 }}>{I.Img(64)}</span> : <span style={{ fontSize: 64 }}>{I.Vid(64)}</span>}
                演示数据无真实文件可预览
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
