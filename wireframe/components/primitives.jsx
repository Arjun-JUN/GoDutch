// Primitive sketchy components for wireframes
// Shared building blocks: Phone, Avatar, Icons, etc.

const SketchyPhone = ({ children, showTabbar = false, activeTab = 'home', time = '9:41' }) => (
  <div className="sk-phone">
    <div className="sk-phone-screen">
      <div className="sk-phone-statusbar">
        <span>{time}</span>
        <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <Icons.Signal /> <Icons.Wifi /> <Icons.Battery />
        </span>
      </div>
      <div className="sk-phone-content">
        {children}
      </div>
      {showTabbar && <SketchyTabbar active={activeTab} />}
    </div>
    <div className="sk-phone-home" />
  </div>
);

const SketchyTabbar = ({ active = 'home' }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: <Icons.HomeT /> },
    { id: 'groups', label: 'Groups', icon: <Icons.GroupsT /> },
    { id: 'add', label: '', icon: <Icons.AddT />, special: true },
    { id: 'activity', label: 'Activity', icon: <Icons.ActivityT /> },
    { id: 'you', label: 'You', icon: <Icons.PersonT /> },
  ];
  return (
    <div className="sk-tabbar">
      {tabs.map(t => (
        <div key={t.id} className={`sk-tab ${active === t.id ? 'active' : ''}`} style={t.special ? { marginTop: -18 } : {}}>
          {t.special ? (
            <div style={{
              width: 46, height: 46, borderRadius: '50%',
              background: 'var(--accent)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1.8px solid var(--line)',
              boxShadow: '2px 2px 0 var(--line)',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
          ) : (
            <>
              {t.icon}
              <span>{t.label}</span>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

const Avatar = ({ initials, color = '#ffd9ce', size = 'md' }) => (
  <div
    className={`avatar ${size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : ''}`}
    style={{ background: color }}
  >
    {initials}
  </div>
);

const AvatarStack = ({ people = [] }) => (
  <div style={{ display: 'flex' }}>
    {people.map((p, i) => (
      <div key={i} style={{ marginLeft: i === 0 ? 0 : -8 }}>
        <Avatar initials={p.initials} color={p.color} size="sm" />
      </div>
    ))}
  </div>
);

const AVATAR_COLORS = ['#ffd9ce', '#d5e3fa', '#cdeadb', '#fef0b8', '#e8d6f5', '#ffd4d4'];

const Icons = {
  Signal: () => <svg width="14" height="10" viewBox="0 0 14 10"><rect x="0" y="7" width="2" height="3" fill="currentColor"/><rect x="3" y="5" width="2" height="5" fill="currentColor"/><rect x="6" y="3" width="2" height="7" fill="currentColor"/><rect x="9" y="1" width="2" height="9" fill="currentColor"/></svg>,
  Wifi: () => <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M1 4C3 2 11 2 13 4M3 6C4.5 4.5 9.5 4.5 11 6"/><circle cx="7" cy="8" r="1" fill="currentColor"/></svg>,
  Battery: () => <svg width="22" height="10" viewBox="0 0 22 10"><rect x="0.5" y="0.5" width="19" height="9" rx="2" fill="none" stroke="currentColor" strokeWidth="1"/><rect x="2" y="2" width="14" height="6" rx="1" fill="currentColor"/><rect x="20" y="3.5" width="1.5" height="3" fill="currentColor"/></svg>,
  HomeT: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M3 12l9-8 9 8v8a2 2 0 01-2 2h-4v-6h-6v6H5a2 2 0 01-2-2z"/></svg>,
  GroupsT: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5M15 20c0-2 2-3.5 4-3.5s3 1.5 3 3.5"/></svg>,
  AddT: () => <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg>,
  ActivityT: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l2-6 4 12 2-6h6"/></svg>,
  PersonT: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>,
  Camera: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M4 8h3l2-3h6l2 3h3a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z"/><circle cx="12" cy="13" r="4"/></svg>,
  Mic: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg>,
  Image: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M3 18l5-5 5 5 3-3 5 5"/></svg>,
  Bolt: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h7l-2 8 9-12h-7z"/></svg>,
  Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5 11-11"/></svg>,
  X: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M6 18L18 6"/></svg>,
  ChevRight: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>,
  ChevDown: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>,
  ArrowLeft: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>,
  Plus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  Bell: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M6 8a6 6 0 0112 0v5l2 3H4l2-3zM10 19a2 2 0 004 0"/></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/></svg>,
  Sparkle: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM19 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1z"/></svg>,
  Receipt: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M5 3v18l2-2 2 2 2-2 2 2 2-2 2 2 2-2V3z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>,
  Share: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6"/></svg>,
  Waveform: ({ active = false }) => (
    <svg width="120" height="40" viewBox="0 0 120 40">
      {[6, 14, 22, 30, 10, 26, 34, 18, 8, 20, 28, 12, 32, 16, 22, 10, 18, 26, 14, 8].map((h, i) => (
        <rect
          key={i}
          x={i * 6 + 2}
          y={20 - h / 2}
          width="3"
          height={h}
          rx="1.5"
          fill={active && i > 4 && i < 16 ? 'var(--accent)' : 'var(--ink)'}
          opacity={active ? (i % 3 === 0 ? 1 : 0.6) : 0.4}
        />
      ))}
    </svg>
  ),
  Phone: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M5 3h4l2 5-3 2a11 11 0 006 6l2-3 5 2v4a2 2 0 01-2 2A16 16 0 013 5a2 2 0 012-2z"/></svg>,
  Money: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M5 10v4M19 10v4"/></svg>,
  Chart: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 20h18M6 16v-6M11 16V8M16 16v-4M21 16V4"/></svg>,
};

// Scribble underline SVG
const Scribble = ({ color = 'var(--accent)', width = 80 }) => (
  <svg width={width} height="6" viewBox="0 0 80 6" style={{ display: 'block', marginTop: -2 }}>
    <path d="M1 3 Q 10 0, 20 3 T 40 3 T 60 3 T 79 3" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Arrow between flow steps
const FlowArrow = ({ label }) => (
  <div className="flow-arrow" style={{ position: 'relative' }}>
    <svg width="52" height="36" viewBox="0 0 52 36" fill="none">
      <path d="M2 18 Q 26 6, 46 18" stroke="var(--ink-mute)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeDasharray="4 4"/>
      <path d="M40 12 L 48 18 L 40 24" stroke="var(--ink-mute)" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    {label && <div style={{ position: 'absolute', top: 36, fontFamily: 'Caveat', fontSize: 15, color: 'var(--ink-mute)', whiteSpace: 'nowrap' }}>{label}</div>}
  </div>
);

// Notification banner (drop-from-top style)
const Notification = ({ app = 'UPI App', title, body, time = 'now', accent = false }) => (
  <div style={{
    margin: '40px 12px 0',
    background: 'rgba(255,255,255,0.95)',
    border: '1.5px solid var(--line)',
    borderRadius: 16,
    padding: '10px 12px',
    boxShadow: '2px 3px 0 rgba(0,0,0,0.08)',
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
  }}>
    <div style={{
      width: 34, height: 34, borderRadius: 8,
      background: accent ? 'var(--accent)' : 'var(--ink)',
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Caveat', fontWeight: 700, fontSize: 16, flexShrink: 0,
    }}>₲D</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6, alignItems: 'baseline' }}>
        <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--ink-mute)', fontWeight: 700 }}>{app}</span>
        <span style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{time}</span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.35 }}>{body}</div>
    </div>
  </div>
);

Object.assign(window, {
  SketchyPhone, SketchyTabbar, Avatar, AvatarStack, AVATAR_COLORS,
  Icons, Scribble, FlowArrow, Notification,
});
