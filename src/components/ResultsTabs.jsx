import { useState } from 'react'
import { fmtN, ago, fmtDate } from '../utils/format.js'

const SRC_COLORS = { AS: '#7F77DD', PP: '#1D9E75', RD: '#FF4500' }
const TRUNCATE_LENGTH = 300; // Characters before truncating

function SrcDot({ src }) {
  return <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: SRC_COLORS[src] || '#888', marginRight: 5, verticalAlign: 2, flexShrink: 0 }} title={src} />
}

function PostItem({ p }) {
  const [showFullContent, setShowFullContent] = useState(false);
  const postBody = p.selftext || p.body || ''; // Use selftext or body for posts
  const isLongPost = postBody.length > TRUNCATE_LENGTH;
  const displayedBody = showFullContent ? postBody : postBody.slice(0, TRUNCATE_LENGTH);

  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginBottom: 4 }}>
        <SrcDot src={p._src} />
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>
          {(p.title || 'untitled').slice(0, 150)}
        </span>
      </div>
      {postBody && (
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 4, paddingLeft: 11 }}>
          <p>{displayedBody}</p>
          {isLongPost && (
            <button
              onClick={() => setShowFullContent(!showFullContent)}
              style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', fontSize: 11, padding: '0', marginTop: 4 }}
            >
              {showFullContent ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, paddingLeft: 11, marginTop: 4 }}>
        <span className="badge badge-brand" style={{ fontSize: 10 }}>r/{p.subreddit}</span>
        <span className="badge badge-amber" style={{ fontSize: 10 }}>↑ {fmtN(p.score)}</span>
        <span className="badge badge-gray"  style={{ fontSize: 10 }}>{fmtN(p.num_comments)} cmts</span>
        {p.is_self === false && p.domain && <span className="badge badge-gray" style={{ fontSize: 10 }}>{p.domain}</span>}
        {p.removed_by_category && <span className="badge badge-red" style={{ fontSize: 10 }}>removed</span>}
        {(p.body === '[deleted]' || p.selftext === '[deleted]') && <span className="badge badge-red" style={{ fontSize: 10 }}>deleted</span>}
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 2 }}>{ago(p.created_utc)}</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 2 }}>({fmtDate(p.created_utc)})</span>
        <a href={`https://reddit.com${p.permalink || ''}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--brand)', textDecoration: 'none', marginLeft: 4 }}>View on Reddit</a>
      </div>
    </div>
  )
}

function CommentItem({ c }) {
  const [showFullContent, setShowFullContent] = useState(false);
  const commentBody = c.body || '[deleted]';
  const isDeleted = commentBody === '[deleted]' || commentBody === '[removed]';
  const isLongComment = commentBody.length > TRUNCATE_LENGTH && !isDeleted;
  const displayedBody = showFullContent || isDeleted ? commentBody : commentBody.slice(0, TRUNCATE_LENGTH);

  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginBottom: 4 }}>
        <SrcDot src={c._src} />
        <p style={{ fontSize: 13, color: isDeleted ? 'var(--text-muted)' : 'var(--text-primary)', lineHeight: 1.5, fontStyle: isDeleted ? 'italic' : 'normal' }}>
          {displayedBody}
          {isLongComment && (
            <button
              onClick={() => setShowFullContent(!showFullContent)}
              style={{ background: 'none', border: 'none', color: 'var(--brand)', cursor: 'pointer', fontSize: 11, padding: '0', marginLeft: 4 }}
            >
              {showFullContent ? 'Show less' : 'Read more'}
            </button>
          )}
        </p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, paddingLeft: 11 }}>
        <span className="badge badge-brand" style={{ fontSize: 10 }}>r/{c.subreddit}</span>
        <span className="badge badge-amber" style={{ fontSize: 10 }}>↑ {fmtN(c.score)}</span>
        {isDeleted && <span className="badge badge-red" style={{ fontSize: 10 }}>deleted</span>}
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 2 }}>{ago(c.created_utc)}</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 2 }}>({fmtDate(c.created_utc)})</span>
        <a href={`https://reddit.com${c.permalink || ''}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--brand)', textDecoration: 'none', marginLeft: 4 }}>View on Reddit</a>
      </div>
    </div>
  )
}

const TABS = ['posts', 'comments', 'raw']

export default function ResultsTabs({
  posts, comments, profile,
  loadMorePosts, loadMoreComments,
  hasMorePosts, hasMoreComments,
  loadingMorePosts, loadingMoreComments,
}) {
  const [active, setActive] = useState('posts')

  return (
    <div className="card fade-in">
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t} className={`ghost${active === t ? ' active' : ''}`} onClick={() => setActive(t)}>
            {t === 'posts'    && `Posts (${posts.length})`}
            {t === 'comments' && `Comments (${comments.length})`}
            {t === 'raw'      && 'Raw JSON'}
          </button>
        ))}
      </div>

      {active === 'posts' && (
        <>
          {posts.length === 0
            ? <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '8px 0' }}>No posts found in archives.</p>
            : posts.map((p, i) => <PostItem key={p.id || i} p={p} />)
          }
          {hasMorePosts && (
            <button
              className="ghost"
              style={{ marginTop: 10, width: '100%' }}
              onClick={loadMorePosts}
              disabled={loadingMorePosts}
            >
              {loadingMorePosts ? 'Loading more posts…' : 'Load more posts'}
            </button>
          )}
        </>
      )}

      {active === 'comments' && (
        <>
          {comments.length === 0
            ? <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '8px 0' }}>No comments found in archives.</p>
            : comments.map((c, i) => <CommentItem key={c.id || i} c={c} />)
          }
          {hasMoreComments && (
            <button
              className="ghost"
              style={{ marginTop: 10, width: '100%' }}
              onClick={loadMoreComments}
              disabled={loadingMoreComments}
            >
              {loadingMoreComments ? 'Loading more comments…' : 'Load more comments'}
            </button>
          )}
        </>
      )}

      {active === 'raw' && (
        <pre style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: 11, maxHeight: 400, overflowY: 'auto', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {JSON.stringify({ profile, posts: posts.slice(0, 20), comments: comments.slice(0, 20) }, null, 2)}
        </pre>
      )}
    </div>
  )
}
