const AS = 'https://arctic-shift.photon-reddit.com/api'
const PP = 'https://api.pullpush.io/reddit/search'
const RD = 'https://www.reddit.com'

async function safeFetch(url) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'RedditOSINT/2.0' } })
    if (!r.ok) return null
    return await r.json()
  } catch {
    return null
  }
}

// ── Arctic Shift ──────────────────────────────────────────────
export async function fetchAS_posts(user, after, before, subreddit, limit = 50) { // Added limit parameter
  let url = `${AS}/posts/search?author=${encodeURIComponent(user)}&limit=${limit}&sort=desc`
  if (after)  url += `&after=${after}`
  if (before) url += `&before=${before}`
  if (subreddit) url += `&subreddit=${encodeURIComponent(subreddit)}`
  const d = await safeFetch(url)
  return {
    data: (d?.data ?? []).map(p => ({ ...p, _src: 'AS' })),
    after: d?.after || null, // Assuming Arctic Shift returns 'after' at top level
  }
}

export async function fetchAS_comments(user, after, before, subreddit, limit = 50) { // Added limit parameter
  let url = `${AS}/comments/search?author=${encodeURIComponent(user)}&limit=${limit}&sort=desc`
  if (after)  url += `&after=${after}`
  if (before) url += `&before=${before}`
  if (subreddit) url += `&subreddit=${encodeURIComponent(subreddit)}`
  const d = await safeFetch(url)
  return {
    data: (d?.data ?? []).map(c => ({ ...c, _src: 'AS' })),
    after: d?.after || null, // Assuming Arctic Shift returns 'after' at top level
  }
}

// ── PullPush ──────────────────────────────────────────────────
export async function fetchPP_posts(user, after, before, subreddit, limit = 50) { // Added limit parameter
  let url = `${PP}/submission/?author=${encodeURIComponent(user)}&limit=${limit}&sort=desc`
  if (after)  url += `&after=${after}`
  if (before) url += `&before=${before}`
  if (subreddit) url += `&subreddit=${encodeURIComponent(subreddit)}`
  const d = await safeFetch(url)
  return {
    data: (d?.data ?? []).map(p => ({ ...p, _src: 'PP' })),
    after: d?.after || null, // Assuming PullPush returns 'after' at top level
  }
}

export async function fetchPP_comments(user, after, before, subreddit, limit = 50) { // Added limit parameter
  let url = `${PP}/comment/?author=${encodeURIComponent(user)}&limit=${limit}&sort=desc`
  if (after)  url += `&after=${after}`
  if (before) url += `&before=${before}`
  if (subreddit) url += `&subreddit=${encodeURIComponent(subreddit)}`
  const d = await safeFetch(url)
  return {
    data: (d?.data ?? []).map(c => ({ ...c, _src: 'PP' })),
    after: d?.after || null, // Assuming PullPush returns 'after' at top level
  }
}

// ── Reddit live API ───────────────────────────────────────────
export async function fetchRD_profile(user) {
  const d = await safeFetch(`${RD}/user/${encodeURIComponent(user)}/about.json`)
  return d?.data ?? null
}

export async function fetchRD_posts(user, after, limit = 25) { // Added after and limit parameters
  let url = `${RD}/user/${encodeURIComponent(user)}/submitted.json?limit=${limit}&raw_json=1`
  if (after) url += `&after=${after}`
  const d = await safeFetch(url)
  return {
    data: (d?.data?.children ?? []).map(c => ({ ...c.data, _src: 'RD' })),
    after: d?.data?.after || null,
  }
}

export async function fetchRD_comments(user, after, limit = 25) { // Added after and limit parameters
  let url = `${RD}/user/${encodeURIComponent(user)}/comments.json?limit=${limit}&raw_json=1`
  if (after) url += `&after=${after}`
  const d = await safeFetch(url)
  return {
    data: (d?.data?.children ?? []).map(c => ({ ...c.data, _src: 'RD' })),
    after: d?.data?.after || null,
  }
}

// ── Shadowban / suspension check ──────────────────────────────
export async function checkAccountStatus(user) {
  try {
    const r = await fetch(`${RD}/user/${encodeURIComponent(user)}/about.json`)
    if (r.status === 404) return 'shadowbanned'
    const d = await r.json()
    if (!d?.data) return 'shadowbanned'
    if (d.data.is_suspended) return 'suspended'
    return 'active'
  } catch {
    return 'unknown'
  }
}

// ── Deduplication ─────────────────────────────────────────────
export function dedupe(arr) {
  const seen = new Set()
  return arr.filter(x => {
    const k = x.id ?? x.name
    if (!k) return true
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}
