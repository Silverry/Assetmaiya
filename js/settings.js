// ═══════════════════════════════════════════════════════════
//  settings.js — 系统设置弹窗
//  职责：SettingsModal（类别管理 + 标签维度树管理）
//  依赖：data.js（CATEGORIES, TAG_DIMS, rebuildTags）、theme.js（V, I, btnStyle）
//  被依赖：app.js（App 通过 showSettings 控制显隐）
//  副作用：save() 直接修改全局 CATEGORIES/TAG_DIMS，并通过
//          window.dispatchEvent('app_data_updated') 通知 App 刷新
// ═══════════════════════════════════════════════════════════

// ── SettingsModal (系统设置弹窗) ─────────────────────────
/**
 * 系统设置弹窗，包含类别管理和标签维度树管理两个 Tab
 * @param {function} onClose - 关闭弹窗回调
 * 副作用：save() 直接覆写全局 CATEGORIES/TAG_DIMS 并触发 'app_data_updated' 事件
 */
function SettingsModal({ onClose }) {
  const [tab, setTab] = useState("cat");
  const [cats, setCats] = useState(() => JSON.parse(JSON.stringify(CATEGORIES)));
  const [dims, setDims] = useState(() => JSON.parse(JSON.stringify(TAG_DIMS)));
  const [activeCat, setActiveCat] = useState(() => CATEGORIES[0]?.id || null);
  const [collapsedDims, setCollapsedDims] = useState({});

  const save = () => {
    CATEGORIES = cats;
    TAG_DIMS = dims;
    rebuildTags(TAG_DIMS);
    window.dispatchEvent(new Event('app_data_updated'));
    onClose();
  };

  const addCat = () => {
    const id = "c" + Date.now();
    setCats([...cats, { id, name: "新类别", icon: "📦" }]);
  };
  const updateCat = (id, name) => setCats(cats.map(c => c.id === id ? { ...c, name } : c));

  const addDim = (catId) => {
    if (!catId) return;
    const id = "d" + Date.now();
    setDims([...dims, { id, catId, name: "新标签维度", groups: [] }]);
  };
  const updateDim = (id, name) => setDims(dims.map(d => d.id === id ? { ...d, name } : d));
  const toggleDimRequired = (id) => setDims(dims.map(d => d.id === id ? { ...d, isRequired: !d.isRequired } : d));

  const addGrp = (dimId) => {
    const id = "g" + Date.now();
    setDims(dims.map(d => {
      if (d.id === dimId) return { ...d, groups: [...d.groups, { id, name: "新标签组", tags: [] }] };
      return d;
    }));
    setTimeout(() => {
      const el = document.getElementById("grp-" + id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };
  const updateGrp = (dimId, grpId, name) => {
    setDims(dims.map(d => {
      if (d.id === dimId) return { ...d, groups: d.groups.map(g => g.id === grpId ? { ...g, name } : g) };
      return d;
    }));
  };

  const addTagName = (dimId, grpId) => {
    const name = window.prompt("请输入新标签名称：");
    if (!name || !name.trim()) return;
    setDims(dims.map(d => {
      if (d.id === dimId) {
        return {
          ...d, groups: d.groups.map(g => {
            if (g.id === grpId) {
              if (g.tags.includes(name.trim())) return g;
              return { ...g, tags: [...g.tags, name.trim()] };
            }
            return g;
          })
        };
      }
      return d;
    }));
  };
  const updateTagName = (dimId, grpId, oldName) => {
    const name = window.prompt("请修改标签名称：", oldName);
    if (!name || !name.trim() || name.trim() === oldName) return;
    setDims(dims.map(d => {
      if (d.id === dimId) {
        return {
          ...d, groups: d.groups.map(g => {
            if (g.id === grpId) return { ...g, tags: g.tags.map(t => t === oldName ? name.trim() : t) };
            return g;
          })
        };
      }
      return d;
    }));
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease" }}>
      <div style={{ width: 800, height: "80%", background: V.bg, borderRadius: V.rLg, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: V.shLg }}>
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${V.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: 18, color: V.fg }}>系统设置</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: V.fgMuted }}>{I.X(20)}</button>
        </div>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <div style={{ width: 160, borderRight: `1px solid ${V.border}`, background: V.bg, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={() => setTab("cat")} style={{ padding: "10px 14px", textAlign: "left", borderRadius: V.r, border: "none", background: tab === "cat" ? V.blueBg : "transparent", color: tab === "cat" ? V.blue : V.fgSoft, cursor: "pointer", fontWeight: tab === "cat" ? 600 : 400 }}>类别管理</button>
            <button onClick={() => setTab("tag")} style={{ padding: "10px 14px", textAlign: "left", borderRadius: V.r, border: "none", background: tab === "tag" ? V.blueBg : "transparent", color: tab === "tag" ? V.blue : V.fgSoft, cursor: "pointer", fontWeight: tab === "tag" ? 600 : 400 }}>标签树管理</button>
          </div>

          <div style={{ flex: 1, padding: 24, overflowY: "auto", background: V.muted }}>
            {tab === "cat" ? (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 16, color: V.fg }}>所有类别</h3>
                  <button onClick={addCat} style={{ ...btnStyle("outline"), padding: "6px 14px" }}>{I.Plus(14)} 添加类别</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {cats.map(c => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: V.bg, border: `1px solid ${V.border}`, borderRadius: V.r, boxShadow: V.sh }}>
                      <span style={{ fontSize: 20 }}>{c.icon}</span>
                      <input value={c.name} onChange={e => updateCat(c.id, e.target.value)} style={{ flex: 1, border: `1px solid transparent`, padding: "6px 10px", borderRadius: 6, fontSize: 14, outline: "none" }} placeholder="类别名称" onFocus={e => e.target.style.border = `1px solid ${V.border}`} onBlur={e => e.target.style.border = "1px solid transparent"} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                  <select value={activeCat || ""} onChange={e => setActiveCat(e.target.value)} style={{ padding: "8px 12px", border: `1px solid ${V.border}`, borderRadius: V.r, fontSize: 14, outline: "none", minWidth: 140 }}>
                    {cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                  <button onClick={() => addDim(activeCat)} style={{ ...btnStyle("outline"), padding: "6px 14px" }}>{I.Plus(14)} 添加标签维度</button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {dims.filter(d => d.catId === activeCat).map((d, dIdx) => (
                    <div key={d.id} style={{ background: V.bg, border: `1px solid ${V.border}`, borderRadius: V.r, overflow: "hidden", boxShadow: V.sh }}>
                      <div style={{ padding: "10px 14px", background: V.muted, borderBottom: collapsedDims[d.id] ? "none" : `1px solid ${V.border}`, display: "flex", gap: 8, alignItems: "center" }}>
                        <span onClick={() => setCollapsedDims(p => ({ ...p, [d.id]: !p[d.id] }))} style={{ cursor: "pointer", display: "flex", alignItems: "center", color: V.fgMuted, transform: collapsedDims[d.id] ? "rotate(-90deg)" : "none", transition: "transform 0.15s" }}>{I.ChevD(12)}</span>
                        <span style={{ color: V.fgMuted, fontSize: 12 }}>#{dIdx + 1}</span>
                        <input value={d.name} onChange={e => updateDim(d.id, e.target.value)} style={{ flex: 1, fontWeight: 600, fontSize: 14, border: `1px solid transparent`, padding: "4px 8px", background: "transparent", borderRadius: 4, outline: "none" }} onFocus={e => e.target.style.border = `1px solid ${V.border}`} onBlur={e => e.target.style.border = "1px solid transparent"} placeholder="维度名称" />
                        <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: V.fgSoft, cursor: "pointer", marginRight: 8, userSelect: "none" }}>
                          <input type="checkbox" checked={!!d.isRequired} onChange={() => toggleDimRequired(d.id)} style={{ cursor: "pointer" }} />
                          必选
                        </label>
                        <button onClick={() => { if (collapsedDims[d.id]) setCollapsedDims(p => ({ ...p, [d.id]: false })); addGrp(d.id); }} style={{ ...btnStyle("ghost"), fontSize: 12 }}>{I.Plus(12)} 添加组</button>
                      </div>
                      {!collapsedDims[d.id] && (
                        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
                          {d.groups.map((g, gIdx) => (
                            <div key={g.id} id={`grp-${g.id}`} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ width: 4, height: 4, borderRadius: "50%", background: V.fgMuted }} />
                                <input value={g.name} onChange={e => updateGrp(d.id, g.id, e.target.value)} style={{ fontSize: 13, color: V.fgSoft, border: `1px solid transparent`, padding: "4px 8px", background: "transparent", borderRadius: 4, outline: "none", width: 140 }} onFocus={e => e.target.style.border = `1px solid ${V.border}`} onBlur={e => e.target.style.border = "1px solid transparent"} placeholder="标签组名称" />
                                <button onClick={() => addTagName(d.id, g.id)} style={{ ...btnStyle("ghost"), fontSize: 11, padding: "2px 6px" }}>{I.Plus(10)} 标签</button>
                              </div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingLeft: 20 }}>
                                {g.tags.map((t, tIdx) => (
                                  <span key={tIdx} onClick={() => updateTagName(d.id, g.id, t)} style={{ cursor: "pointer", background: V.secondary, padding: "4px 10px", borderRadius: V.rFull, fontSize: 12, border: `1px solid ${V.border}`, color: V.fgSoft }} title="点击修改名称">{t}</span>
                                ))}
                                {g.tags.length === 0 && <span style={{ fontSize: 12, color: V.fgMuted, padding: "4px 0" }}>无标签</span>}
                              </div>
                            </div>
                          ))}
                          {d.groups.length === 0 && <div style={{ color: V.fgMuted, fontSize: 12 }}>尚无标签组</div>}
                        </div>
                      )}
                    </div>
                  ))}
                  {dims.filter(d => d.catId === activeCat).length === 0 && <div style={{ color: V.fgMuted, fontSize: 13, padding: 40, textAlign: "center" }}>该类别下暂无标签维度</div>}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: "16px 24px", background: V.bg, borderTop: `1px solid ${V.border}`, display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button onClick={onClose} style={btnStyle("outline")}>取消</button>
          <button onClick={save} style={btnStyle("default")}>保存设置</button>
        </div>
      </div>
    </div>
  );
}
