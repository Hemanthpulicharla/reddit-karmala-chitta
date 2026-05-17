export function fmtN(n) {
  if (n == null) return '—'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'k'
  return String(n)
}

export function fmtDate(ts) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function fmtTime(ts) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  })
}

export function fmtAge(ts) {
  if (!ts) return '—'
  const days = Math.floor((Date.now() / 1000 - ts) / 86400)
  if (days > 365) return `${Math.floor(days / 365)}y ${Math.floor((days % 365) / 30)}mo`
  if (days > 30)  return `${Math.floor(days / 30)}mo`
  return `${days}d`
}

export function ago(ts) {
  if (!ts) return ''
  const days = Math.floor((Date.now() / 1000 - ts) / 86400)
  if (days > 365) return `${Math.floor(days / 365)}y ago`
  if (days > 30)  return `${Math.floor(days / 30)}mo ago`
  if (days > 1)   return `${days}d ago`
  return 'today'
}

export function tsFromDate(dateStr) {
  return dateStr ? Math.floor(new Date(dateStr).getTime() / 1000) : null
}
