import { useMemo } from 'react'
import { useSearch } from './hooks/useSearch.js'
import SearchForm from './components/SearchForm.jsx'
import ProfileCard from './components/ProfileCard.jsx'
import ActivityHeatmap from './components/ActivityHeatmap.jsx'
import SubredditChart from './components/SubredditChart.jsx'
import ResultsTabs from './components/ResultsTabs.jsx'
import HourlyActivityChart from './components/HourlyActivityChart.jsx' // Import the new component
import { fmtN, ago } from './utils/format.js'

function TopPost({ posts }) {
  const top = useMemo(() => posts.slice().sort((a, b) => (b.score || 0) - (a.score || 0))[0], [posts])
  if (!top) return null
  return (
    <div className="card fade-in">
      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
        Top post by score
      </div>
      <a href={`https://reddit.com${top.permalink || ''}`} target="_blank" rel="noreferrer"
        style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none', display: 'block', marginBottom: 8, lineHeight: 1.4 }}
        onMouseEnter={e => e.target.style.color = 'var(--brand)'}
        onMouseLeave={e => e.target.style.color = 'var(--text-primary)'}>
        {(top.title || 'untitled').slice(0, 160)}
      </a>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span className="badge badge-brand">r/{top.subreddit}</span>
        <span className="badge badge-amber">↑ {fmtN(top.score)}</span>
        <span className="badge badge-gray">{fmtN(top.num_comments)} comments</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 2 }}>{ago(top.created_utc)}</span>
      </div>
    </div>
  )
}

export default function App() {
  const {
    search, loading, error, profile, posts, comments, status, sourceCounts, username,
    loadMorePosts, loadMoreComments,
    hasMorePosts, hasMoreComments,
    loadingMorePosts, loadingMoreComments,
  } = useSearch()

  const hasResults = posts.length > 0 || comments.length > 0 || profile

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1rem 4rem' }}>

        <header style={{ marginBottom: 28, textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
            Reddit Karmala Chitta
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            from Reddit Chitragupta (<a href="https://www.reddit.com/user/Friendly_wind" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 'bold', color: 'var(--brand)' }}>u/Friendly_wind</a>)
          </p>
        </header>

        <SearchForm onSearch={search} loading={loading} />

        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: 14 }}>
            <div className="pulse" style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>
              Querying all archive sources in parallel…
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(226,75,74,0.3)', borderRadius: 10, padding: '1rem', color: 'var(--red)', fontSize: 13, marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {!loading && hasResults && (
          <>
            <ProfileCard
              profile={profile}
              status={status}
              username={username}
              sourceCounts={sourceCounts}
              posts={posts}
              comments={comments}
            />
            <ActivityHeatmap posts={posts} comments={comments} />
            <HourlyActivityChart comments={comments} /> {/* Add the new component here */}
            <div style={{ display: 'grid', gridTemplateColumns: posts.length ? '1fr' : '1fr', gap: 0 }}>
              <TopPost posts={posts} />
            </div>
            <SubredditChart posts={posts} comments={comments} />
            <ResultsTabs
              posts={posts}
              comments={comments}
              profile={profile}
              loadMorePosts={loadMorePosts}
              loadMoreComments={loadMoreComments}
              hasMorePosts={hasMorePosts}
              hasMoreComments={hasMoreComments}
              loadingMorePosts={loadingMorePosts}
              loadingMoreComments={loadingMoreComments}
            />
          </>
        )}

        {!loading && !hasResults && !error && username && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: 14 }}>
            No data found for u/{username}. The account may be very new, shadowbanned before archival, or all content was deleted before being crawled.
          </div>
        )}

        <footer style={{ marginTop: 32, textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Data from Archive crawlers and REDDIT API — public archives only
        </footer>
      </div>
    </div>
  )
}
