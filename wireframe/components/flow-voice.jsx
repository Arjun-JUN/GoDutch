// FLOW 3: Voice Split (HERO)
// Variant A: Hold-to-talk with live transcript
// Variant B: Quick voice note → transcribe → confirm card

const VoiceListening = () => (
  <SketchyPhone time="9:41">
    <div style={{ height: '100%', background: 'linear-gradient(180deg, var(--paper) 0%, var(--accent-soft) 100%)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center' }}>
        <Icons.X />
        <div style={{ flex: 1, textAlign: 'center', fontSize: 12, color: 'var(--ink-mute)', fontFamily: 'Caveat', fontSize: 18 }}>just talk, I'll figure it out ✨</div>
        <div style={{ width: 18 }} />
      </div>

      {/* Live transcript bubble */}
      <div style={{ padding: '20px 24px', flex: 1 }}>
        <div style={{ fontFamily: 'Caveat', fontSize: 22, color: 'var(--ink-mute)', marginBottom: 6 }}>you're saying…</div>
        <div style={{ fontFamily: 'Kalam', fontSize: 22, lineHeight: 1.5, color: 'var(--ink)' }}>
          "Split dinner tonight, <b style={{ color: 'var(--accent)', background: 'var(--paper-card)', padding: '0 4px', borderRadius: 4 }}>₹2,400</b> between <b style={{ color: 'var(--accent-2)', background: 'var(--paper-card)', padding: '0 4px', borderRadius: 4 }}>me, Sam and Priya</b>, I paid…<span style={{ opacity: 0.4 }}> the tip was—</span>"
        </div>

        {/* Detected chips */}
        <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <div className="sk-chip accent"><Icons.Sparkle /> dinner · food</div>
          <div className="sk-chip accent">₹2,400</div>
          <div className="sk-chip blue">3 people</div>
          <div className="sk-chip success"><Icons.Check /> you paid</div>
        </div>
      </div>

      {/* Waveform + mic */}
      <div style={{ padding: '14px 0 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <Icons.Waveform active />
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '2px solid var(--accent)', opacity: 0.4 }} />
          <div style={{ position: 'absolute', inset: -16, borderRadius: '50%', border: '2px solid var(--accent)', opacity: 0.2 }} />
          <div style={{
            width: 82, height: 82, borderRadius: '50%', background: 'var(--accent)',
            border: '2.5px solid var(--line)', boxShadow: '3px 3px 0 var(--line)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          }}><svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><rect x="8" y="4" width="8" height="14" rx="4"/><path d="M5 13a7 7 0 0014 0M12 20v2" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round"/></svg></div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontFamily: 'Caveat', fontSize: 16 }}>release to stop · tap ✗ to cancel</div>
      </div>
    </div>
  </SketchyPhone>
);

const VoiceConfirm = () => (
  <SketchyPhone time="9:41">
    <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icons.ArrowLeft />
      <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>Does this look right?</div>
    </div>

    {/* Transcript card */}
    <div style={{ padding: '10px 16px 0' }}>
      <div className="sk-border" style={{ padding: 12, background: 'var(--paper-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700, color: 'var(--ink-mute)' }}>
          <Icons.Mic /> heard you say
        </div>
        <div style={{ fontFamily: 'Kalam', fontSize: 13, lineHeight: 1.5, color: 'var(--ink-soft)', marginTop: 4, fontStyle: 'italic' }}>
          "Split dinner tonight, 2,400 bucks between me, Sam and Priya. I paid."
        </div>
      </div>
    </div>

    {/* Parsed summary */}
    <div style={{ padding: '14px 16px 8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <div style={{ fontFamily: 'Caveat', fontSize: 28, fontWeight: 700 }}>Dinner 🍝</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>₹2,400</div>
      </div>
      <div className="screen-small">Tonight · Foodies group</div>
    </div>

    {/* Editable fields */}
    <div style={{ padding: '0 16px' }}>
      {[
        { l: 'when', v: 'Tonight, Apr 16' },
        { l: 'category', v: 'Food & drink' },
        { l: 'paid by', v: 'You' },
        { l: 'group', v: 'Foodies' },
      ].map((f, i) => (
        <div key={i} className="row-item" style={{ padding: '8px 0' }}>
          <div style={{ width: 70, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--ink-mute)', fontWeight: 700 }}>{f.l}</div>
          <div style={{ flex: 1, fontSize: 13.5, fontWeight: 700 }}>{f.v}</div>
          <Icons.ChevRight />
        </div>
      ))}
    </div>

    <div style={{ padding: '12px 16px 6px' }}>
      <div className="screen-label">split equally · 3 ways</div>
      <div style={{ marginTop: 6 }}>
        {[
          { n: 'You', role: 'paid', amt: '−₹1,600', a: 'owed', c: 0 },
          { n: 'Sam', role: 'owes you', amt: '+₹800', a: 'owed', c: 1 },
          { n: 'Priya', role: 'owes you', amt: '+₹800', a: 'owed', c: 2 },
        ].map((p, i) => (
          <div key={i} className="row-item" style={{ padding: '8px 0' }}>
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
      <button className="phone-btn"><Icons.Mic /></button>
      <button className="phone-btn primary" style={{ flex: 1 }}>Looks good · send</button>
    </div>
  </SketchyPhone>
);

const VoiceQuickNote = () => (
  <SketchyPhone time="9:41">
    <div style={{ padding: '14px 16px 0', fontSize: 13, color: 'var(--ink-mute)' }}>Home › Quick add</div>
    <div className="screen-body">
      <div className="screen-h1">How's this one?</div>

      {/* Voice note playback bubble */}
      <div className="sk-border" style={{ padding: 10, background: 'var(--accent-2-soft)', marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="7,4 20,12 7,20"/></svg>
        </div>
        <div style={{ flex: 1 }}>
          <Icons.Waveform />
          <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>0:07 · just now</div>
        </div>
      </div>

      {/* Auto-filled card */}
      <div className="sk-border" style={{ padding: 14, marginTop: 12, background: 'var(--paper-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="sk-chip accent"><Icons.Sparkle /> parsed</div>
          <div style={{ fontSize: 11, color: 'var(--accent-2)' }}>edit →</div>
        </div>
        <div style={{ fontFamily: 'Caveat', fontSize: 26, fontWeight: 700 }}>Uber to airport</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--ink)', marginTop: 2 }}>$28<span style={{ fontSize: 16, color: 'var(--ink-mute)' }}>.50</span></div>
        <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 2 }}>Split with Maya · equal</div>

        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          <div className="sk-chip">📅 today</div>
          <div className="sk-chip">🚗 transport</div>
          <div className="sk-chip">2 people</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button className="phone-btn" style={{ flex: 1 }}><Icons.X /> discard</button>
        <button className="phone-btn primary" style={{ flex: 2 }}><Icons.Check /> Confirm & send</button>
      </div>

      {/* Corrections hint */}
      <div style={{ marginTop: 14, padding: 10, background: 'var(--paper-tint)', borderRadius: 10, fontSize: 12, color: 'var(--ink-soft)', border: '1px dashed var(--line-soft)', fontFamily: 'Caveat', fontSize: 16 }}>
        <b>💡 Tip</b> — you can also just say "no, split 70/30" to fix it.
      </div>
    </div>
  </SketchyPhone>
);

Object.assign(window, { VoiceListening, VoiceConfirm, VoiceQuickNote });
