// FLOW 1: Onboarding & Home Dashboard
// 4 screens: Welcome → Import contacts/groups → Dashboard (2 variants)

const OnboardWelcome = () => (
  <SketchyPhone time="9:41">
    <div className="screen-body" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '24px 22px' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        {/* Logo placeholder */}
        <div style={{
          width: 100, height: 100, borderRadius: 28,
          border: '2px solid var(--line)', background: 'var(--accent-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Caveat', fontSize: 56, fontWeight: 700, color: 'var(--accent)',
          boxShadow: '3px 3px 0 var(--line)',
          transform: 'rotate(-3deg)',
        }}>₲D</div>
        <div style={{ textAlign: 'center' }}>
          <div className="screen-h1" style={{ fontSize: 36 }}>GoDutch.</div>
          <Scribble width={100} />
          <div style={{ fontFamily: 'Kalam', fontSize: 15, color: 'var(--ink-soft)', marginTop: 10, lineHeight: 1.4 }}>
            Split expenses without the math.<br/>Snap, speak, settle.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 20 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, color: 'var(--ink-soft)' }}>
            <span style={{ width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%' }} />
            Screenshot → auto split a receipt
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, color: 'var(--ink-soft)' }}>
            <span style={{ width: 6, height: 6, background: 'var(--accent-2)', borderRadius: '50%' }} />
            Just say it: "Dinner, 60 bucks, me & Sam"
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, color: 'var(--ink-soft)' }}>
            <span style={{ width: 6, height: 6, background: 'var(--success)', borderRadius: '50%' }} />
            Pay caught automatically — no double entry
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="phone-btn primary full">Get started</button>
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-mute)' }}>already have an account? <span style={{ color: 'var(--accent-2)', textDecoration: 'underline' }}>sign in</span></div>
      </div>
    </div>
  </SketchyPhone>
);

const OnboardGroupSetup = () => (
  <SketchyPhone time="9:41">
    <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icons.ArrowLeft />
      <div style={{ flex: 1 }}>
        <div className="screen-label">step 2 of 3</div>
        <div style={{ display: 'flex', gap: 3, marginTop: 3 }}>
          <div style={{ flex: 1, height: 3, background: 'var(--accent)', borderRadius: 2 }} />
          <div style={{ flex: 1, height: 3, background: 'var(--accent)', borderRadius: 2 }} />
          <div style={{ flex: 1, height: 3, background: 'var(--paper-tint)', borderRadius: 2 }} />
        </div>
      </div>
    </div>

    <div className="screen-body">
      <div className="screen-h1">Who do you split with?</div>
      <div className="screen-small">Pick a few people to start. You can add more later.</div>

      <div className="sk-border" style={{ padding: 10, marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icons.Search />
        <span style={{ fontSize: 13, color: 'var(--ink-mute)' }}>Search name or phone</span>
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="screen-label">suggested · from contacts</div>
        <div style={{ marginTop: 6 }}>
          {[
            { n: 'Sam Khan', h: '+91 ••• 4821', s: true, c: 0 },
            { n: 'Priya R.', h: '+91 ••• 3319', s: true, c: 1 },
            { n: 'Dev Ahuja', h: '+91 ••• 7702', s: false, c: 2 },
            { n: 'Maya L.', h: 'maya@mail.com', s: true, c: 3 },
            { n: 'Jordan T.', h: '+1 ••• 5521', s: false, c: 4 },
          ].map((p, i) => (
            <div key={i} className="row-item">
              <Avatar initials={p.n.split(' ').map(x => x[0]).join('')} color={AVATAR_COLORS[p.c]} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{p.n}</div>
                <div className="screen-small">{p.h}</div>
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                border: '1.5px solid var(--line)',
                background: p.s ? 'var(--accent)' : 'transparent',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{p.s && <Icons.Check />}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div style={{ position: 'sticky', bottom: 0, padding: '12px 16px 20px', background: 'var(--paper)', borderTop: '1px dashed var(--line-soft)' }}>
      <div className="screen-small" style={{ marginBottom: 8 }}>3 selected</div>
      <button className="phone-btn primary full">Continue</button>
    </div>
  </SketchyPhone>
);

const HomeDashboardA = () => (
  <SketchyPhone time="9:41" showTabbar activeTab="home">
    <div style={{ padding: '14px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>Hey Alex 👋</div>
        <div className="screen-h1" style={{ fontSize: 26, margin: 0 }}>You're owed</div>
      </div>
      <div style={{ position: 'relative' }}>
        <Icons.Bell />
        <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%', border: '1.2px solid var(--paper)' }} />
      </div>
    </div>

    {/* Balance hero */}
    <div style={{ padding: '6px 18px 0' }}>
      <div style={{ fontFamily: 'Caveat', fontSize: 52, fontWeight: 700, color: 'var(--success)', lineHeight: 1, marginTop: 4 }}>+₹1,248<span style={{ fontSize: 28, color: 'var(--ink-mute)' }}>.50</span></div>
      <div style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: 12, color: 'var(--ink-mute)' }}>
        <span>↑ you're owed ₹2,100</span>
        <span>·</span>
        <span>you owe ₹851</span>
      </div>
    </div>

    {/* Quick actions */}
    <div style={{ padding: '14px 18px 0', display: 'flex', gap: 8 }}>
      <div className="sk-border" style={{ flex: 1, padding: '10px 8px', textAlign: 'center', background: 'var(--accent-soft)' }}>
        <Icons.Camera /><div style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>Snap receipt</div>
      </div>
      <div className="sk-border" style={{ flex: 1, padding: '10px 8px', textAlign: 'center', background: 'var(--accent-2-soft)' }}>
        <Icons.Mic /><div style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>Say it</div>
      </div>
      <div className="sk-border" style={{ flex: 1, padding: '10px 8px', textAlign: 'center', background: 'var(--success-soft)' }}>
        <Icons.Money /><div style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>Settle up</div>
      </div>
    </div>

    {/* Pending from UPI */}
    <div style={{ padding: '16px 18px 0' }}>
      <div className="sk-border" style={{ padding: 12, background: 'var(--paper-card)', borderColor: 'var(--accent)', borderStyle: 'dashed' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700, color: 'var(--accent)' }}>
          <Icons.Bolt /> caught a payment · split it?
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, marginTop: 6 }}>₹840 to <u>Blue Tokai Cafe</u></div>
        <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>via UPI · 18 min ago</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <button className="phone-btn primary" style={{ fontSize: 12, padding: '6px 12px' }}>Split with group</button>
          <button className="phone-btn" style={{ fontSize: 12, padding: '6px 12px' }}>Keep as mine</button>
        </div>
      </div>
    </div>

    {/* Groups */}
    <div style={{ padding: '18px 18px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div className="screen-h2">Your groups</div>
        <div style={{ fontSize: 11, color: 'var(--accent-2)' }}>see all →</div>
      </div>

      {[
        { n: 'Goa Trip 🏖', owe: '+₹420', d: '5 people · 12 items', c: 0, owed: true },
        { n: 'Apartment 🏠', owe: '−₹180', d: '3 people · groceries, rent', c: 1, owed: false },
        { n: 'Foodies', owe: '+₹55', d: 'Sam, Priya', c: 2, owed: true },
      ].map((g, i) => (
        <div key={i} className="row-item">
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: AVATAR_COLORS[g.c],
            border: '1.5px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Caveat', fontSize: 18, fontWeight: 700,
          }}>{g.n[0]}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{g.n}</div>
            <div className="screen-small">{g.d}</div>
          </div>
          <div className={`amount ${g.owed ? 'owed' : 'owe'}`}>{g.owe}</div>
        </div>
      ))}
    </div>
  </SketchyPhone>
);

const HomeDashboardB = () => (
  <SketchyPhone time="9:41" showTabbar activeTab="home">
    {/* Storyline dashboard — conversational cards */}
    <div style={{ padding: '14px 18px 0' }}>
      <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>Thursday, April 16</div>
      <div className="screen-h1" style={{ fontSize: 30, marginTop: 2 }}>Morning, Alex.</div>
      <Scribble width={90} />
    </div>

    {/* Top: net balance as a sentence */}
    <div style={{ padding: '14px 18px 0' }}>
      <div className="sk-border" style={{ padding: '14px 14px', background: 'var(--success-soft)' }}>
        <div style={{ fontFamily: 'Kalam', fontSize: 15, lineHeight: 1.4 }}>
          You'll come out <b style={{ color: 'var(--success)', fontSize: 22 }}>+₹1,248</b> ahead<br/>
          once everyone settles up.
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button className="phone-btn" style={{ fontSize: 12, padding: '6px 12px' }}>Send nudges</button>
          <button className="phone-btn" style={{ fontSize: 12, padding: '6px 12px' }}>See who owes</button>
        </div>
      </div>
    </div>

    {/* Timeline of recent activity */}
    <div style={{ padding: '18px 18px 6px' }}>
      <div className="screen-h2">Today so far</div>
    </div>
    <div style={{ padding: '0 18px', position: 'relative' }}>
      <div style={{ position: 'absolute', left: 27, top: 0, bottom: 0, width: 2, background: 'repeating-linear-gradient(to bottom, var(--line-soft) 0 4px, transparent 4px 8px)' }} />
      {[
        { t: '9:12 AM', icon: <Icons.Bolt />, bg: 'var(--accent-soft)', title: 'UPI caught ₹840 · Blue Tokai', body: 'Tap to split with Priya, Sam', action: 'split' },
        { t: '8:40 AM', icon: <Icons.Receipt />, bg: 'var(--accent-2-soft)', title: 'Screenshot → 4-way split', body: 'Grocery run · ₹2,340 · everyone notified', action: 'done' },
        { t: 'Yesterday', icon: <Icons.Money />, bg: 'var(--success-soft)', title: 'Sam settled ₹620', body: 'via UPI. you\'re good!', action: 'done' },
      ].map((e, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: 14, position: 'relative' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: e.bg,
            border: '1.5px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, zIndex: 1,
          }}>{e.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{e.title}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-mute)', whiteSpace: 'nowrap' }}>{e.t}</div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>{e.body}</div>
            {e.action === 'split' && (
              <div style={{ marginTop: 6 }}>
                <button className="phone-btn primary" style={{ fontSize: 11, padding: '4px 10px' }}>Split now →</button>
              </div>
            )}
            {e.action === 'done' && (
              <div className="sk-chip success" style={{ marginTop: 6, fontSize: 10 }}><Icons.Check /> done</div>
            )}
          </div>
        </div>
      ))}
    </div>
  </SketchyPhone>
);

Object.assign(window, { OnboardWelcome, OnboardGroupSetup, HomeDashboardA, HomeDashboardB });
