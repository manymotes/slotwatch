'use client'

// The product's promise as a visual: two months, a scan line that keeps sweeping (we check every
// 5 minutes), and the appointment jumping from Dec 15 to Nov 10 when an earlier day opens.
// Pure CSS animation on a 10s loop; reduced-motion shows the found state at rest.

const MONTHS: { label: string; year: number; month: number }[] = [
  { label: 'November', year: 2026, month: 10 },
  { label: 'December', year: 2026, month: 11 },
]
const APPT = { month: 11, day: 15 }   // the owner's booked date
const FOUND = { month: 10, day: 10 }  // the earlier opening we caught
const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function cells(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1).getDay()
  const days = new Date(year, month + 1, 0).getDate()
  const out: (number | null)[] = Array(first).fill(null)
  for (let d = 1; d <= days; d++) out.push(d)
  while (out.length % 7) out.push(null)
  return out
}

const CSS = `
.hc-wrap{position:relative;max-width:760px;margin:56px auto 0}
.hc{position:relative;padding:28px 28px 30px;background:var(--surface);border-radius:12px;overflow:hidden}
.hc-months{display:grid;grid-template-columns:1fr 1fr;gap:28px}
@media(max-width:560px){.hc{padding:20px 16px 22px}.hc-months{grid-template-columns:1fr;gap:20px}.hc-m2{display:none}}
.hc-title{font-size:13px;font-weight:500;color:var(--ink);margin:0 0 10px;display:flex;justify-content:space-between}
.hc-title span{color:var(--muted);font-weight:400}
.hc-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.hc-dow{font-size:10px;color:var(--muted);text-align:center;padding-bottom:4px}
.hc-d{aspect-ratio:1;display:grid;place-items:center;font-size:12px;color:var(--ink-2);border-radius:6px;background:transparent;position:relative}
.hc-d.e{background:transparent}
.hc-d.p{color:var(--line-strong)}
.hc-appt{box-shadow:inset 0 0 0 1.5px var(--ink);font-weight:500;color:var(--ink);animation:hc-appt 10s infinite}
.hc-found{animation:hc-found 10s infinite;font-weight:500}
.hc-found::after{content:"";position:absolute;inset:-4px;border-radius:9px;border:1.5px solid var(--accent);opacity:0;animation:hc-ring 10s infinite}
.hc-scan{position:absolute;left:28px;right:28px;top:60px;height:2px;background:linear-gradient(90deg,transparent,var(--accent),transparent);opacity:.9;animation:hc-scan 2.5s linear infinite}
.hc-toast{position:absolute;left:50%;top:-44px;transform:translate(-50%,8px);background:var(--ink);color:#fff;font-size:12.5px;font-weight:500;padding:9px 14px;border-radius:6px;white-space:nowrap;opacity:0;animation:hc-toast 10s infinite;display:flex;gap:8px;align-items:center}
.hc-toast i{width:7px;height:7px;border-radius:50%;background:var(--accent);display:inline-block}
.hc-leg{display:flex;gap:18px;justify-content:center;margin-top:16px;font-size:12px;color:var(--muted)}
.hc-leg b{display:inline-block;width:10px;height:10px;border-radius:3px;vertical-align:-1px;margin-right:6px}
@keyframes hc-scan{0%{top:60px}100%{top:calc(100% - 60px)}}
@keyframes hc-found{0%,38%{background:transparent;color:var(--ink-2)}42%,100%{background:var(--accent);color:#fff}}
@keyframes hc-ring{0%,40%{opacity:0;transform:scale(.9)}44%{opacity:1;transform:scale(1)}60%{opacity:0;transform:scale(1.35)}100%{opacity:0}}
@keyframes hc-appt{0%,40%{box-shadow:inset 0 0 0 1.5px var(--ink);color:var(--ink)}48%,100%{box-shadow:inset 0 0 0 1.5px var(--line-strong);color:var(--muted);text-decoration:line-through}}
@keyframes hc-toast{0%,44%{opacity:0;transform:translate(-50%,8px)}50%,92%{opacity:1;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,8px)}}
@media(prefers-reduced-motion:reduce){.hc-scan{display:none}.hc-found{background:var(--accent);color:#fff;animation:none}.hc-found::after{display:none}.hc-appt{animation:none;box-shadow:inset 0 0 0 1.5px var(--line-strong);color:var(--muted);text-decoration:line-through}.hc-toast{animation:none;opacity:1;transform:translate(-50%,0)}}
`

export default function HeroCalendar() {
  return (
    <div className="hc-wrap">
      <style>{CSS}</style>
      <div className="hc-toast" aria-hidden="true"><i /> Earlier slot found · Nov 10, 7:00 AM · email sent</div>
    <div className="hc" aria-label="Animation: SlotWatch scanning two months and finding a November 10 opening, five weeks before a December 15 appointment">
      <div className="hc-months">
        {MONTHS.map((m, i) => (
          <div key={m.label} className={i === 1 ? 'hc-m2' : undefined}>
            <p className="hc-title">{m.label} <span>{m.year}</span></p>
            <div className="hc-grid">
              {DOW.map((d, j) => <div key={j} className="hc-dow">{d}</div>)}
              {cells(m.year, m.month).map((d, j) => {
                if (d == null) return <div key={j} className="hc-d e" />
                const past = m.month === 10 && d < 8
                const isAppt = m.month === APPT.month && d === APPT.day
                const isFound = m.month === FOUND.month && d === FOUND.day
                return <div key={j} className={`hc-d${past ? ' p' : ''}${isAppt ? ' hc-appt' : ''}${isFound ? ' hc-found' : ''}`}>{d}</div>
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="hc-scan" aria-hidden="true" />
      <div className="hc-leg" aria-hidden="true">
        <span><b style={{ boxShadow: 'inset 0 0 0 1.5px var(--ink)' }} />Your appointment</span>
        <span><b style={{ background: 'var(--accent)' }} />Earlier opening we caught</span>
      </div>
    </div>
    </div>
  )
}
