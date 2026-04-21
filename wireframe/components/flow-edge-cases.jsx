// Edge cases + UPI permission — tucked into parent flows

// Onboarding step 3: UPI permission grant
const UPIPermission = () => (
  <SketchyPhone time="9:41">
    <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1 }}>
        <div className="screen-label">step 3 of 3 · almost there</div>
        <div style={{ display: 'flex', gap: 3, marginTop: 3 }}>
          {[1,2,3].map(i => <div key={i} style={{ flex: 1, height: 3, background: 'var(--accent)', borderRadius: 2 }} />)}
        </div>
      </div>
    </div>

    <div className="screen-body">
      <div style={{ fontSize: 40, textAlign: 'center', marginTop: 12 }}>⚡</div>
      <div className="screen-h1" style={{ fontSize: 26, textAlign: 'center' }}>Let GoDutch catch UPI payments?</div>
      <div style={{ fontFamily: 'Kalam', fontSize: 13.5, color: 'var(--ink-soft)', textAlign: 'center', marginTop: 8, lineHeight: 1.5 }}>
        We read your UPI notifications silently — just enough to suggest a split. Nothing sent to us unless you tap split.
      </div>

      <div className="sk-border" style={{ padding: 12, marginTop: 18, background: 'var(--paper-card)' }}>
        {[
          { i: '✅', t: 'Only reads payment notifs', s: 'PayTM, GPay, PhonePe, BHIM' },
          { i: '🔒', t: 'Processed on-device', s: 'raw data never leaves your phone' },
          { i: '↩️', t: 'Turn off any time', s: 'Settings · Auto-detect UPI' },
        ].map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < 2 ? '1px dashed var(--line-soft)' : 'none' }}>
            <div style={{ fontSize: 18 }}>{r.i}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{r.t}</div>
              <div className="screen-small">{r.s}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Fake system sheet */}
      <div style={{ marginTop: 14, padding: 12, background: 'var(--paper-tint)', border: '1.5px dashed var(--line-soft)', borderRadius: 12, fontSize: 12, color: 'var(--ink-soft)' }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--ink-mute)', fontWeight: 700 }}>system will ask</div>
        <div style={{ marginTop: 4 }}>"Allow <b>GoDutch</b> to access notifications?"</div>
      </div>
    </div>

    <div style={{ position: 'sticky', bottom: 0, padding: '10px 16px 18px', background: 'var(--paper-card)', borderTop: '1.5px solid var(--line)' }}>
      <button className="phone-btn primary full">Allow & continue →</button>
      <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'var(--ink-mute)' }}>Skip for now</div>
    </div>
  </SketchyPhone>
);

// Edge case: OCR failure
const ScreenshotOCRFail = () => (
  <SketchyPhone time="9:41">
    <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icons.X />
      <div style={{ flex: 1, fontSize: 14, fontWeight: 700, textAlign: 'center' }}>Hmm, that was fuzzy</div>
    </div>
    <div style={{ padding: '14px 16px' }}>
      <div className="sk-placeholder" style={{ height: 160, fontSize: 13 }}>📷 blurry receipt</div>

      <div className="sk-border" style={{ padding: 12, marginTop: 12, background: '#fef0b8', borderColor: 'var(--warn)', borderStyle: 'dashed' }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700, color: 'var(--ink-soft)' }}>⚠ partial read</div>
        <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>Got the total (₹1,575) but items are unclear</div>
        <div className="screen-small" style={{ marginTop: 2 }}>Confidence: 54%</div>
      </div>

      <div style={{ marginTop: 14 }}>
        <div className="screen-label">what would you like to do?</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
          {[
            { i: '📸', t: 'Retake photo', s: 'better lighting helps', hi: true },
            { i: '✏️', t: 'Enter items manually', s: 'I\'ll keep the total you got' },
            { i: '⚖', t: 'Just split the total', s: 'skip itemization, split ₹1,575 equally' },
          ].map((o, i) => (
            <div key={i} className="sk-border" style={{ padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'center', background: o.hi ? 'var(--accent-soft)' : 'var(--paper-card)', borderColor: o.hi ? 'var(--accent)' : 'var(--line)' }}>
              <div style={{ fontSize: 18 }}>{o.i}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{o.t}</div>
                <div className="screen-small">{o.s}</div>
              </div>
              <Icons.ChevRight />
            </div>
          ))}
        </div>
      </div>
    </div>
  </SketchyPhone>
);

// Edge case: Voice mis-parse recovery
const VoiceMisparse = () => (
  <SketchyPhone time="9:41">
    <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icons.ArrowLeft />
      <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>Something off?</div>
    </div>

    <div style={{ padding: '10px 16px 0' }}>
      <div className="sk-border" style={{ padding: 10, background: 'var(--paper-card)' }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700, color: 'var(--ink-mute)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icons.Mic /> heard you say
        </div>
        <div style={{ fontFamily: 'Kalam', fontSize: 13, color: 'var(--ink-soft)', marginTop: 4, fontStyle: 'italic', lineHeight: 1.5 }}>
          "Split <span style={{ background: '#fef0b8', padding: '0 3px', borderRadius: 3, borderBottom: '2px wavy var(--warn)' }}>cafe</span> bill, <span style={{ background: '#fef0b8', padding: '0 3px', borderRadius: 3, borderBottom: '2px wavy var(--warn)' }}>twenty four hundred</span>, me Sam and <span style={{ background: '#fef0b8', padding: '0 3px', borderRadius: 3, borderBottom: '2px wavy var(--warn)' }}>Prija</span>"
        </div>
      </div>
    </div>

    <div style={{ padding: '12px 16px 0' }}>
      <div className="screen-label">⚠ we weren't sure about…</div>

      {[
        { q: 'Amount?', opts: ['₹2,400', '₹24', '$2,400'], pick: 0, note: 'voice said "twenty four hundred"' },
        { q: 'Who?', opts: ['Priya R.', 'Priya K.', 'new person "Prija"'], pick: 0, note: 'closest contact match' },
        { q: 'Category?', opts: ['☕ Cafe', '🍽 Food', 'Other'], pick: 1, note: 'based on past splits' },
      ].map((q, i) => (
        <div key={i} style={{ marginTop: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{q.q}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {q.opts.map((o, oi) => (
              <div key={oi} className="sk-chip" style={{ background: oi === q.pick ? 'var(--accent)' : 'var(--paper-card)', color: oi === q.pick ? '#fff' : 'var(--ink)', borderColor: oi === q.pick ? 'var(--accent)' : 'var(--line)' }}>{o}</div>
            ))}
          </div>
          <div className="screen-small" style={{ marginTop: 3 }}>{q.note}</div>
        </div>
      ))}
    </div>

    <div style={{ padding: '14px 16px 0' }}>
      <div style={{ padding: 10, background: 'var(--accent-2-soft)', borderRadius: 10, border: '1px dashed var(--accent-2)', fontSize: 12, fontFamily: 'Caveat', fontSize: 16 }}>
        💬 or just say <i>"no, it was ₹240, only me and Sam"</i> — I'll redo it.
      </div>
    </div>

    <div style={{ position: 'sticky', bottom: 0, padding: '10px 16px 18px', background: 'var(--paper-card)', borderTop: '1.5px solid var(--line)', display: 'flex', gap: 8 }}>
      <button className="phone-btn"><Icons.Mic /> redo</button>
      <button className="phone-btn primary" style={{ flex: 1 }}>Looks good →</button>
    </div>
  </SketchyPhone>
);

// Edge case: Multi-currency trip
const MultiCurrency = () => (
  <SketchyPhone time="9:41">
    <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icons.ArrowLeft />
      <div style={{ flex: 1, fontSize: 13, color: 'var(--ink-mute)' }}>Tokyo Trip › Add expense</div>
    </div>

    <div style={{ padding: '10px 16px 0' }}>
      <div className="sk-border" style={{ padding: 10, background: 'var(--accent-2-soft)', display: 'flex', gap: 8, alignItems: 'center', fontSize: 12 }}>
        <Icons.Sparkle />
        <div><b>Trip currency:</b> ¥ JPY · <span className="screen-small">we detected yen from your location</span></div>
      </div>
    </div>

    <div style={{ padding: '14px 16px 0' }}>
      <div className="screen-label">amount</div>
      <div className="sk-border" style={{ padding: 12, marginTop: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          padding: '4px 10px', background: 'var(--ink)', color: '#fff',
          borderRadius: 8, fontSize: 13, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>¥ JPY <Icons.ChevDown /></div>
        <div style={{ flex: 1, fontSize: 24, fontWeight: 700 }}>8,400</div>
      </div>
      <div style={{ marginTop: 6, padding: '6px 10px', background: 'var(--paper-tint)', borderRadius: 8, fontSize: 12, color: 'var(--ink-soft)', display: 'flex', justifyContent: 'space-between' }}>
        <span>≈ ₹4,680 INR</span>
        <span className="screen-small">rate: 0.557 · live</span>
      </div>
    </div>

    <div style={{ padding: '12px 16px 0' }}>
      <div className="screen-label">other recent</div>
      <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
        {['¥ JPY', '₹ INR', '$ USD', '€ EUR', '฿ THB'].map((c, i) => (
          <div key={i} className={`sk-chip ${i === 0 ? 'accent' : ''}`}>{c}</div>
        ))}
      </div>
    </div>

    <div style={{ padding: '14px 16px 0' }}>
      <div className="screen-label">split · 3 ways</div>
      {[
        { n: 'You', a: '¥2,800', b: '≈ ₹1,560', c: 0 },
        { n: 'Sam', a: '¥2,800', b: '≈ ₹1,560', c: 1 },
        { n: 'Maya', a: '¥2,800', b: '≈ ₹1,560', c: 4 },
      ].map((p, i) => (
        <div key={i} className="row-item">
          <Avatar initials={p.n[0]} color={AVATAR_COLORS[p.c]} />
          <div style={{ flex: 1, fontSize: 13.5, fontWeight: 700 }}>{p.n}</div>
          <div style={{ textAlign: 'right' }}>
            <div className="amount">{p.a}</div>
            <div className="screen-small">{p.b}</div>
          </div>
        </div>
      ))}
    </div>

    <div style={{ padding: '12px 16px 0' }}>
      <div style={{ padding: 10, background: 'var(--paper-tint)', borderRadius: 10, fontSize: 12, fontFamily: 'Caveat', fontSize: 16, color: 'var(--ink-soft)' }}>
        💡 Settle-up will convert to each person's home currency at today's rate.
      </div>
    </div>

    <div style={{ position: 'sticky', bottom: 0, padding: '10px 16px 18px', background: 'var(--paper-card)', borderTop: '1.5px solid var(--line)' }}>
      <button className="phone-btn primary full">Add ¥8,400 expense</button>
    </div>
  </SketchyPhone>
);

// Edge case: Expense dispute (hybrid: light comment → escalate to formal)
const ExpenseDispute = () => (
  <SketchyPhone time="9:41">
    <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icons.ArrowLeft />
      <div style={{ flex: 1, fontSize: 13, color: 'var(--ink-mute)' }}>Goa › Surf lesson</div>
    </div>

    <div style={{ padding: '10px 16px 0' }}>
      <div className="sk-border" style={{ padding: 10, background: '#ffd4d4', borderColor: 'var(--accent)', borderStyle: 'dashed' }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700, color: 'var(--accent)' }}>⚠ Dev flagged this</div>
        <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 4 }}>"I didn't actually join the surf lesson — just watched"</div>
        <div className="screen-small" style={{ marginTop: 2 }}>flagged 2 hours ago</div>
      </div>
    </div>

    <div style={{ padding: '14px 16px 0' }}>
      <div className="screen-label">comments</div>
      <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { n: 'Dev', c: 3, side: 'them', m: "hey, I only watched from the beach. Can we redo?" },
          { n: 'You', c: 0, side: 'you', m: 'oh shoot! my bad — let me re-split without Dev' },
          { n: 'Sam', c: 1, side: 'them', m: 'he\'s right, we owe him back ✌️' },
        ].map((c, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, flexDirection: c.side === 'you' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
            <Avatar initials={c.n[0]} color={AVATAR_COLORS[c.c]} size="sm" />
            <div style={{ maxWidth: '70%', padding: '6px 10px', background: c.side === 'you' ? 'var(--accent)' : 'var(--paper-card)', color: c.side === 'you' ? '#fff' : 'var(--ink)', border: '1.5px solid var(--line)', borderRadius: 12, fontSize: 12.5 }}>
              <b style={{ fontSize: 10, display: c.side === 'you' ? 'none' : 'block' }}>{c.n}</b>
              {c.m}
            </div>
          </div>
        ))}
      </div>
    </div>

    <div style={{ padding: '14px 16px 0' }}>
      <div className="screen-label">proposed fix</div>
      <div className="sk-border" style={{ padding: 12, marginTop: 6, background: 'var(--success-soft)', borderColor: 'var(--success)' }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>Re-split 4 ways (remove Dev)</div>
        <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>Everyone pays ₹750 instead of ₹600 · Dev refunded ₹600</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <button className="phone-btn" style={{ fontSize: 11, padding: '5px 10px' }}>Edit split</button>
          <button className="phone-btn success" style={{ fontSize: 11, padding: '5px 10px' }}><Icons.Check /> Accept fix</button>
        </div>
      </div>
    </div>

    <div style={{ position: 'sticky', bottom: 0, padding: '8px 12px 16px', background: 'var(--paper-card)', borderTop: '1.5px solid var(--line)', display: 'flex', gap: 6, alignItems: 'center' }}>
      <div className="sk-border" style={{ flex: 1, padding: '6px 10px', fontSize: 12, color: 'var(--ink-mute)' }}>Reply…</div>
      <button className="phone-btn primary" style={{ padding: '6px 10px' }}><Icons.Mic /></button>
    </div>
  </SketchyPhone>
);

Object.assign(window, { UPIPermission, ScreenshotOCRFail, VoiceMisparse, MultiCurrency, ExpenseDispute });
