// FLOW 2: Screenshot → Smart Split (HERO, multiple variants)
// Variant A: Share sheet inbound → auto-parse → confirm
// Variant B: In-app camera capture → line-by-line assign
// Variant C: Gallery picker → grid assign with chips

const ScreenshotEntry = () => (
  <SketchyPhone time="9:41">
    {/* Native share sheet UI over a dimmed parent app */}
    <div style={{ position: 'relative', height: '100%' }}>
      {/* Parent app (photos) dimmed */}
      <div style={{ position: 'absolute', inset: 0, background: '#e8e8e8', opacity: 0.8 }}>
        <div style={{ padding: 14, fontSize: 12, color: 'var(--ink-mute)' }}>Photos</div>
        <div style={{ padding: '0 8px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
          {[...Array(9)].map((_, i) => (
            <div key={i} className="sk-placeholder" style={{ aspectRatio: 1, fontSize: 12 }}>
              {i === 1 ? '🧾 receipt' : 'img'}
            </div>
          ))}
        </div>
      </div>
      {/* Scrim */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />
      {/* Share sheet */}
      <div style={{ position: 'absolute', left: 10, right: 10, bottom: 12, background: 'var(--paper-card)', borderRadius: 20, border: '1.8px solid var(--line)', boxShadow: '3px 3px 0 var(--line)' }}>
        <div style={{ padding: '14px 16px 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="sk-placeholder" style={{ width: 50, height: 68, fontSize: 10 }}>🧾</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Receipt.jpg</div>
            <div className="screen-small">Sharing 1 photo</div>
          </div>
        </div>
        <div className="sk-divider" style={{ margin: '8px 16px' }} />
        <div style={{ display: 'flex', gap: 10, padding: '6px 14px', overflowX: 'auto' }}>
          {[
            { n: 'Messages', c: '#4fd15a' },
            { n: 'GoDutch', c: 'var(--accent)', hl: true },
            { n: 'Mail', c: '#5ab3ff' },
            { n: 'Notes', c: '#ffc94a' },
          ].map((a, i) => (
            <div key={i} style={{ textAlign: 'center', minWidth: 62 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 12, background: a.c,
                border: a.hl ? '2.5px solid var(--ink)' : '1.2px solid var(--line-soft)',
                boxShadow: a.hl ? '0 0 0 4px var(--accent-soft)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontFamily: 'Caveat', fontSize: 22, fontWeight: 700,
              }}>{a.n[0]}</div>
              <div style={{ fontSize: 10, marginTop: 4, fontWeight: a.hl ? 700 : 400 }}>{a.n}</div>
            </div>
          ))}
        </div>
        <div className="sk-divider" style={{ margin: '6px 16px' }} />
        <div style={{ padding: '4px 8px 12px' }}>
          {['Copy', 'Save to files', 'Cancel'].map((a, i) => (
            <div key={i} style={{ padding: '10px 10px', fontSize: 14, borderBottom: i < 2 ? '1px dashed var(--line-soft)' : 'none' }}>{a}</div>
          ))}
        </div>
      </div>
    </div>
  </SketchyPhone>
);

const ScreenshotParsing = () => (
  <SketchyPhone time="9:41">
    <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icons.X />
      <div style={{ flex: 1, fontSize: 13, fontWeight: 700, textAlign: 'center' }}>Reading receipt…</div>
      <div style={{ width: 18 }} />
    </div>

    <div style={{ padding: '14px 16px' }}>
      <div style={{ position: 'relative' }}>
        <div className="sk-placeholder" style={{ height: 220, fontSize: 14 }}>
          <div style={{ textAlign: 'center', padding: 20, lineHeight: 1.6, fontFamily: 'Kalam', color: 'var(--ink-soft)' }}>
            <b>BLUE TOKAI CAFE</b><br/>
            <span style={{ fontSize: 11 }}>───────────────</span><br/>
            Flat white × 2 &nbsp; ₹460<br/>
            Avo toast &nbsp; ₹380<br/>
            Granola bowl &nbsp; ₹340<br/>
            Brownie &nbsp; ₹220<br/>
            <span style={{ fontSize: 11 }}>───────────────</span><br/>
            Tax ₹75 · Tip ₹100<br/>
            <b>TOTAL ₹1,575</b>
          </div>
        </div>
        {/* Scanning line */}
        <div style={{ position: 'absolute', left: 12, right: 12, top: '50%', height: 2, background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }} />
        {/* Highlights */}
        <div style={{ position: 'absolute', top: 50, left: 24, right: 24, height: 16, background: 'rgba(255,90,60,0.15)', border: '1px dashed var(--accent)', borderRadius: 3 }} />
      </div>

      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--accent)' }}>
        <Icons.Sparkle /> <span><b>Found 4 items</b> · ₹1,575 total · Blue Tokai</span>
      </div>

      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--ink-mute)' }}>Looking for familiar names… detecting tip & tax… ✓</div>

      <div style={{ marginTop: 14 }}>
        <div style={{ height: 6, background: 'var(--paper-tint)', border: '1px solid var(--line-soft)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: '78%', height: '100%', background: 'var(--accent)' }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 4 }}>78% · almost done</div>
      </div>
    </div>
  </SketchyPhone>
);

const ScreenshotAssignA = () => (
  <SketchyPhone time="9:41">
    <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icons.ArrowLeft />
      <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>Blue Tokai · ₹1,575</div>
      <div style={{ fontSize: 11, color: 'var(--accent-2)' }}>edit</div>
    </div>

    {/* Who's splitting */}
    <div style={{ padding: '12px 16px 8px' }}>
      <div className="screen-label">splitting with</div>
      <div style={{ display: 'flex', gap: 6, marginTop: 6, overflowX: 'auto' }}>
        {['Me', 'Sam', 'Priya', 'Dev', '+'].map((p, i) => (
          <div key={i} style={{
            padding: '4px 10px', border: '1.5px solid var(--line)', borderRadius: 20,
            background: i < 3 ? 'var(--accent-soft)' : 'var(--paper-card)',
            fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>{p}{i < 3 && <Icons.X />}</div>
        ))}
      </div>
    </div>

    <div style={{ padding: '6px 16px 0', display: 'flex', gap: 4 }}>
      {['Equal', 'By item', 'Custom'].map((m, i) => (
        <div key={i} style={{
          flex: 1, padding: '6px 4px', textAlign: 'center', fontSize: 12,
          border: '1.5px solid var(--line)', borderRadius: 8,
          background: i === 1 ? 'var(--ink)' : 'var(--paper-card)',
          color: i === 1 ? '#fff' : 'var(--ink)', fontWeight: 700,
        }}>{m}</div>
      ))}
    </div>

    {/* Line items with avatar chips */}
    <div style={{ padding: '12px 16px 8px' }}>
      <div className="screen-label">tap to assign</div>
    </div>
    <div style={{ padding: '0 16px' }}>
      {[
        { n: 'Flat white × 2', p: '₹460', who: [0, 1] },
        { n: 'Avo toast', p: '₹380', who: [0] },
        { n: 'Granola bowl', p: '₹340', who: [2] },
        { n: 'Brownie', p: '₹220', who: [0, 1, 2] },
      ].map((it, i) => (
        <div key={i} className="row-item">
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>{it.n}</div>
            <div className="screen-small">{it.p}</div>
          </div>
          <AvatarStack people={it.who.map(idx => ({ initials: ['A','S','P'][idx], color: AVATAR_COLORS[idx] }))} />
        </div>
      ))}
      <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-mute)' }}>
        <span>Tax + tip · split equally</span>
        <span>₹175</span>
      </div>
    </div>

    {/* Summary footer */}
    <div style={{ position: 'sticky', bottom: 0, padding: '10px 16px 18px', background: 'var(--paper-card)', borderTop: '1.5px solid var(--line)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
        <span>You owe</span><b className="amount owe">₹735</b>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 12 }}>
        <span>Sam owes you</span><b className="amount owed">₹840</b>
      </div>
      <button className="phone-btn primary full">Send split · 3 people</button>
    </div>
  </SketchyPhone>
);

const ScreenshotSent = () => (
  <SketchyPhone time="9:41">
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{
        width: 84, height: 84, borderRadius: '50%',
        background: 'var(--success-soft)', border: '2px solid var(--success)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: 'rotate(-4deg)', boxShadow: '3px 3px 0 var(--line)',
      }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12l5 5 11-11"/>
        </svg>
      </div>
      <div className="screen-h1" style={{ fontSize: 30, marginTop: 20, textAlign: 'center' }}>Split sent!</div>
      <Scribble width={70} />
      <div style={{ fontFamily: 'Kalam', fontSize: 14, color: 'var(--ink-soft)', marginTop: 10, textAlign: 'center', lineHeight: 1.4 }}>
        Sam owes you ₹840<br/>Priya owes you ₹245<br/>Dev owes you ₹-<small>nothing</small>
      </div>
      <div style={{ marginTop: 16, padding: 10, background: 'var(--accent-2-soft)', border: '1.5px solid var(--accent-2)', borderRadius: 12, fontSize: 12, textAlign: 'center' }}>
        <Icons.Sparkle /> <b>Heads up</b> — Sam usually settles within the hour 🏃‍♂️
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 24, width: '100%' }}>
        <button className="phone-btn" style={{ flex: 1 }}><Icons.Share /> Share</button>
        <button className="phone-btn primary" style={{ flex: 1 }}>Done</button>
      </div>
    </div>
  </SketchyPhone>
);

// VARIANT B: In-app camera
const ScreenshotCamera = () => (
  <SketchyPhone time="9:41">
    <div style={{ height: '100%', background: '#1a1a1a', position: 'relative', color: '#fff' }}>
      {/* Viewfinder */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #2a2a2a, #1a1a1a)' }}>
        <div style={{ position: 'absolute', top: '20%', left: '10%', right: '10%', bottom: '25%', background: '#f5efe4', borderRadius: 4, padding: 16, color: '#333', fontFamily: 'Kalam', fontSize: 11, lineHeight: 1.5, transform: 'rotate(-2deg)' }}>
          <b style={{ fontSize: 13 }}>TRATTORIA ROMA</b><br/>
          ────────<br/>
          Pasta carbonara &nbsp; €14<br/>
          Margherita &nbsp; €11<br/>
          House red 500ml &nbsp; €16<br/>
          ────────<br/>
          <b>Total €41</b>
        </div>
      </div>

      {/* Corner brackets */}
      {[[12, 80], [300, 80], [12, 480], [300, 480]].map(([x, y], i) => (
        <svg key={i} width="24" height="24" style={{ position: 'absolute', left: x, top: y, transform: `rotate(${i * 90}deg)` }}>
          <path d="M 2 2 L 2 12 M 2 2 L 12 2" stroke="var(--accent)" strokeWidth="3" fill="none"/>
        </svg>
      ))}

      {/* Top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Icons.X />
        <div className="sk-chip accent" style={{ background: 'rgba(255,90,60,0.2)', color: '#fff', border: '1px solid var(--accent)' }}><Icons.Sparkle /> auto-detect on</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>flash</div>
      </div>

      {/* Hint */}
      <div style={{ position: 'absolute', bottom: 140, left: 0, right: 0, textAlign: 'center', fontFamily: 'Caveat', fontSize: 22, color: 'var(--accent)' }}>
        Hold steady — got it ✓
      </div>

      {/* Capture controls */}
      <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, padding: '0 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 42, height: 42, borderRadius: 8, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icons.Image />
        </div>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fff', border: '4px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'var(--accent)' }} />
        </div>
        <div style={{ width: 42, height: 42, borderRadius: 8, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icons.Receipt />
        </div>
      </div>
    </div>
  </SketchyPhone>
);

// VARIANT C: Drag & assign (alternative assign UX)
const ScreenshotDragAssign = () => (
  <SketchyPhone time="9:41">
    <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icons.ArrowLeft />
      <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>Trattoria · €41</div>
    </div>

    <div style={{ padding: '6px 16px 4px', fontSize: 12, color: 'var(--ink-mute)', fontFamily: 'Caveat', fontSize: 17 }}>
      ✋ <i>drag items onto people</i>
    </div>

    {/* People strip */}
    <div style={{ padding: '6px 16px 10px', display: 'flex', gap: 10, justifyContent: 'space-around' }}>
      {[
        { i: 'A', c: 0, amt: '€20', items: 2 },
        { i: 'S', c: 1, amt: '€11', items: 1 },
        { i: 'J', c: 2, amt: '€10', items: 1 },
      ].map((p, i) => (
        <div key={i} style={{
          textAlign: 'center', flex: 1,
          padding: 8, border: '2px dashed var(--line-soft)', borderRadius: 12,
          background: 'var(--paper-card)',
        }}>
          <div style={{ margin: '0 auto' }}><Avatar initials={p.i} color={AVATAR_COLORS[p.c]} size="lg" /></div>
          <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>{p.amt}</div>
          <div className="screen-small">{p.items} items</div>
        </div>
      ))}
    </div>

    <div style={{ padding: '8px 16px 0', fontSize: 11, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700 }}>
      receipt items
    </div>

    {/* Draggable items */}
    <div style={{ padding: '8px 16px' }}>
      {[
        { n: 'Pasta carbonara', p: '€14', who: 'A', c: 0, assigned: true },
        { n: 'Margherita', p: '€11', who: 'S', c: 1, assigned: true },
        { n: 'House red', p: '€16', who: null, assigned: false, dragging: true },
      ].map((it, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: 10, marginBottom: 6,
          border: '1.5px solid var(--line)', borderRadius: 10,
          background: it.dragging ? 'var(--accent-soft)' : 'var(--paper-card)',
          boxShadow: it.dragging ? '3px 4px 0 var(--line), 0 0 0 2px var(--accent)' : '1.5px 1.5px 0 var(--line)',
          transform: it.dragging ? 'rotate(-2deg) scale(1.02)' : 'none',
        }}>
          <div style={{ cursor: 'grab', color: 'var(--ink-mute)', fontSize: 14 }}>⋮⋮</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>{it.n}</div>
            <div className="screen-small">{it.p} {it.dragging && '· drag me!'}</div>
          </div>
          {it.assigned && <Avatar initials={it.who} color={AVATAR_COLORS[it.c]} size="sm" />}
        </div>
      ))}
    </div>

    <div style={{ padding: '10px 16px' }}>
      <div style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'Caveat', fontSize: 16 }}>
        ↑ House red not assigned. Split equally? <u>Yes</u> / <u>skip</u>
      </div>
    </div>
  </SketchyPhone>
);

Object.assign(window, { ScreenshotEntry, ScreenshotParsing, ScreenshotAssignA, ScreenshotSent, ScreenshotCamera, ScreenshotDragAssign });
