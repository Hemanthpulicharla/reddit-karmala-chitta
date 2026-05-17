import { fmtN, fmtDate, fmtAge } from '../utils/format.js'

const STATUS_MAP = {
  active:      { label: 'Active',       cls: 'badge-green' },
  suspended:   { label: 'Suspended',    cls: 'badge-red'   },
  shadowbanned:{ label: 'Shadowbanned', cls: 'badge-red'   },
  unknown:     { label: 'Unknown',      cls: 'badge-gray'  },
}

export default function ProfileCard({ profile: p, status, username, sourceCounts, posts, comments }) {
  const initials = username.slice(0, 2).toUpperCase()
  const avatarUrl = p?.icon_img ? p.icon_img.split('?')[0] : null
  const sb = STATUS_MAP[status] ?? STATUS_MAP.unknown

  const uniqueSubs = new Set([...posts, ...comments].map(x => x.subreddit).filter(Boolean)).size

  const metrics = [
    { label: 'Post karma',     val: fmtN(p?.link_karma) },
    { label: 'Comment karma',  val: fmtN(p?.comment_karma) },
    { label: 'Awarder karma',  val: fmtN(p?.awarder_karma) },
    { label: 'Total karma',    val: fmtN(p?.total_karma) },
    { label: 'Account age',    val: fmtAge(p?.created_utc) },
    { label: 'Created',        val: fmtDate(p?.created_utc) },
    { label: 'Archive posts',  val: posts.length },
    { label: 'Archive cmts',   val: comments.length },
    { label: 'Unique subs',    val: uniqueSubs },
    { label: 'Account ID',     val: p ? `t2_${p.id}` : '—' },
  ]

  return (
    <div className="card fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--brand-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--brand)', flexShrink: 0, overflow: 'hidden' }}>
          {avatarUrl
            ? <img src={avatarUrl} alt={username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} onError={e => { e.target.style.display = 'none'; e.target.parentElement.textContent = initials }} />
            : initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700 }}>u/{username}</span>
            <span className={`badge ${sb.cls}`}>{sb.label}</span>
            {p?.is_employee && <span className="badge badge-amber">Employee</span>}
            {p?.is_mod      && <span className="badge badge-brand">Moderator</span>}
            {p?.is_gold     && <span className="badge badge-amber">Gold</span>}
            {p?.verified    && <span className="badge badge-green">Verified</span>}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
            {p?.subreddit?.public_description?.slice(0, 120) || 'No bio set'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8, marginBottom: 12 }}>
        {metrics.map(({ label, val }) => (
          <div key={label} className="metric">
            <div className="metric-label">{label}</div>
            <div className="metric-val" style={{ fontSize: String(val).length > 6 ? 13 : 22, paddingTop: String(val).length > 6 ? 4 : 0 }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 4, fontFamily: 'var(--font-mono)' }}>sources:</span>
        {[['AS', '#7F77DD'], ['PP', '#1D9E75'], ['RD', '#FF4500']].map(([src, color]) => (
          <span key={src} className="badge badge-gray" style={{ fontFamily: 'var(--font-mono)' }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: color, marginRight: 4, verticalAlign: 1 }} />
            {src} {sourceCounts[src]?.posts ?? 0}p / {sourceCounts[src]?.comments ?? 0}c
          </span>
        ))}
      </div>
    </div>
  )
}
