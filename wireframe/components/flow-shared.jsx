// Shared expense preview + account + signup — added to address teammate comments

// Unified split preview — shared by Screenshot, Voice, and UPI flows
// Takes a `source` prop to show a different "how we got this" banner at the top.
const UnifiedSplitPreview = ({ source = 'screenshot' }) => {
  const sourceMeta = {
    screenshot: {
      icon: <Icons.Receipt />,
      label: 'from receipt',
      text: '"Blue Tokai Cafe" · 4 items detected',
      bg: 'var(--accent-soft)',
      bd: 'var(--accent)',
    },
    voice: {
      icon: <Icons.Mic />,
      label: 'heard you say',
      text: '"Dinner tonight, 2,400 between me, Sam and Priya. I paid."',
      bg: 'var(--accent-2-soft)',
      bd: 'var(--accent-2)',
    },
    upi: {
      icon: <Icons.Bolt />,
      label: 'caught a UPI payment',
      text: '₹840 to Blue Tokai · via PayTM · 2 min ago',
      bg: '#fef0b8',
      bd: 'var(--warn)',
    },
  }[source];

  return (
    <SketchyPhone time="9:41">
      <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icons.ArrowLeft />
        <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>Does this look right?</div>
        <div style={{ fontSize: 11, color: 'var(--accent-2)' }}>edit</div>
      </div>

      {/* Source banner — same shape for all three */}
      <div style={{ padding: '10px 16px 0' }}>
        <div className="sk-border" style={{ padding: 10, background: sourceMeta.bg, borderColor: sourceMeta.bd }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700, color: 'var(--ink-soft)' }}>
            {sourceMeta.icon} {sourceMeta.label}
          </div>
          <div style={{ fontFamily: 'Kalam', fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 4, fontStyle: source === 'voice' ? 'italic' : 'normal' }}>
            {sourceMeta.text}
          </div>
        </div>
      </div>

      {/* Parsed title + amount */}
      <div style={{ padding: '14px 16px 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontFamily: 'Caveat', fontSize: 30, fontWeight: 700 }}>
            {source === 'voice' ? 'Dinner 🍝' : source === 'upi' ? 'Blue Tokai ☕' : 'Blue Tokai ☕'}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>
            {source === 'voice' ? '₹2,400' : source === 'upi' ? '₹840' : '₹1,575'}
          </div>
        </div>
        <div className="screen-small">Today · Foodies group</div>
      </div>

      {/* Editable fields */}
      <div style={{ padding: '6px 16px 0' }}>
        {[
          { l: 'when', v: 'Today, 8:12 PM' },
          { l: 'category', v: '🍽 Food & drink' },
          { l: 'paid by', v: 'You' },
          { l: 'group', v: 'Foodies' },
        ].map((f, i) => (
          <div key={i} className="row-item" style={{ padding: '7px 0' }}>
            <div style={{ width: 70, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--ink-mute)', fontWeight: 700 }}>{f.l}</div>
            <div style={{ flex: 1, fontSize: 13.5, fontWeight: 700 }}>{f.v}</div>
            <Icons.ChevRight />
          </div>
        ))}
      </div>

      {/* Split mode + people */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          {['Equal', 'By item', 'Custom'].map((m, i) => (
            <div key={i} style={{
              flex: 1, padding: '5px 4px', textAlign: 'center', fontSize: 12,
              border: '1.5px solid var(--line)', borderRadius: 8,
              background: i === 0 ? 'var(--ink)' : 'var(--paper-card)',
              color: i === 0 ? '#fff' : 'var(--ink)', fontWeight: 700,
            }}>{m}</div>
          ))}
        </div>
        <div className="screen-label">split · 3 ways</div>
        <div style={{ marginTop: 4 }}>
          {[
            { n: 'You', role: 'paid', amt: source === 'voice' ? '−₹1,600' : source === 'upi' ? '−₹560' : '−₹1,050', a: 'owed', c: 0 },
            { n: 'Sam', role: 'owes you', amt: source === 'voice' ? '+₹800' : source === 'upi' ? '+₹280' : '+₹525', a: 'owed', c: 1 },
            { n: 'Priya', role: 'owes you', amt: source === 'voice' ? '+₹800' : source === 'upi' ? '+₹280' : '+₹525', a: 'owed', c: 2 },
          ].map((p, i) => (
            <div key={i} className="row-item" style={{ padding: '7px 0' }}>
              <Avatar initials={p.n[0]} color={AVATAR_COLORS[i]} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{p.n}</div>
                <div className="screen-small">{p.role}</div>
              </div>
              <div className={`amount ${p.a}`}>{p.amt}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'sticky', bottom: 0, padding: '10px 16px 18px', background: 'var(--paper-card)', borderTop: '1.5px solid var(--line)', display: 'flex', gap: 8 }}>
        <button className="phone-btn"><Icons.X /></button>
        <button className="phone-btn primary" style={{ flex: 1 }}><Icons.Check /> Confirm & send</button>
      </div>
    </SketchyPhone>
  );
};

// Sign-up screen — after Welcome, before Group setup
const SignUp = () => (
  <SketchyPhone time="9:41">
    <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icons.ArrowLeft />
      <div style={{ flex: 1 }}>
        <div className="screen-label">step 1 of 3</div>
        <div style={{ display: 'flex', gap: 3, marginTop: 3 }}>
          <div style={{ flex: 1, height: 3, background: 'var(--accent)', borderRadius: 2 }} />
          <div style={{ flex: 1, height: 3, background: 'var(--paper-tint)', borderRadius: 2 }} />
          <div style={{ flex: 1, height: 3, background: 'var(--paper-tint)', borderRadius: 2 }} />
        </div>
      </div>
    </div>

    <div className="screen-body">
      <div className="screen-h1">Create your account</div>
      <div className="screen-small">Pick the quickest way — you can add the other later.</div>

      {/* Google button */}
      <button className="phone-btn full" style={{ marginTop: 16, gap: 10, padding: '12px', background: 'var(--paper-card)' }}>
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.91-2.26c-.81.54-1.83.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 009 18z" fill="#34A853"/>
          <path d="M3.96 10.71A5.41 5.41 0 013.66 9c0-.6.1-1.17.3-1.71V4.96H.96A9 9 0 000 9c0 1.45.35 2.82.96 4.04l3-2.33z" fill="#FBBC05"/>
          <path d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 009 0 9 9 0 00.96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        <span>Continue with Google</span>
      </button>

      <button className="phone-btn full" style={{ marginTop: 8, gap: 10, padding: '12px', background: '#000', color: '#fff', borderColor: '#000' }}>
        <svg width="16" height="18" viewBox="0 0 16 18" fill="#fff"><path d="M13.28 9.6c0-2.25 1.84-3.34 1.93-3.4-1.05-1.54-2.69-1.75-3.27-1.77-1.39-.14-2.72.82-3.43.82-.71 0-1.8-.8-2.97-.78-1.53.02-2.94.89-3.72 2.26-1.59 2.76-.41 6.84 1.14 9.08.76 1.1 1.66 2.33 2.83 2.28 1.14-.05 1.57-.74 2.95-.74 1.38 0 1.76.74 2.97.71 1.23-.02 2-1.11 2.75-2.22.87-1.27 1.22-2.51 1.24-2.57-.03-.01-2.38-.91-2.42-3.67zM11.2 2.9c.63-.77 1.05-1.82.93-2.89-.9.04-2 .6-2.65 1.36-.58.67-1.1 1.76-.96 2.78 1.01.08 2.04-.51 2.68-1.25z"/></svg>
        <span>Continue with Apple</span>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 10px' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--line-soft)' }} />
        <div style={{ fontSize: 11, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: 0.6 }}>or email</div>
        <div style={{ flex: 1, height: 1, background: 'var(--line-soft)' }} />
      </div>

      <div className="sk-border" style={{ padding: '10px 12px', marginBottom: 8 }}>
        <div className="screen-label">email</div>
        <div style={{ fontSize: 14, color: 'var(--ink-soft)', fontFamily: 'Kalam' }}>alex@mail.com<span style={{ borderRight: '2px solid var(--accent)', marginLeft: 1, animation: 'blink 1s infinite' }}>&nbsp;</span></div>
      </div>
      <div className="sk-border" style={{ padding: '10px 12px' }}>
        <div className="screen-label">password</div>
        <div style={{ fontSize: 14, color: 'var(--ink-mute)', letterSpacing: 3 }}>••••••••</div>
      </div>

      <button className="phone-btn primary full" style={{ marginTop: 14 }}>Create account →</button>

      <div style={{ fontSize: 11, color: 'var(--ink-mute)', textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
        By continuing you agree to our<br/>
        <u>Terms</u> and <u>Privacy Policy</u>
      </div>
    </div>
  </SketchyPhone>
);

// Account / Settings screen
const AccountSettings = () => (
  <SketchyPhone time="9:41" showTabbar activeTab="you">
    <div style={{ padding: '14px 16px 0' }}>
      <div className="screen-h1" style={{ fontSize: 28 }}>Account</div>
      <Scribble width={70} />
    </div>

    {/* Profile card */}
    <div style={{ padding: '12px 16px 0' }}>
      <div className="sk-border" style={{ padding: 14, background: 'var(--paper-card)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative' }}>
          <Avatar initials="A" color={AVATAR_COLORS[0]} size="lg" />
          <div style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: 'var(--accent)', border: '2px solid var(--paper-card)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Alex Khanna</div>
          <div className="screen-small">alex@mail.com · +91 ••• 8812</div>
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            <div className="sk-chip success" style={{ fontSize: 10 }}><Icons.Check /> UPI linked</div>
            <div className="sk-chip" style={{ fontSize: 10 }}>Pro</div>
          </div>
        </div>
        <Icons.ChevRight />
      </div>
    </div>

    {/* Settings sections */}
    <div style={{ padding: '14px 16px 0' }}>
      <div className="screen-label">payment & linking</div>
      <div className="sk-border" style={{ padding: '4px 12px', marginTop: 6, background: 'var(--paper-card)' }}>
        {[
          { i: '💳', t: 'UPI apps linked', s: 'PayTM, GPay', r: '2' },
          { i: '🏦', t: 'Bank account', s: 'HDFC ••••4521' },
          { i: '💱', t: 'Default currency', s: 'INR ₹' },
        ].map((r, i, arr) => (
          <div key={i} className="row-item" style={{ padding: '10px 0', borderBottom: i === arr.length - 1 ? 'none' : '1px dashed var(--line-soft)' }}>
            <div style={{ fontSize: 18 }}>{r.i}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{r.t}</div>
              <div className="screen-small">{r.s}</div>
            </div>
            {r.r && <div className="sk-chip" style={{ fontSize: 10 }}>{r.r}</div>}
            <Icons.ChevRight />
          </div>
        ))}
      </div>
    </div>

    <div style={{ padding: '14px 16px 0' }}>
      <div className="screen-label">preferences</div>
      <div className="sk-border" style={{ padding: '4px 12px', marginTop: 6, background: 'var(--paper-card)' }}>
        {[
          { i: '⚡', t: 'Auto-detect UPI', s: 'silent background', toggle: true },
          { i: '🔔', t: 'Notifications', s: 'nudges · settles · comments' },
          { i: '🌙', t: 'Appearance', s: 'system' },
          { i: '🔒', t: 'Privacy & data', s: 'receipts stored 90 days' },
        ].map((r, i, arr) => (
          <div key={i} className="row-item" style={{ padding: '10px 0', borderBottom: i === arr.length - 1 ? 'none' : '1px dashed var(--line-soft)' }}>
            <div style={{ fontSize: 18 }}>{r.i}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{r.t}</div>
              <div className="screen-small">{r.s}</div>
            </div>
            {r.toggle ? (
              <div style={{ width: 34, height: 20, borderRadius: 10, background: 'var(--success)', border: '1.5px solid var(--line)', position: 'relative' }}>
                <div style={{ position: 'absolute', right: 1, top: 1, width: 14, height: 14, borderRadius: '50%', background: '#fff', border: '1.2px solid var(--line)' }} />
              </div>
            ) : <Icons.ChevRight />}
          </div>
        ))}
      </div>
    </div>

    <div style={{ padding: '14px 16px 0' }}>
      <div className="screen-label">help & legal</div>
      <div className="sk-border" style={{ padding: '4px 12px', marginTop: 6, background: 'var(--paper-card)' }}>
        {[
          { i: '❓', t: 'Help & support' },
          { i: '📄', t: 'Terms of service' },
          { i: '🔐', t: 'Privacy policy' },
          { i: 'ℹ️', t: 'About · v2.3.1' },
        ].map((r, i, arr) => (
          <div key={i} className="row-item" style={{ padding: '10px 0', borderBottom: i === arr.length - 1 ? 'none' : '1px dashed var(--line-soft)' }}>
            <div style={{ fontSize: 18 }}>{r.i}</div>
            <div style={{ flex: 1, fontSize: 13.5, fontWeight: 700 }}>{r.t}</div>
            <Icons.ChevRight />
          </div>
        ))}
      </div>
    </div>

    <div style={{ padding: '14px 16px 24px' }}>
      <button className="phone-btn full" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>
        Sign out
      </button>
      <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-mute)', marginTop: 10, fontFamily: 'Caveat', fontSize: 14 }}>
        made with 🧡 · GoDutch
      </div>
    </div>
  </SketchyPhone>
);

Object.assign(window, { UnifiedSplitPreview, SignUp, AccountSettings });
