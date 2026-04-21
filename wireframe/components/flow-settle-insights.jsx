// FLOW 6: Settle up + FLOW 7: Insights + FLOW 8: Activity

const SettleUpMain = () => (
  <SketchyPhone time="9:41">
    <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icons.ArrowLeft />
      <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>Settle up</div>
    </div>

    <div style={{ padding: '14px 16px 0' }}>
      <div className="sk-border" style={{ padding: 14, background: 'var(--success-soft)' }}>
        <div className="screen-label" style={{ color: 'var(--success)' }}>simplify saves</div>
        <div style={{ fontFamily: 'Caveat', fontSize: 22, fontWeight: 700, marginTop: 4 }}>8 payments → 3</div>
        <div className="screen-small" style={{ marginTop: 2 }}>We cancel out overlapping debts across the group.</div>
      </div>
    </div>

    <div style={{ padding: '14px 16px 6px' }}>
      <div className="screen-label">you should pay</div>
    </div>
    <div style={{ padding: '0 16px' }}>
      {[
        { n: 'Dev', a: '₹380', c: 3 },
      ].map((p, i) => (
        <div key={i} className="row-item">
          <Avatar initials={p.n[0]} color={AVATAR_COLORS[p.c]} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>Pay {p.n}</div>
            <div className="screen-small">across Apartment & Goa Trip</div>
          </div>
          <div className="amount owe">{p.a}</div>
        </div>
      ))}
    </div>

    <div style={{ padding: '14px 16px 6px' }}>
      <div className="screen-label">owed to you</div>
    </div>
    <div style={{ padding: '0 16px' }}>
      {[
        { n: 'Sam', a: '₹1,440', c: 1 },
        { n: 'Maya', a: '₹188', c: 4 },
      ].map((p, i) => (
        <div key={i} className="row-item">
          <Avatar initials={p.n[0]} color={AVATAR_COLORS[p.c]} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>{p.n}</div>
            <div className="screen-small">Goa Trip, Foodies</div>
          </div>
          <div className="amount owed">+{p.a}</div>
        </div>
      ))}
    </div>

    <div style={{ padding: '14px 16px 0' }}>
      <div className="sk-divider" />
    </div>
    <div style={{ padding: '12px 16px 0' }}>
      <div className="screen-label">quick actions</div>
      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        <button className="phone-btn" style={{ fontSize: 12 }}><Icons.Bell /> Nudge everyone</button>
        <button className="phone-btn" style={{ fontSize: 12 }}><Icons.Share /> Share balances</button>
      </div>
    </div>

    <div style={{ position: 'sticky', bottom: 0, padding: '12px 16px 18px', background: 'var(--paper-card)', borderTop: '1.5px solid var(--line)', marginTop: 20 }}>
      <button className="phone-btn primary full">Pay Dev ₹380 via UPI →</button>
    </div>
  </SketchyPhone>
);

const SettleMethod = () => (
  <SketchyPhone time="9:41">
    <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icons.ArrowLeft />
      <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>Pay Dev</div>
    </div>

    <div style={{ padding: '14px 16px 0', textAlign: 'center' }}>
      <Avatar initials="D" color={AVATAR_COLORS[3]} size="lg" />
      <div style={{ fontFamily: 'Caveat', fontSize: 44, fontWeight: 700, marginTop: 8, lineHeight: 1 }}>₹380</div>
      <div className="screen-small">across 2 groups · 4 expenses</div>
    </div>

    <div style={{ padding: '18px 16px 6px' }}>
      <div className="screen-label">how?</div>
    </div>
    <div style={{ padding: '0 16px' }}>
      {[
        { i: '⚡', t: 'UPI · one tap', s: 'deep-link to PayTM / GPay', hi: true },
        { i: '💵', t: 'Mark as paid in cash', s: 'record offline settlement' },
        { i: '📩', t: 'Ask Dev to request you', s: 'they send a UPI request' },
        { i: '🔗', t: 'Send payment link', s: 'WhatsApp, iMessage, etc.' },
      ].map((m, i) => (
        <div key={i} className="row-item" style={{
          padding: '12px 10px',
          background: m.hi ? 'var(--accent-soft)' : 'transparent',
          border: m.hi ? '1.5px solid var(--accent)' : '1px solid transparent',
          borderRadius: m.hi ? 12 : 0,
          marginBottom: 4,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--paper-card)', border: '1.5px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{m.i}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>{m.t}</div>
            <div className="screen-small">{m.s}</div>
          </div>
          <Icons.ChevRight />
        </div>
      ))}
    </div>

    <div style={{ padding: '16px 16px 0' }}>
      <div style={{ padding: 10, background: 'var(--paper-tint)', borderRadius: 10, fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'Caveat', fontSize: 15 }}>
        💡 pay by UPI and we'll auto-mark it settled when the confirmation pings.
      </div>
    </div>
  </SketchyPhone>
);

const SettleConfirmed = () => (
  <SketchyPhone time="9:41">
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      {/* Stamp */}
      <div style={{
        width: 140, height: 140, borderRadius: '50%',
        border: '3px solid var(--success)', background: 'var(--success-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: 'rotate(-8deg)',
        boxShadow: 'inset 0 0 0 4px var(--paper-card)',
      }}>
        <div style={{ fontFamily: 'Caveat', fontSize: 34, fontWeight: 700, color: 'var(--success)', lineHeight: 1, textAlign: 'center' }}>
          PAID<br/><span style={{ fontSize: 14 }}>₹380 · Apr 16</span>
        </div>
      </div>
      <div className="screen-h1" style={{ fontSize: 28, marginTop: 20 }}>All settled with Dev!</div>
      <Scribble width={80} />
      <div style={{ fontFamily: 'Kalam', fontSize: 13, color: 'var(--ink-soft)', marginTop: 12, lineHeight: 1.4 }}>
        UPI confirmed in 2 seconds.<br/>Dev's been notified.
      </div>

      <div style={{ marginTop: 18, width: '100%', padding: 12, background: 'var(--paper-tint)', borderRadius: 12, fontSize: 12, textAlign: 'left' }}>
        <div className="screen-label">net change</div>
        <div style={{ fontSize: 13, marginTop: 4 }}>You were <span className="amount owed">+₹1,248</span></div>
        <div style={{ fontSize: 13 }}>Now you're <span className="amount owed">+₹1,628</span> — ahead ₹380 more</div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 20, width: '100%' }}>
        <button className="phone-btn" style={{ flex: 1 }}>Share receipt</button>
        <button className="phone-btn primary" style={{ flex: 1 }}>Done</button>
      </div>
    </div>
  </SketchyPhone>
);

// FLOW 7: Insights
const InsightsCharts = () => (
  <SketchyPhone time="9:41" showTabbar activeTab="you">
    <div style={{ padding: '14px 16px 0' }}>
      <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>This month · April</div>
      <div className="screen-h1" style={{ fontSize: 28 }}>Your spending</div>
      <Scribble width={100} />
    </div>

    {/* Top stats */}
    <div style={{ padding: '10px 16px', display: 'flex', gap: 8 }}>
      {[
        { k: 'total', v: '₹12,480', d: '+18% vs Mar' },
        { k: 'shared', v: '₹4,820', d: '39% of total' },
      ].map((s, i) => (
        <div key={i} className="sk-border" style={{ flex: 1, padding: 10, background: i === 0 ? 'var(--accent-soft)' : 'var(--accent-2-soft)' }}>
          <div className="screen-label">{s.k}</div>
          <div style={{ fontFamily: 'Caveat', fontSize: 26, fontWeight: 700 }}>{s.v}</div>
          <div style={{ fontSize: 10, color: 'var(--ink-mute)' }}>{s.d}</div>
        </div>
      ))}
    </div>

    {/* Category bar chart — hand drawn */}
    <div style={{ padding: '14px 16px 0' }}>
      <div className="screen-h2">By category</div>
      <div style={{ marginTop: 8 }}>
        {[
          { n: 'Food & drink', p: 82, v: '₹4,120', c: 'var(--accent)' },
          { n: 'Transport', p: 55, v: '₹2,750', c: 'var(--accent-2)' },
          { n: 'Rent & utilities', p: 48, v: '₹2,400', c: 'var(--success)' },
          { n: 'Groceries', p: 38, v: '₹1,880', c: '#b86be0' },
          { n: 'Fun & leisure', p: 26, v: '₹1,330', c: '#f5a34a' },
        ].map((c, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span>{c.n}</span><b>{c.v}</b>
            </div>
            <div style={{ height: 10, background: 'var(--paper-tint)', border: '1px solid var(--line)', borderRadius: 6, marginTop: 3, overflow: 'hidden' }}>
              <div style={{ width: `${c.p}%`, height: '100%', background: c.c, borderRadius: 6 }} />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Trend */}
    <div style={{ padding: '14px 16px 0' }}>
      <div className="screen-h2">Last 6 months</div>
      <div className="sk-border" style={{ padding: 12, marginTop: 6, height: 100, position: 'relative' }}>
        <svg width="100%" height="76" viewBox="0 0 260 76" preserveAspectRatio="none" style={{ display: 'block' }}>
          <path d="M5 55 Q 30 40, 55 48 T 110 35 T 170 42 T 225 22 L 255 30" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round"/>
          <path d="M5 55 Q 30 40, 55 48 T 110 35 T 170 42 T 225 22 L 255 30 L 255 75 L 5 75 Z" fill="var(--accent-soft)" opacity="0.6"/>
          {[5, 55, 110, 170, 225, 255].map((x, i) => (
            <circle key={i} cx={x} cy={[55, 48, 35, 42, 22, 30][i]} r="3" fill="var(--accent)" stroke="#fff" strokeWidth="1.5"/>
          ))}
        </svg>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--ink-mute)', padding: '0 4px' }}>
          {['Nov','Dec','Jan','Feb','Mar','Apr'].map(m => <span key={m}>{m}</span>)}
        </div>
      </div>
    </div>

    {/* Narrative cards */}
    <div style={{ padding: '14px 16px 20px' }}>
      <div className="sk-border" style={{ padding: 12, background: 'var(--paper-card)', borderColor: 'var(--warn)', borderStyle: 'dashed' }}>
        <div style={{ fontFamily: 'Caveat', fontSize: 18, fontWeight: 700 }}>🌮 Whoa, food month</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 3, lineHeight: 1.4 }}>You spent <b>30% more on food</b> than your usual. Blue Tokai 7×, Mahabelly 4×.</div>
      </div>
    </div>
  </SketchyPhone>
);

const InsightsNarrative = () => (
  <SketchyPhone time="9:41" showTabbar activeTab="you">
    <div style={{ padding: '14px 16px 0' }}>
      <div className="screen-h1" style={{ fontSize: 28 }}>Your month, told</div>
      <Scribble width={120} />
    </div>

    <div style={{ padding: '14px 16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[
        { e: '🌮', t: 'Food was the big one', b: 'You spent ₹4,120 on food & drink — up 30% from Mar. Blue Tokai topped the list (7 visits).', c: 'var(--accent-soft)', bd: 'var(--accent)' },
        { e: '🎉', t: 'Goa trip: you fronted a lot', b: 'Across 12 expenses, you paid ₹8,400 upfront. ₹1,680 still coming back to you.', c: 'var(--accent-2-soft)', bd: 'var(--accent-2)' },
        { e: '🏆', t: 'Split champion', b: "You settled 94% of debts within 48 hours — ahead of 87% of GoDutchers.", c: 'var(--success-soft)', bd: 'var(--success)' },
        { e: '🤝', t: 'Most-shared with', b: 'Sam — 18 shared expenses this month. You two eat dinner together a lot 🍜', c: '#fef0b8', bd: 'var(--warn)' },
        { e: '💸', t: 'Saved by smart split', b: "Auto-detection saved you ~14 min of manual entry this month.", c: '#e8d6f5', bd: '#b86be0' },
      ].map((card, i) => (
        <div key={i} className="sk-border" style={{ padding: 12, background: card.c, borderColor: card.bd, transform: `rotate(${[-0.5, 0.5, -0.3, 0.4, -0.4][i]}deg)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 28 }}>{card.e}</div>
            <div style={{ fontFamily: 'Caveat', fontSize: 22, fontWeight: 700 }}>{card.t}</div>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4, lineHeight: 1.4 }}>{card.b}</div>
        </div>
      ))}
    </div>
  </SketchyPhone>
);

// FLOW 8: Activity / Notifications feed
const ActivityFeed = () => (
  <SketchyPhone time="9:41" showTabbar activeTab="activity">
    <div style={{ padding: '14px 16px 6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="screen-h1" style={{ fontSize: 28 }}>Activity</div>
        <div className="sk-chip" style={{ fontSize: 11 }}>all · unread · pings</div>
      </div>
    </div>

    <div style={{ padding: '0 16px' }}>
      <div className="screen-label">today</div>
    </div>

    <div style={{ padding: '0 16px' }}>
      {[
        { i: '⚡', t: <><b>GoDutch</b> caught ₹840 at Blue Tokai</>, b: 'tap to split with Foodies', ago: '1m', hl: true },
        { i: '✅', t: <><b>Sam</b> settled ₹620</>, b: 'via UPI · Goa Trip', ago: '3h' },
        { i: '💬', t: <><b>Priya</b> commented on Surf lesson</>, b: '"will send over tmrw morning"', ago: '4h' },
      ].map((a, i) => (
        <div key={i} className="row-item" style={{ background: a.hl ? 'var(--accent-soft)' : 'transparent', padding: a.hl ? 10 : undefined, borderRadius: a.hl ? 10 : 0, marginBottom: a.hl ? 6 : 0, border: a.hl ? '1.5px solid var(--accent)' : undefined }}>
          <div style={{ fontSize: 20, width: 32 }}>{a.i}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5 }}>{a.t}</div>
            <div className="screen-small">{a.b}</div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{a.ago}</div>
        </div>
      ))}
    </div>

    <div style={{ padding: '10px 16px 6px' }}>
      <div className="screen-label">yesterday</div>
    </div>
    <div style={{ padding: '0 16px 20px' }}>
      {[
        { i: '📸', t: <><b>You</b> added "Grocery run" — 4-way split</>, b: 'Apartment · ₹2,340', ago: 'Wed' },
        { i: '🔔', t: <><b>Dev</b> nudged you to settle</>, b: '₹380 across 2 groups', ago: 'Wed' },
        { i: '🎉', t: <><b>Maya</b> joined Goa Trip</>, b: 'invited by you', ago: 'Tue' },
        { i: '🎙', t: <><b>You</b> voice-added "Uber to airport"</>, b: '$28.50 · split with Maya', ago: 'Tue' },
      ].map((a, i) => (
        <div key={i} className="row-item">
          <div style={{ fontSize: 18, width: 32 }}>{a.i}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5 }}>{a.t}</div>
            <div className="screen-small">{a.b}</div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{a.ago}</div>
        </div>
      ))}
    </div>
  </SketchyPhone>
);

Object.assign(window, { SettleUpMain, SettleMethod, SettleConfirmed, InsightsCharts, InsightsNarrative, ActivityFeed });
