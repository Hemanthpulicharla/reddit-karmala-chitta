import React, { useMemo } from 'react'

const BAR_COLORS = ['#1a1a1f', '#3C3489', '#534AB7', '#7F77DD', '#AFA9EC']

export default function HourlyActivityChart({ comments }) {
  const hourlyCounts = useMemo(() => {
    const counts = Array(24).fill(0) // 0-23 hours
    comments.forEach(c => {
      if (c.created_utc) {
        const date = new Date(c.created_utc * 1000)
        const hour = date.getHours()
        counts[hour]++
      }
    })
    return counts
  }, [comments])

  const maxCount = Math.max(...hourlyCounts)
  if (maxCount === 0) return null

  return (
    <div className="card fade-in">
      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
        Comment activity by hour (UTC)
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px 20px' }}>
        {hourlyCounts.map((count, hour) => {
          const height = (count / maxCount) * 100 // Percentage height
          const colorIndex = count === 0 ? 0 : Math.min(4, Math.ceil(count / maxCount * 4))
          return (
            <div key={hour} style={{ display: 'flex', alignItems: 'flex-end', height: 80, position: 'relative' }}>
              <div
                title={`${hour}:00-${hour}:59 UTC: ${count} comments`}
                style={{
                  width: '100%',
                  height: `${height}%`,
                  background: BAR_COLORS[colorIndex],
                  borderRadius: 4,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {count > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: -18,
                    fontSize: 10,
                    color: 'var(--text-muted)',
                    fontWeight: 500,
                  }}>
                    {count}
                  </span>
                )}
              </div>
              <span style={{ position: 'absolute', bottom: -18, fontSize: 10, color: 'var(--text-muted)', width: '100%', textAlign: 'center' }}>
                {String(hour).padStart(2, '0')}h
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
