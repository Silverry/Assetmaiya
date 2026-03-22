// ═══════════════════════════════════════════════════════════
//  upload.js — 上传流程组件
//  职责：AssetCard（单资产卡片编辑）、BatchBar（批量操作）、
//        UploadApp（上传主界面）、UploadModal（弹窗包装）
//  依赖：data.js（CATEGORIES, TAG_DIMS, ENTITIES, tagById, CL）、
//        theme.js（V, I, font, mono, fmtSz, ft, isValid, uid, btnStyle, readEntries）、
//        components.js（Thumb, CategorySelect, EntityPicker, Badge, TagModal）
//  被依赖：app.js（App 通过 UploadModal 触发上传流程）
// ═══════════════════════════════════════════════════════════

// ── AssetCard (上传流程中的单个资产卡片) ─────────────────
/**
 * 上传流程中的单个资产编辑卡片，可设置类别、标签、关联实体
 * @param {Object} asset - 待上传资产 {id, file, catId, tags[], entId}
 * @param {Array} entities - 可关联的实体列表
 * @param {function} onUpdate - 资产信息更新回调
 * @param {function} onRemove - 移除该资产回调
 * @param {function} onNewEntity - 新建实体回调
 */
function AssetCard({ asset, entities, onUpdate, onRemove, onNewEntity }) {
  const [tagOpen, setTagOpen] = useState(false);
  const [adv, setAdv] = useState(!!asset.entId);
  const t = ft(asset.file);

  return (
    <div style={{ background: V.bg, border: `1px solid ${V.border}`, borderRadius: V.rLg, boxShadow: V.sh, transition: "box-shadow .2s" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = V.shMd}
      onMouseLeave={e => e.currentTarget.style.boxShadow = V.sh}
    >
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
          <Thumb file={asset.file} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: V.rFull, fontSize: 11, fontWeight: 500, fontFamily: mono, background: t === "image" ? V.blueBg : V.amberBg, color: t === "image" ? V.blue : V.amber }}>{t === "image" ? I.Img(11) : I.Vid(11)} {t}</span>
              <span style={{ fontSize: 11, color: V.fgMuted, fontFamily: mono }}>{fmtSz(asset.file.size)}</span>
              <button onClick={onRemove} style={{ marginLeft: "auto", ...btnStyle("ghost"), padding: 4, color: V.fgMuted, borderRadius: 6 }}
                onMouseEnter={e => e.currentTarget.style.color = V.destructive}
                onMouseLeave={e => e.currentTarget.style.color = V.fgMuted}>{I.Trash()}</button>
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: V.fg, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{asset.file.name}</div>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 500, color: V.fg, marginBottom: 6 }}>{I.Folder(13)} 类别</label>
          <CategorySelect value={asset.catId} onChange={v => onUpdate({ ...asset, catId: v })} />
        </div>

        <div>
          <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 500, color: V.fg, marginBottom: 6 }}>
            {I.Tag(13)} 标签
            {(asset.tags ?? []).length > 0 && <span style={{ fontSize: 11, color: V.fgMuted, fontWeight: 400, fontFamily: mono }}>{(asset.tags ?? []).length}</span>}
          </label>
          <div onClick={() => setTagOpen(true)} style={{
            display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center",
            padding: "8px 12px", minHeight: 40,
            border: `1px solid ${V.border}`, borderRadius: V.r, cursor: "pointer",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#D1D5DB"}
            onMouseLeave={e => e.currentTarget.style.borderColor = V.border}
          >
            {(asset.tags ?? []).length === 0
              ? <span style={{ color: V.fgMuted, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>{I.Plus(12)} 点击选择标签</span>
              : (asset.tags ?? []).map(tid => { const tg = tagById(tid); return tg ? <Badge key={tid} color={V.fg} bg={V.secondary} onRemove={() => onUpdate({ ...asset, tags: (asset.tags ?? []).filter(x => x !== tid) })}>{tg.name}</Badge> : null; })}
          </div>
        </div>
      </div>

      {/* 高级选项区域（实体关联功能），当前通过 display:none 隐藏，待功能完善后启用 */}
      <div style={{ display: "none", borderTop: `1px solid ${V.border}` }}>
        <div onClick={() => setAdv(!adv)} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", cursor: "pointer",
          fontSize: 12, color: V.fgMuted, fontWeight: 500,
          background: adv ? V.muted : "transparent", transition: "background .1s",
        }}
          onMouseEnter={e => { if (!adv) e.currentTarget.style.background = V.muted; }}
          onMouseLeave={e => { if (!adv) e.currentTarget.style.background = "transparent"; }}
        >
          {I.Settings(12)}
          <span>高级选项</span>
          {asset.entId && !adv && (
            <span style={{ fontSize: 11, color: V.blue, fontWeight: 400, marginLeft: 4 }}>
              已关联: {entities.find(e => e.id === asset.entId)?.name}
            </span>
          )}
          <span style={{ marginLeft: "auto", transform: adv ? "rotate(180deg)" : "none", transition: "transform .15s" }}>{I.ChevD(10)}</span>
        </div>
        {adv && (
          <div style={{ padding: "12px 20px 16px", background: V.muted }}>
            <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 500, color: V.fg, marginBottom: 6 }}>{I.Cube(13)} 关联实体</label>
            <EntityPicker entities={entities} value={asset.entId}
              onSelect={id => onUpdate({ ...asset, entId: id })}
              onCreate={en => { onNewEntity(en); onUpdate({ ...asset, entId: en.id }); }} />
          </div>
        )}
      </div>

      {tagOpen && <TagModal catId={asset.catId} selected={asset.tags}
        onConfirm={tg => { onUpdate({ ...asset, tags: tg }); setTagOpen(false); }}
        onClose={() => setTagOpen(false)} />}
    </div>
  );
}

// ── BatchBar (批量操作栏) ────────────────────────────────
function BatchBar({ onApplyCat, onApplyTags }) {
  const [tagOpen, setTagOpen] = useState(false);
  const [bTags, setBTags] = useState([]);
  const [bCat, setBCat] = useState("");
  return (
    <div style={{ background: V.blueBg, border: "1px solid #BFDBFE", borderRadius: V.rLg, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        {I.Sparkle(16)}<span style={{ fontSize: 14, fontWeight: 600 }}>批量设置</span>
        <span style={{ fontSize: 12, color: V.fgMuted }}>应用到全部资产</span>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ width: 180 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: V.fgSoft, marginBottom: 4 }}>类别（覆盖）</label>
          <select value={bCat} onChange={e => setBCat(e.target.value)} style={{ width: "100%", padding: "8px 10px", border: `1px solid ${V.border}`, borderRadius: V.r, fontSize: 13, fontFamily: font, color: V.fg, background: V.bg, outline: "none", boxSizing: "border-box" }}>
            <option value="">选择类别...</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {bCat && <button onClick={() => { onApplyCat(bCat); setBCat(""); }} style={{ ...btnStyle("default"), fontSize: 12, padding: "8px 14px" }}>应用类别</button>}
        <div style={{ width: 1, height: 32, background: "#BFDBFE", margin: "0 4px" }} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: V.fgSoft, marginBottom: 4 }}>标签（追加）</label>
          <div onClick={() => setTagOpen(true)} style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center", padding: "7px 12px", minHeight: 38, border: `1px solid ${V.border}`, borderRadius: V.r, cursor: "pointer", background: V.bg }}>
            {bTags.length === 0
              ? <span style={{ color: V.fgMuted, fontSize: 13 }}>{I.Plus(12)} 选择标签...</span>
              : (bTags ?? []).map(tid => { const tg = tagById(tid); return tg ? <Badge key={tid} color={V.fg} bg={V.secondary} onRemove={() => setBTags(p => p.filter(x => x !== tid))}>{tg.name}</Badge> : null; })}
          </div>
        </div>
        {bTags.length > 0 && <button onClick={() => { onApplyTags(bTags); setBTags([]); }} style={{ ...btnStyle("default"), fontSize: 12, padding: "8px 14px" }}>应用标签</button>}
      </div>
      {tagOpen && <TagModal catId="scene" selected={bTags} onConfirm={t => { setBTags(t); setTagOpen(false); }} onClose={() => setTagOpen(false)} />}
    </div>
  );
}

// ── UploadApp (上传主界面) ───────────────────────────────
/**
 * 上传主界面，支持拖拽/选择文件及文件夹，管理待上传资产列表
 * @param {function} onUpload - 确认上传回调，参数为 Asset[] 数组
 * @param {function} onClose - 关闭上传界面回调
 * 副作用：上传成功后通过 onUpload 将资产添加到 App 的 assets state
 */
function UploadApp({ onUpload, onClose }) {
  const [assets, setAssets] = useState([]);
  const [entities, setEntities] = useState(ENTITIES);
  const [drag, setDrag] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef(null);
  const folderRef = useRef(null);

  const addFiles = useCallback(files => {
    const v = Array.from(files).filter(isValid);
    if (v.length) setAssets(p => [...p, ...v.map(f => ({ id: uid(), file: f, catId: "scene", tags: [], entId: null }))]);
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault(); setDrag(false);
    const items = e.dataTransfer.items;
    if (items) {
      const allFiles = [];
      const promises = [];
      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry?.();
        if (entry) {
          promises.push(readEntries(entry).then(fs => allFiles.push(...fs)));
        } else {
          const f = items[i].getAsFile();
          if (f && isValid(f)) allFiles.push(f);
        }
      }
      await Promise.all(promises);
      if (allFiles.length) addFiles(allFiles);
    } else {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const imgC = assets.filter(a => ft(a.file) === "image").length;
  const vidC = assets.filter(a => ft(a.file) === "video").length;

  return (
    <div style={{ height: "100%", width: "100%", overflowY: "auto", position: "relative", fontFamily: font, color: V.fg, background: "#FAFAFA" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 700, letterSpacing: -.5 }}>资产上传</h1>
            <p style={{ margin: 0, fontSize: 14, color: V.fgMuted }}>上传图片或视频，支持文件与文件夹</p>
          </div>
          <button onClick={onClose} style={{ ...btnStyle("ghost"), padding: "6px 14px" }}>{I.X(16)} 关闭</button>
        </div>

        {done && (
          <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 10000, background: V.bg, border: `1px solid ${V.border}`, borderRadius: V.r, padding: "12px 24px", display: "flex", alignItems: "center", gap: 8, boxShadow: V.shLg, animation: "slideD .25s ease" }}>
            <span style={{ color: V.green }}>{I.Check(16)}</span>
            <span style={{ fontSize: 14, fontWeight: 500 }}>上传成功</span>
          </div>
        )}

        <div onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={handleDrop}
          style={{
            borderRadius: V.rLg, padding: assets.length ? "24px 0" : "44px 0",
            border: `2px dashed ${drag ? V.ring : V.border}`,
            background: drag ? V.blueBg : V.bg, textAlign: "center",
            transition: "all .2s", marginBottom: 24, cursor: "default",
          }}>
          <input ref={fileRef} type="file" multiple accept="image/*,video/*" style={{ display: "none" }}
            onChange={e => { addFiles(e.target.files); e.target.value = ""; }} />
          <input ref={folderRef} type="file" multiple style={{ display: "none" }}
            onChange={e => { addFiles(e.target.files); e.target.value = ""; }}
            {...{ webkitdirectory: "", mozdirectory: "", directory: "" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, color: drag ? V.blue : V.fgMuted }}>
            <div style={{ width: 48, height: 48, borderRadius: V.rLg, display: "flex", alignItems: "center", justifyContent: "center", background: drag ? "#DBEAFE" : V.muted, border: `1px solid ${drag ? "#93C5FD" : V.border}` }}>{I.Upload(22)}</div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: drag ? V.blue : V.fgSoft }}>拖拽文件或文件夹到此处</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: V.fgMuted }}>JPG, PNG, GIF, WEBP, MP4, MOV — 自动过滤非媒体文件</p>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button onClick={() => fileRef.current?.click()} style={btnStyle("outline")}>{I.Upload(14)} 选择文件</button>
              <button onClick={() => folderRef.current?.click()} style={btnStyle("outline")}>{I.Folder(14)} 选择文件夹</button>
            </div>
          </div>
        </div>

        {assets.length > 0 && !done && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>已选择 <span style={{ color: V.blue }}>{assets.length}</span> 个文件</span>
              <div style={{ display: "flex", gap: 6 }}>
                {imgC > 0 && <Badge color={V.blue} bg={V.blueBg}>{I.Img(11)} {imgC} 图片</Badge>}
                {vidC > 0 && <Badge color={V.amber} bg={V.amberBg}>{I.Vid(11)} {vidC} 视频</Badge>}
              </div>
              <span style={{ fontSize: 12, color: V.fgMuted, fontFamily: mono }}>{fmtSz(assets.reduce((s, a) => s + a.file.size, 0))}</span>
            </div>

            {assets.length >= 2 && (
              <div style={{ marginBottom: 20 }}>
                <BatchBar
                  onApplyCat={c => setAssets(p => p.map(a => ({ ...a, catId: c })))}
                  onApplyTags={tg => setAssets(p => p.map(a => ({ ...a, tags: Array.from(new Set([...a.tags, ...tg])) })))}
                />
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {assets.map(a => (
                <AssetCard key={a.id} asset={a} entities={entities}
                  onUpdate={u => setAssets(p => p.map(x => x.id === u.id ? u : x))}
                  onRemove={() => setAssets(p => p.filter(x => x.id !== a.id))}
                  onNewEntity={en => setEntities(p => [...p, en])} />
              ))}
            </div>

            <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setAssets([])} style={btnStyle("outline")}>取消</button>
              <button onClick={() => {
                // 校验必选维度：每个 isRequired 维度下至少要有一个标签被选中
                const errorMsgs = [];
                for (const a of assets) {
                  const catId = a.catId || "scene"; // 未选类别时默认归入"场景"
                  const reqDims = TAG_DIMS.filter(d => d.catId === catId && d.isRequired);
                  const missingDims = reqDims.filter(dim => !(a.tags ?? []).some(tid => tagById(tid)?.dId === dim.id));
                  if (missingDims.length > 0) {
                    errorMsgs.push(`"${a.file.name}" 缺少必选标签: ${missingDims.map(d => d.name).join('、')}`);
                  }
                }
                if (errorMsgs.length > 0) {
                  alert("部分资产未选择必选标签：\n\n" + errorMsgs.slice(0, 5).join("\n") + (errorMsgs.length > 5 ? `\n...等 ${errorMsgs.length} 个资产` : ""));
                  return;
                }
                if (onUpload) {
                  onUpload(assets.map(a => ({
                    id: a.id, name: a.file.name, type: ft(a.file),
                    catId: a.catId || "scene", tags: a.tags, entId: a.entId,
                    size: a.file.size,
                    date: new Date().toISOString().slice(0, 10),
                    color: CL[Math.floor(Math.random() * CL.length)]
                  })));
                  setDone(true); setTimeout(() => { setDone(false); setAssets([]); onClose?.(); }, 800);
                } else {
                  setDone(true); setTimeout(() => { setDone(false); setAssets([]); }, 2000);
                }
              }} style={btnStyle("default")}>上传 {assets.length} 个资产</button>
            </div>
          </>
        )}

        {assets.length === 0 && !done && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { icon: I.Folder(20), title: "类别", desc: "场景、角色、生物、道具。每个资产归属唯一一个类别。", color: V.amber, bg: V.amberBg },
              { icon: I.Tag(20), title: "标签", desc: "标签组+标签两级结构，弹窗选择，按维度分组，自由多选。", color: V.blue, bg: V.blueBg },
              { icon: I.Folder(20), title: "文件夹上传", desc: "支持拖拽或选择整个文件夹，自动递归提取所有图片和视频文件。", color: V.green, bg: V.greenBg },
            ].map(c => (
              <div key={c.title} style={{ background: V.bg, border: `1px solid ${V.border}`, borderRadius: V.rLg, padding: 24, boxShadow: V.sh }}>
                <div style={{ width: 40, height: 40, borderRadius: V.r, display: "flex", alignItems: "center", justifyContent: "center", background: c.bg, color: c.color, marginBottom: 14 }}>{c.icon}</div>
                <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600 }}>{c.title}</h3>
                <p style={{ margin: 0, fontSize: 13, color: V.fgMuted, lineHeight: 1.5 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── UploadModal (上传弹窗包装) ───────────────────────────
function UploadModal({ onClose, onUpload }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease" }}>
      <div style={{ width: "95%", maxWidth: 1080, height: "90%", maxHeight: 860, background: "#fafafa", borderRadius: 16, overflow: "hidden", position: "relative", boxShadow: "0 20px 40px -8px rgba(0,0,0,0.15)" }}>
        <UploadApp onClose={onClose} onUpload={onUpload} />
      </div>
    </div>
  );
}
