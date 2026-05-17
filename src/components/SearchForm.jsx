import { useState } from 'react'

export default function SearchForm({ onSearch, loading }) {
  const [username, setUsername] = useState('')
  const [subreddit, setSubreddit] = useState('') // New state for subreddit
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo]     = useState('')
  const [sources, setSources]   = useState({
    arcticShift: true,
    pullPush:    true,
    reddit:      true,
  })

  function toggleSrc(key) {
    setSources(s => ({ ...s, [key]: !s[key] }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!username.trim()) return
    onSearch({ username, subreddit: subreddit.trim(), dateFrom, dateTo, sources }) // Pass subreddit
  }

  const srcConfig = [
    { key: 'arcticShift', label: 'Arctic Shift', color: '#7F77DD' },
    { key: 'pullPush',    label: 'PullPush',     color: '#1D9E75' },
    { key: 'reddit',      label: 'Reddit live',  color: '#FF4500' },
  ]

  return (
    <form onSubmit={handleSubmit} className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brand-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>
          Reddit Archive Intel
        </span>
      </div>

      <input
        type="text"
        placeholder="Reddit username (e.g. Friendly_wind, spez)"
        value={username}
        onChange={e => setUsername(e.target.value)}
        style={{ marginBottom: 12, border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: 14, background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s' }}
        onFocus={e => e.target.style.boxShadow = '0 0 0 2px var(--brand-dim)'}
        onBlur={e => e.target.style.boxShadow = 'none'}
        autoFocus
      />

      {/* New input for subreddit */}
      <input
        type="text"
        placeholder="Subreddit (optional, e.g. programming)"
        value={subreddit}
        onChange={e => setSubreddit(e.target.value)}
        style={{ marginBottom: 12, border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontSize: 14, background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s' }}
        onFocus={e => e.target.style.boxShadow = '0 0 0 2px var(--brand-dim)'}
        onBlur={e => e.target.style.boxShadow = 'none'}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ marginBottom: 0 }} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ marginBottom: 0 }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {srcConfig.map(({ key, label, color }) => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: sources[key] ? 'var(--text-primary)' : 'var(--text-muted)', transition: 'color 0.15s' }}>
            <input type="checkbox" checked={sources[key]} onChange={() => toggleSrc(key)} />
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block' }} />
            {label}
          </label>
        ))}
      </div>

      <button type="submit" className="primary" disabled={loading || !username.trim()}>
        {loading ? 'Searching archives…' : 'Search archives'}
      </button>
    </form>
  )
}
