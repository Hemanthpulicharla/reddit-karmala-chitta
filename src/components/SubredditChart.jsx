import { useMemo } from 'react'

export default function SubredditChart({ posts, comments }) {
  const topSubs = useMemo(() => {
    const counts = {}
    ;[...posts, ...comments].forEach(x => {
      const s = x.subreddit
      if (s) counts[s] = (counts[s] || 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 12)
  }, [posts, comments])

  if (!topSubs.length) return null
  const max = topSubs[0][1]

  return (
    <div className="card fade-in">
      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
        Top subreddits
      </div>
      {topSubs.map(([sub, cnt]) => (
        <div key={sub} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
            <a href={`https://reddit.com/r/${sub}`} target="_blank" rel="noreferrer"
              style={{ color: 'var(--brand)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: 12 }}
              onMouseEnter={e => e.target.style.textDecoration = 'underline'}
              onMouseLeave={e => e.target.style.textDecoration = 'none'}>
              r/{sub}
            </a>
            <span style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{cnt}</span>
          </div>
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 3, height: 6, overflow: 'hidden' }}>
            <div style={{ height: 6, width: `${Math.round(cnt / max * 100)}%`, background: 'var(--brand)', borderRadius: 3, transition: 'width 0.6s ease' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
