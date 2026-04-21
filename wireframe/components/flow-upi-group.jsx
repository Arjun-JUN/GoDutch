// FLOW 4: UPI Auto-detect → Suggested split (silent background)
// Lock screen notification → Smart split suggestion → Group detail

const UPILockNotif = () => (
  <SketchyPhone time="9:41">
    <div style={{ height: '100%', background: 'linear-gradient(180deg, #2a3b5c 0%, #1a2440 100%)', position: 'relative', color: '#fff', padding: '0', display: 'flex', flexDirection: 'column' }}>
      {/* Lock screen time */}
      <div style={{ padding: '40px 20px 14px', textAlign: 'center' }}>
        <div style={{ fontSize: 12, opacity: 0.7 }}>Thursday, Apr 16</div>
        <div style={{ fontFamily: 'Kalam', fontSize: 60, fontWeight: 300, lineHeight: 1 }}>9:41</div>
      </div>

      {/* First notif: UPI payment receipt */}
      <div style={{ padding: '4px 10px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(20px)',
          borderRadius: 16, padding: '10px 12px', border: '0.5px solid rgba(255,255,255,0.25)',
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#6b5dd3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>Pay</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, opacity: 0.8 }}>
              <span>UPI · PAYTM</span><span>now</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Paid ₹840 to Blue Tokai</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>Txn #UPI8432... · HDFC</div>
          </div>
        </div>
      </div>

      {/* Second notif: GoDutch smart suggestion — ANCHOR */}
      <div style={{ padding: '8px 10px' }}>
        <div style={{
          background: 'rgba(255,90,60,0.82)', backdropFilter: 'blur(20px)',
          borderRadius: 16, padding: '12px', border: '0.5px solid rgba(255,255,255,0.3)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
        }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#fff', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Caveat', fontWeight: 700, fontSize: 16 }}>₲D</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, opacity: 0.9 }}>
                <span style={{ fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>GoDutch · smart split</span>
                <span>1m ago</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, marginTop: 3 }}>₹840 at Blue Tokai — split 3 ways?</div>
              <div style={{ fontSize: 12, opacity: 0.92, marginTop: 2 }}>looks like a <b>Foodies</b> hang. Sam & Priya tagged.</div>
            </div>
          </div>
          {/* Inline actions */}
          <div style={{ display: 'flex', gap: 6, marginTop: 10, borderTop: '0.5px solid rgba(255,255,255,0.2)', paddingTop: 8 }}>
            <div style={{ flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 700, padding: '6px 4px', background: 'rgba(255,255,255,0.25)', borderRadius: 10 }}>✓ Split equally</div>
            <div style={{ flex: 1, textAlign: 'center', fontSize: 12, padding: '6px 4px' }}>edit</div>
            <div style={{ flex: 1, textAlign: 'center', fontSize: 12, padding: '6px 4px' }}>not a split</div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Camera/flashlight iOS-style */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 40px 40px' }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔦</div>
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📷</div>
      </div>
    </div>
  </SketchyPhone>
);

const UPISuggestion = () => (
  <SketchyPhone time="9:42">
    <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icons.X />
      <div style={{ flex: 1, fontSize: 14, fontWeight: 700, textAlign: 'center' }}>Smart split</div>
      <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>auto ⚙</div>
    </div>

    <div style={{ padding: '14px 16px 0' }}>
      <div className="sk-border" style={{ padding: 14, background: 'var(--accent-soft)' }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700, color: 'var(--accent)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <Icons.Bolt /> we caught this
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, marginTop: 6, lineHeight: 1 }}>₹840</div>
        <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 3 }}>to <b>Blue Tokai Cafe</b> · via PayTM UPI</div>
        <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2 }}>2 min ago · HDFC ••••4521</div>
      </div>
    </div>

    {/* Smart suggestion */}
    <div style={{ padding: '16px 16px 0' }}>
      <div style={{ fontFamily: 'Caveat', fontSize: 22, color: 'var(--ink-soft)' }}>we think it's…</div>
      <div className="sk-border" style={{ padding: 14, marginTop: 6, background: 'var(--paper-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: AVATAR_COLORS[2], border: '1.5px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Caveat', fontSize: 16, fontWeight: 700 }}>F</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Foodies group</div>
            <div className="screen-small">you hang here ~2x/week</div>
          </div>
          <div className="sk-chip success" style={{ fontSize: 10 }}>94% match</div>
        </div>
        <div style={{ display: 'flex', gap: 4, fontSize: 12, alignItems: 'center' }}>
          <AvatarStack people={[{ initials: 'A', color: AVATAR_COLORS[0] }, { initials: 'S', color: AVATAR_COLORS[1] }, { initials: 'P', color: AVATAR_COLORS[2] }]} />
          <span style={{ marginLeft: 6 }}><b>₹280</b>/person · equal split</span>
        </div>
      </div>
    </div>

    {/* Reasoning */}
    <div style={{ padding: '14px 16px 0' }}>
      <div className="screen-label">why we think so</div>
      <ul style={{ paddingLeft: 20, margin: '6px 0', fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
        <li>Blue Tokai · visited 7× with Foodies</li>
        <li>Sam messaged "on way" 20 min ago</li>
        <li>Amount rounds to ~3-way dinner</li>
      </ul>
    </div>

    <div style={{ padding: '14px 16px 0' }}>
      <div className="screen-label">or try…</div>
      <div style={{ display: 'flex', gap: 6, marginTop: 6, overflowX: 'auto' }}>
        {['Apartment', 'Just me & Sam', 'New group', 'Keep personal'].map((o, i) => (
          <div key={i} className="sk-chip" style={{ whiteSpace: 'nowrap' }}>{o}</div>
        ))}
      </div>
    </div>

    <div style={{ position: 'sticky', bottom: 0, padding: '12px 16px 18px', background: 'var(--paper-card)', borderTop: '1.5px solid var(--line)', display: 'flex', gap: 8 }}>
      <button className="phone-btn" style={{ flex: 1 }}>Not a split</button>
      <button className="phone-btn primary" style={{ flex: 2 }}>Split with Foodies →</button>
    </div>
  </SketchyPhone>
);

// FLOW 5: Group detail + expense detail
const GroupDetail = () => (
  <SketchyPhone time="9:41" showTabbar activeTab="groups">
    {/* Header */}
    <div style={{ background: 'var(--accent-soft)', padding: '14px 16px 18px', borderBottom: '1.5px solid var(--line)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Icons.ArrowLeft />
        <div style={{ display: 'flex', gap: 10 }}>
          <Icons.Search />
          <svg width="18" height="18" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
        </div>
      </div>
      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--paper-card)', border: '1.8px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Caveat', fontSize: 28, fontWeight: 700 }}>🏖</div>
        <div>
          <div style={{ fontFamily: 'Caveat', fontSize: 28, fontWeight: 700, lineHeight: 1 }}>Goa Trip</div>
          <div className="screen-small">5 people · started Apr 2</div>
        </div>
      </div>
      {/* Balance summary sentence */}
      <div style={{ marginTop: 12, fontSize: 13, fontFamily: 'Kalam' }}>
        <b style={{ color: 'var(--success)', fontSize: 18 }}>+₹420</b> — you're ahead
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        <button className="phone-btn success" style={{ fontSize: 12 }}>Settle up</button>
        <button className="phone-btn" style={{ fontSize: 12 }}>Balances</button>
        <button className="phone-btn" style={{ fontSize: 12 }}>Add</button>
      </div>
    </div>

    {/* Expense timeline */}
    <div style={{ padding: '14px 16px 0' }}>
      <div className="screen-label">yesterday · apr 15</div>
    </div>
    <div style={{ padding: '0 16px' }}>
      {[
        { n: '🍜 Pho dinner', who: 'You paid', amt: '₹1,240', yours: '+₹248', yo: 'owed', notes: 'auto-split from UPI' },
        { n: '🛺 Tuk-tuk to market', who: 'Sam paid', amt: '₹320', yours: '−₹80', yo: 'owe' },
        { n: '🧴 Sunscreen', who: 'Priya paid', amt: '₹180', yours: '−₹45', yo: 'owe' },
      ].map((e, i) => (
        <div key={i} className="row-item">
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--paper-tint)', border: '1.5px solid var(--line-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{e.n.split(' ')[0]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>{e.n.substring(e.n.indexOf(' ') + 1)}</div>
            <div className="screen-small">{e.who} · {e.amt}{e.notes && ' · '}{e.notes && <i>{e.notes}</i>}</div>
          </div>
          <div className={`amount ${e.yo === 'owed' ? 'owed' : 'owe'}`}>{e.yours}</div>
        </div>
      ))}
    </div>

    <div style={{ padding: '12px 16px 0' }}>
      <div className="screen-label">apr 14 · beach day</div>
    </div>
    <div style={{ padding: '0 16px 80px' }}>
      {[
        { n: '🏄 Surf lesson', who: 'You paid', amt: '₹3,000', yours: '+₹600', yo: 'owed' },
        { n: '🍹 Sunset cocktails', who: 'Dev paid', amt: '₹1,400', yours: '−₹280', yo: 'owe' },
      ].map((e, i) => (
        <div key={i} className="row-item">
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--paper-tint)', border: '1.5px solid var(--line-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{e.n.split(' ')[0]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>{e.n.substring(e.n.indexOf(' ') + 1)}</div>
            <div className="screen-small">{e.who} · {e.amt}</div>
          </div>
          <div className={`amount ${e.yo === 'owed' ? 'owed' : 'owe'}`}>{e.yours}</div>
        </div>
      ))}
    </div>
  </SketchyPhone>
);

const ExpenseDetail = () => (
  <SketchyPhone time="9:41">
    <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icons.ArrowLeft />
      <div style={{ flex: 1, fontSize: 13, color: 'var(--ink-mute)' }}>Goa Trip › Surf lesson</div>
      <div style={{ fontSize: 12, color: 'var(--accent-2)' }}>edit</div>
    </div>

    <div style={{ padding: '10px 16px 6px' }}>
      <div style={{ fontFamily: 'Caveat', fontSize: 36, fontWeight: 700, lineHeight: 1 }}>Surf lesson 🏄</div>
      <div style={{ fontSize: 34, fontWeight: 700, marginTop: 6 }}>₹3,000</div>
      <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>Apr 14 · you paid</div>
    </div>

    {/* Receipt */}
    <div style={{ padding: '10px 16px 0', display: 'flex', gap: 10 }}>
      <div className="sk-placeholder" style={{ width: 70, height: 94, fontSize: 11 }}>📷 receipt</div>
      <div style={{ flex: 1, fontSize: 12, color: 'var(--ink-soft)', fontStyle: 'italic' }}>
        "Beach break Goa — 5 lesson package"<br/>
        <span style={{ color: 'var(--ink-mute)' }}>(tap to view or add a note)</span>
      </div>
    </div>

    <div style={{ padding: '14px 16px 6px' }}>
      <div className="screen-label">split · equal · 5 ways</div>
    </div>
    <div style={{ padding: '0 16px' }}>
      {[
        { n: 'You', s: 'paid · owes ₹600', a: '−₹2,400', k: 'owed', c: 0 },
        { n: 'Sam', s: 'owes you', a: '+₹600', k: 'owed', c: 1 },
        { n: 'Priya', s: 'paid you back', a: '✓ settled', k: 'done', c: 2 },
        { n: 'Dev', s: 'owes you', a: '+₹600', k: 'owed', c: 3 },
        { n: 'Maya', s: 'owes you', a: '+₹600', k: 'owed', c: 4 },
      ].map((p, i) => (
        <div key={i} className="row-item">
          <Avatar initials={p.n[0]} color={AVATAR_COLORS[p.c]} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>{p.n}</div>
            <div className="screen-small">{p.s}</div>
          </div>
          {p.k === 'done' ? (
            <div className="sk-chip success" style={{ fontSize: 10 }}><Icons.Check /> {p.a}</div>
          ) : (
            <div className={`amount ${p.k === 'owed' ? 'owed' : 'owe'}`}>{p.a}</div>
          )}
        </div>
      ))}
    </div>

    <div style={{ padding: '14px 16px 0' }}>
      <div className="screen-label">comments</div>
      <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 6, padding: '8px 10px', background: 'var(--paper-tint)', borderRadius: 10 }}>
        <b>Sam</b>: best day of the trip 🤙<br/>
        <b>Maya</b>: will send over tmrw morning
      </div>
    </div>

    <div style={{ padding: '14px 16px 0', display: 'flex', gap: 8 }}>
      <button className="phone-btn" style={{ flex: 1 }}>Nudge all</button>
      <button className="phone-btn primary" style={{ flex: 1 }}>Remind Dev</button>
    </div>
  </SketchyPhone>
);

Object.assign(window, { UPILockNotif, UPISuggestion, GroupDetail, ExpenseDetail });
