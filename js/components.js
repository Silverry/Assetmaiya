// ═══════════════════════════════════════════════════════════
//  components.js — 可复用 UI 原子/分子组件
//  职责：CBox、Badge、Thumb、CategorySelect、EntityPicker、TagModal
//  依赖：data.js（CATEGORIES, TAG_DIMS, ALL_TAGS, tagById）、theme.js（V, I, font, mono, ft, btnStyle, uid）
//  被依赖：pages.js、upload.js（通过全局作用域引用组件）
//  所有组件通过 props 接收数据，不依赖全局 state
// ═══════════════════════════════════════════════════════════
const { useState, useMemo, useCallback, useRef, useEffect } = React;

// ── CBox (复选框) ────────────────────────────────────────
function CBox({ on, onClick: oc, size = 15 }) {
  return (
    <div onClick={oc} style={{
      width: size, height: size, borderRadius: 3, flexShrink: 0, cursor: "pointer",
      border: on ? "none" : `1.5px solid ${V.border}`,
      background: on ? V.primary : V.bg,
      display: "flex", alignItems: "center", justifyContent: "center", transition: "all .1s",
    }}>
      {on && <span style={{ color: "#fff" }}>{I.Check(size - 4)}</span>}
    </div>
  );
}

// ── Badge (标签徽章) ─────────────────────────────────────
function Badge({ children, color = V.fg, bg = V.muted, onRemove }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 8px",
      borderRadius: V.rFull, fontSize: 12, fontWeight: 500, background: bg, color,
      whiteSpace: "nowrap", border: `1px solid ${color}15`,
    }}>
      {children}
      {onRemove && (
        <span onClick={e => { e.stopPropagation(); onRemove(); }}
          style={{ cursor: "pointer", opacity: .4, display: "flex", alignItems: "center", marginLeft: 2 }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = .4}
        >{I.X(10)}</span>
      )}
    </span>
  );
}

// ── Thumb (文件缩略图) ───────────────────────────────────
function Thumb({ file, size = 72 }) {
  const [url] = useState(() => (file instanceof Blob || file instanceof File) ? URL.createObjectURL(file) : "");
  const t = ft(file);
  useEffect(() => {
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [url]);
  return (
    <div style={{
      width: size, height: size, borderRadius: V.r, overflow: "hidden", flexShrink: 0,
      background: V.muted, border: `1px solid ${V.border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {(t === "image" && url) ? <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : (t === "video" && url) ? <video src={url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ color: V.fgMuted }}>{I.Img()}</span>}
    </div>
  );
}

// ── CategorySelect (类别选择下拉) ────────────────────────
/**
 * 类别选择下拉组件，渲染 CATEGORIES 列表供用户选择
 * @param {string} value - 当前选中的 catId
 * @param {function} onChange - 选中后回调，参数为 catId
 */
function CategorySelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const cur = CATEGORIES.find(c => c.id === value);
  return (
    <div style={{ position: "relative" }}>
      <div onClick={() => setOpen(!open)} style={{
        display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
        border: `1px solid ${V.border}`, borderRadius: V.r, cursor: "pointer",
        fontSize: 13, color: cur ? V.fg : V.fgMuted, background: V.bg,
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "#D1D5DB"}
        onMouseLeave={e => e.currentTarget.style.borderColor = V.border}
      >
        {I.Folder(14)}
        <span style={{ flex: 1 }}>{cur ? cur.name : "选择类别..."}</span>
        <span style={{ color: V.fgMuted, transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}>{I.ChevD()}</span>
      </div>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, marginTop: 4,
          background: V.bg, border: `1px solid ${V.border}`, borderRadius: V.r,
          boxShadow: V.shMd, overflow: "hidden",
        }}>
          {CATEGORIES.map(c => {
            const s = value === c.id;
            return (
              <div key={c.id} onClick={() => { onChange(c.id); setOpen(false); }} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "9px 14px",
                cursor: "pointer", fontSize: 13, color: s ? V.blue : V.fg,
                background: s ? V.blueBg : "transparent", fontWeight: s ? 500 : 400,
              }}
                onMouseEnter={e => { if (!s) e.currentTarget.style.background = V.muted; }}
                onMouseLeave={e => { if (!s) e.currentTarget.style.background = s ? V.blueBg : "transparent"; }}
              >
                <span style={{ flex: 1 }}>{c.name}</span>
                {s && <span style={{ color: V.blue }}>{I.Check(13)}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── EntityPicker (实体选择器) ─────────────────────────────
/**
 * 实体选择/新建组件，支持从列表选择或内联创建新实体
 * @param {Array} entities - 可选实体列表
 * @param {string|null} value - 当前关联的实体 ID
 * @param {function} onSelect - 选中实体回调，参数为 entId 或 null
 * @param {function} onCreate - 新建实体回调，参数为 {id, name, catId} 对象
 */
function EntityPicker({ entities, value, onSelect, onCreate }) {
  const [open, setOpen] = useState(false);
  const [making, setMaking] = useState(false);
  const [nn, setNn] = useState(""); const [nc, setNc] = useState("");
  const ent = entities.find(e => e.id === value);
  return (
    <div style={{ position: "relative" }}>
      <div onClick={() => setOpen(!open)} style={{
        display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
        border: `1px solid ${V.border}`, borderRadius: V.r, cursor: "pointer",
        fontSize: 13, color: ent ? V.fg : V.fgMuted, background: V.bg,
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = "#D1D5DB"}
        onMouseLeave={e => e.currentTarget.style.borderColor = V.border}
      >
        {I.Cube(14)} <span style={{ flex: 1 }}>{ent ? ent.name : "选择或创建实体..."}</span>
        <span style={{ color: V.fgMuted, transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}>{I.ChevD()}</span>
      </div>
      {open && (
        <div style={{ position: "absolute", bottom: "100%", left: 0, right: 0, zIndex: 50, marginBottom: 4, background: V.bg, border: `1px solid ${V.border}`, borderRadius: V.r, boxShadow: V.shMd, maxHeight: 260, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ overflowY: "auto", flex: 1 }}>
            <div onClick={() => { onSelect(null); setOpen(false); }} style={{ padding: "8px 14px", cursor: "pointer", fontSize: 13, color: !value ? V.blue : V.fgMuted }}
              onMouseEnter={e => e.currentTarget.style.background = V.muted} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>不关联</div>
            {entities.map(en => (
              <div key={en.id} onClick={() => { onSelect(en.id); setOpen(false); }} style={{ padding: "8px 14px", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6, color: value === en.id ? V.blue : V.fg, background: value === en.id ? V.blueBg : "transparent" }}
                onMouseEnter={e => { if (value !== en.id) e.currentTarget.style.background = V.muted; }}
                onMouseLeave={e => { if (value !== en.id) e.currentTarget.style.background = value === en.id ? V.blueBg : "transparent"; }}
              >{I.Cube(12)} <span>{en.name}</span>{en.catId && <span style={{ marginLeft: "auto", fontSize: 11, color: V.fgMuted }}>{CATEGORIES.find(c => c.id === en.catId)?.name}</span>}</div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${V.border}`, padding: 10 }}>
            {!making ? (
              <button onClick={() => setMaking(true)} style={{ ...btnStyle("outline"), width: "100%" }}>{I.Plus(12)} 新建实体</button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <input autoFocus value={nn} onChange={e => setNn(e.target.value)} placeholder="实体名称" style={{ width: "100%", padding: "7px 10px", border: `1px solid ${V.border}`, borderRadius: V.r, fontSize: 13, fontFamily: font, color: V.fg, outline: "none", boxSizing: "border-box" }} />
                <select value={nc} onChange={e => setNc(e.target.value)} style={{ width: "100%", padding: "7px 10px", border: `1px solid ${V.border}`, borderRadius: V.r, fontSize: 13, fontFamily: font, color: V.fg, outline: "none", boxSizing: "border-box", background: V.bg }}>
                  <option value="">所属类别（可选）</option>
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setMaking(false)} style={{ ...btnStyle("outline"), flex: 1, padding: "6px 0" }}>取消</button>
                  <button onClick={() => { if (!nn.trim()) return; const en = { id: uid(), name: nn.trim(), catId: nc || null }; onCreate(en); onSelect(en.id); setNn(""); setNc(""); setMaking(false); setOpen(false); }} style={{ ...btnStyle("default"), flex: 1, padding: "6px 0", opacity: nn.trim() ? 1 : .4 }}>创建</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── TagModal (标签选择弹窗) ──────────────────────────────
/**
 * 标签选择弹窗，按维度分 Tab 浏览标签，支持搜索、全选/清空、已选预览
 * @param {string[]} selected - 已选标签 ID 列表
 * @param {string} catId - 当前资产的类别 ID，用于过滤相关维度
 * @param {function} onConfirm - 确认回调，参数为选中的标签 ID 数组
 * @param {function} onClose - 关闭弹窗回调
 */
function TagModal({ selected, catId, onConfirm, onClose }) {
  const [sel, setSel] = useState(() => new Set(selected));
  const [search, setSearch] = useState("");

  // 按类别过滤维度；若该类别无专属维度则回退显示所有维度
  const filteredDims = useMemo(() => {
    const d = TAG_DIMS.filter(dim => dim.catId === catId);
    return d.length ? d : TAG_DIMS;
  }, [catId]);

  const [ag, setAg] = useState(filteredDims[0]?.id || null);

  const toggle = id => setSel(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const sRes = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return ALL_TAGS.filter(t => t.catId === catId && (t.name.toLowerCase().includes(q) || t.gName.toLowerCase().includes(q) || t.dName.toLowerCase().includes(q)));
  }, [search, catId]);

  const cntG = gid => {
    const dim = filteredDims.find(x => x.id === gid);
    if (!dim) return 0;
    let c = 0;
    dim.groups.forEach(g => (g.tagObjs ?? []).forEach(t => { if (sel.has(t.id)) c++; }));
    return c;
  };

  const ModalCBox = ({ on, onClick: oc }) => (
    <div onClick={oc} style={{
      width: 16, height: 16, borderRadius: 4, flexShrink: 0, cursor: "pointer",
      border: on ? "none" : `1.5px solid ${V.border}`,
      background: on ? V.primary : V.bg,
      display: "flex", alignItems: "center", justifyContent: "center", transition: "all .1s",
    }}>{on && <span style={{ color: "#fff" }}>{I.Check(10)}</span>}</div>
  );

  const selArr = Array.from(sel);
  const activeDim = filteredDims.find(d => d.id === ag) || filteredDims[0];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 820, maxWidth: "95vw", height: 600, maxHeight: "85vh",
        background: V.bg, border: `1px solid ${V.border}`, borderRadius: V.rLg,
        display: "flex", flexDirection: "column", overflow: "hidden",
        boxShadow: V.shLg, animation: "modalFade .18s ease",
      }}>
        <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${V.border}`, flexShrink: 0 }}>
          <span style={{ color: V.fgSoft }}>{I.Tag(16)}</span>
          <span style={{ fontSize: 15, fontWeight: 600 }}>选择标签 | 当前分类: {CATEGORIES.find(c => c.id === catId)?.name || ""}</span>
          <span style={{ fontSize: 12, color: V.fgMuted }}>已选 {selArr.length} 个</span>
          <span style={{ flex: 1 }} />
          <button onClick={onClose} style={{ ...btnStyle("ghost"), padding: 6, borderRadius: 6 }}>{I.X(16)}</button>
        </div>

        <div style={{ padding: "10px 16px", borderBottom: `1px solid ${V.border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", border: `1px solid ${V.border}`, borderRadius: V.r }}>
            <span style={{ color: V.fgMuted }}>{I.Search(14)}</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索标签 / 二级组 / 一级组..."
              style={{ flex: 1, border: "none", outline: "none", fontSize: 13, fontFamily: font, color: V.fg, background: "transparent" }} />
            {search && <button onClick={() => setSearch("")} style={{ ...btnStyle("ghost"), padding: 2 }}>{I.X(12)}</button>}
          </div>
        </div>

        {selArr.length > 0 && (
          <div style={{ padding: "8px 16px", borderBottom: `1px solid ${V.border}`, flexShrink: 0, display: "flex", flexWrap: "wrap", gap: 4, maxHeight: 64, overflowY: "auto" }}>
            {selArr.map(id => {
              const t = tagById(id); return t ? (
                <span key={id} onClick={() => toggle(id)} style={{ display: "inline-flex", alignItems: "center", gap: 3, cursor: "pointer", padding: "3px 8px", borderRadius: V.rFull, fontSize: 12, fontWeight: 500, background: V.primary, color: V.primaryFg }}>{t.name} {I.X(10)}</span>
              ) : null;
            })}
          </div>
        )}

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {!sRes && (
            <div style={{ width: 180, flexShrink: 0, borderRight: `1px solid ${V.border}`, overflowY: "auto", background: V.muted }}>
              {filteredDims.map(dim => {
                const isA = ag === dim.id; const cnt = cntG(dim.id);
                return (
                  <div key={dim.id} onClick={() => setAg(dim.id)} style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "12px 14px", cursor: "pointer", fontSize: 13,
                    fontWeight: isA ? 600 : 400, color: isA ? V.fg : V.fgSoft,
                    background: isA ? V.bg : "transparent",
                    borderRight: isA ? `2px solid ${V.primary}` : "2px solid transparent",
                  }}
                    onMouseEnter={e => { if (!isA) e.currentTarget.style.background = "#F3F4F6"; }}
                    onMouseLeave={e => { if (!isA) e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ flex: 1 }}>{dim.name}{dim.isRequired && <span style={{ color: V.destructive, marginLeft: 2 }}>*</span>}</span>
                    {cnt > 0 && <span style={{ fontSize: 10, fontWeight: 600, padding: "0 6px", borderRadius: V.rFull, minWidth: 18, textAlign: "center", background: V.primary, color: V.primaryFg, lineHeight: "18px" }}>{cnt}</span>}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ flex: 1, overflowY: "auto", padding: sRes ? 0 : "12px 16px", background: V.bg }}>
            {sRes ? (
              sRes.length === 0 ? <div style={{ padding: 40, textAlign: "center", color: V.fgMuted, fontSize: 13 }}>没有匹配的标签</div>
                : sRes.map(t => {
                  const s = sel.has(t.id); return (
                    <div key={t.id} onClick={() => toggle(t.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 18px", cursor: "pointer", borderBottom: `1px solid #f1f5f9` }}
                      onMouseEnter={e => e.currentTarget.style.background = V.muted}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    ><ModalCBox on={s} onClick={() => { }} /><span style={{ fontSize: 13, color: s ? V.fg : V.fgSoft, fontWeight: s ? 500 : 400 }}>{t.name}</span><span style={{ fontSize: 11, color: V.fgMuted, marginLeft: "auto", fontFamily: mono }}>{t.dName} / {t.gName}</span></div>
                  );
                })
            ) : activeDim ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {activeDim.groups.map(sg => {
                  const sgCnt = (sg.tagObjs ?? []).filter(t => sel.has(t.id)).length;
                  return (
                    <div key={sg.id} style={{ border: `1px solid ${V.border}`, borderRadius: V.r }}>
                      <div style={{ padding: "8px 12px", borderBottom: `1px solid ${V.border}`, background: V.muted, display: "flex", alignItems: "center", gap: 8, borderTopLeftRadius: V.r, borderTopRightRadius: V.r }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{sg.name}</span>
                        <span style={{ fontSize: 11, color: V.fgMuted }}>{sgCnt}/{(sg.tagObjs ?? []).length}</span>
                        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                          <button onClick={() => { const ns = new Set(sel); sg.tagObjs.forEach(t => ns.add(t.id)); setSel(ns); }} style={{ ...btnStyle("ghost"), fontSize: 11, padding: "2px 6px", color: V.blue }}>全选</button>
                          <button onClick={() => { const ns = new Set(sel); sg.tagObjs.forEach(t => ns.delete(t.id)); setSel(ns); }} style={{ ...btnStyle("ghost"), fontSize: 11, padding: "2px 6px", color: V.fgMuted }}>清空</button>
                        </div>
                      </div>
                      <div style={{ padding: "10px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
                        {(sg.tagObjs ?? []).map(t => {
                          const s = sel.has(t.id); return (
                            <div key={t.id} onClick={() => toggle(t.id)} className="hover-tag" style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", fontSize: 13, color: V.fg }}>
                              <ModalCBox on={s} onClick={() => { }} size={16} />
                              <span style={{ paddingTop: 1, userSelect: "none", color: s ? V.fg : V.fgSoft, fontWeight: s ? 500 : 400 }}>{t.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        <div style={{ padding: "12px 16px", borderTop: `1px solid ${V.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <button onClick={() => setSel(new Set())} style={{ ...btnStyle("ghost"), fontSize: 12, color: V.destructive }}>清除全部</button>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={btnStyle("outline")}>取消</button>
            <button onClick={() => onConfirm(selArr)} style={btnStyle("default")}>确认 ({selArr.length})</button>
          </div>
        </div>
      </div>
    </div>
  );
}
