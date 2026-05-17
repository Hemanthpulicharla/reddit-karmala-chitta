# Reddit Karmala Chitta

From Reddit Chitragupta 

An archive-powered Reddit user intelligence tool. It queries **Arctic Shift**, **PullPush**, and the **live Reddit API** in parallel — deduplicated, sorted, and visualized. This tool allows you to search for a user's activity, optionally filtered by subreddit, and view post and comment content directly within the application with "Load More" functionality for extensive results.


## Setup

```bash
git clone https://github.com/Hemanthpulicharla/reddit-karmala-chitta/
cd redditosint/redditosint # Navigate to the correct directory
npm install --legacy-peer-deps
npm run dev
```

Open http://localhost:5173

## Build for production

```bash
npm run build
npm run preview
```

Deploy the `dist/` folder to Vercel, Netlify, or any static host.

## How it works

No backend (for core functionality), no API keys needed. All queries run client-side:

```
Arctic Shift:  https://arctic-shift.photon-reddit.com/api/posts/search?author={user}&limit={limit}&subreddit={subreddit}
               https://arctic-shift.photon-reddit.com/api/comments/search?author={user}&limit={limit}&subreddit={subreddit}

PullPush:      https://api.pullpush.io/reddit/search/submission/?author={user}&limit={limit}&subreddit={subreddit}
               https://api.pullpush.io/reddit/search/comment/?author={user}&limit={limit}&subreddit={subreddit}

Reddit live:   https://www.reddit.com/user/{user}/about.json
               https://www.reddit.com/user/{user}/submitted.json?limit={limit}
               https://www.reddit.com/user/{user}/comments.json?limit={limit}
```
(Note: Reddit live API does not support subreddit filtering for user history; results are unfiltered for this source.)

Results are merged and deduplicated by post/comment ID. Pagination is implemented with "Load More" buttons.

## Tech stack

- React 18 + Vite 5
- Tailwind CSS v3
- date-fns
- JetBrains Mono + Syne + Inter (Google Fonts)

## Notes

- Archive data is historical — very recent posts may only appear in the Reddit live source.
- Arctic Shift and PullPush have no guaranteed uptime; if both are down, only live Reddit data is returned.
- Shadowban detection works by checking if Reddit returns a 404 or suspended flag on the user's about page.
## License

MIT
