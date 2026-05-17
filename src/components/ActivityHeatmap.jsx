import { useMemo } from 'react'

const COLORS = ['#1a1a1f', '#3C3489', '#534AB7', '#7F77DD', '#AFA9EC']

export default function ActivityHeatmap({ posts, comments }) {
  const { cells, maxCount, totalDays } = useMemo(() => {
    const WEEKS = 52
    const now = Date.now() / 1000
    const start = now - WEEKS * 7 * 86400
    const counts = {}

    ;[...posts, ...comments].forEach(x => {
      if (x.created_utc && x.created_utc > start) {
        const d = new Date(x.created_utc * 1000)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        counts[key] = (counts[key] || 0) + 1
      }
    })

    const maxCount = Math.max(1, ...Object.values(counts))
    const startDate = new Date(start * 1000)
    startDate.setHours(0, 0, 0, 0)

    const cells = []
    for (let w = 0; w < WEEKS; w++) {
      const week = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(startDate.getTime() + (w * 7 + d) * 86400000)
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        const cnt = counts[key] || 0
        const ci = cnt === 0 ? 0 : Math.min(4, Math.ceil(cnt / maxCount * 4))
        week.push({ key, cnt, ci, date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) })
      }
      cells.push(week)
    }

    return { cells, maxCount, totalDays: Object.values(counts).filter(v => v > 0).length }
  }, [posts, comments])

  return (
    <div className="card fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Activity heatmap — last 52 weeks
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {totalDays} active days
        </span>
      </div>

      <div style={{ display: 'flex', gap: 2, overflowX: 'auto', paddingBottom: 4 }}>
        {cells.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {week.map(({ key, cnt, ci, date }) => (
              <div
                key={key}
                title={`${date}: ${cnt} action${cnt !== 1 ? 's' : ''}`}
                style={{
                  width: 10, height: 10,
                  borderRadius: 2,
                  background: COLORS[ci],
                  border: cnt > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  cursor: cnt > 0 ? 'default' : 'default',
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Less</span>
        {COLORS.map((c, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c, border: '1px solid rgba(255,255,255,0.06)' }} />
        ))}
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>More</span>
      </div>
    </div>
  )
}
