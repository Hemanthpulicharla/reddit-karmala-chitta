import { useState, useCallback } from 'react'
import {
  fetchAS_posts, fetchAS_comments,
  fetchPP_posts, fetchPP_comments,
  fetchRD_profile, fetchRD_posts, fetchRD_comments,
  checkAccountStatus, dedupe,
} from '../utils/api.js'
import { tsFromDate } from '../utils/format.js'

const MAKER_USERNAME = 'Friendly_wind'; // Your Reddit username
const RESEARCH_ENDPOINT = '/api/log-search'; // <<< IMPORTANT: This will be your Vercel Function endpoint
const INITIAL_FETCH_LIMIT = 50; // Number of items to fetch initially per source
const LOAD_MORE_LIMIT = 50;     // Number of items to fetch on "load more" per source

export function useSearch() {
  const [state, setState] = useState({
    loading: false,
    error: null,
    profile: null,
    posts: [],
    comments: [],
    status: null,
    sourceCounts: {},
    username: '',
    // Pagination states
    postsAfter: { AS: null, PP: null, RD: null },
    commentsAfter: { AS: null, PP: null, RD: null },
    hasMorePosts: false,
    hasMoreComments: false,
    loadingMorePosts: false,
    loadingMoreComments: false,
    currentSearchCriteria: null, // Store criteria for loadMore calls
  })

  const search = useCallback(async ({ username, subreddit, dateFrom, dateTo, sources }) => {
    const user = username.trim().replace(/^u\//, '')
    if (!user) return

    // Blocker for the maker's account
    if (user.toLowerCase() === MAKER_USERNAME.toLowerCase()) {
      setState(s => ({
        ...s,
        loading: false,
        error: "It doesn't apply to the maker of the tool.. LOLL",
        profile: null,
        posts: [],
        comments: [],
        status: null,
        sourceCounts: {},
        username: user,
        postsAfter: { AS: null, PP: null, RD: null },
        commentsAfter: { AS: null, PP: null, RD: null },
        hasMorePosts: false,
        hasMoreComments: false,
        loadingMorePosts: false,
        loadingMoreComments: false,
        currentSearchCriteria: null,
      }));
      return;
    }

    setState(s => ({
      ...s,
      loading: true,
      error: null,
      posts: [],
      comments: [],
      profile: null,
      status: null,
      username: user,
      postsAfter: { AS: null, PP: null, RD: null },
      commentsAfter: { AS: null, PP: null, RD: null },
      hasMorePosts: false,
      hasMoreComments: false,
      loadingMorePosts: false,
      loadingMoreComments: false,
      currentSearchCriteria: { username, subreddit, dateFrom, dateTo, sources }, // Store current criteria
    }))

    const afterTs  = tsFromDate(dateFrom)
    const beforeTs = tsFromDate(dateTo)

    // --- Research Data Capture ---
    const searchData = {
      timestamp: new Date().toISOString(),
      username: user,
      subreddit: subreddit,
      dateFrom: dateFrom,
      dateTo: dateTo,
      sources: sources,
    };

    if (RESEARCH_ENDPOINT) {
      try {
        await fetch(RESEARCH_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(searchData),
        });
        console.log('Search data sent for research:', searchData);
      } catch (logError) {
        console.error('Failed to send search data for research:', logError);
      }
    }
    // --- End Research Data Capture ---

    try {
      const [
        asPostsRes, asCommentsRes,
        ppPostsRes, ppCommentsRes,
        rdProfile, rdPostsRes, rdCommentsRes,
        accountStatus
      ] = await Promise.all([
        sources.arcticShift ? fetchAS_posts(user, null, beforeTs, subreddit, INITIAL_FETCH_LIMIT)    : Promise.resolve({ data: [], after: null }),
        sources.arcticShift ? fetchAS_comments(user, null, beforeTs, subreddit, INITIAL_FETCH_LIMIT) : Promise.resolve({ data: [], after: null }),
        sources.pullPush    ? fetchPP_posts(user, null, beforeTs, subreddit, INITIAL_FETCH_LIMIT)    : Promise.resolve({ data: [], after: null }),
        sources.pullPush    ? fetchPP_comments(user, null, beforeTs, subreddit, INITIAL_FETCH_LIMIT) : Promise.resolve({ data: [], after: null }),
        sources.reddit      ? fetchRD_profile(user)                                                  : Promise.resolve(null),
        sources.reddit      ? fetchRD_posts(user, null, INITIAL_FETCH_LIMIT)                         : Promise.resolve({ data: [], after: null }),
        sources.reddit      ? fetchRD_comments(user, null, INITIAL_FETCH_LIMIT)                      : Promise.resolve({ data: [], after: null }),
        sources.reddit      ? checkAccountStatus(user)                                               : Promise.resolve('unknown'),
      ])

      const allRawPosts = [
        ...(asPostsRes.data || []),
        ...(ppPostsRes.data || []),
        ...(rdPostsRes.data || []),
      ]
      const allRawComments = [
        ...(asCommentsRes.data || []),
        ...(ppCommentsRes.data || []),
        ...(rdCommentsRes.data || []),
      ]

      const posts = dedupe(allRawPosts).sort((a, b) => (b.created_utc || 0) - (a.created_utc || 0))
      const comments = dedupe(allRawComments).sort((a, b) => (b.created_utc || 0) - (a.created_utc || 0))

      const newPostsAfter = {
        AS: asPostsRes.after,
        PP: ppPostsRes.after,
        RD: rdPostsRes.after,
      }
      const newCommentsAfter = {
        AS: asCommentsRes.after,
        PP: ppCommentsRes.after,
        RD: rdCommentsRes.after,
      }

      const hasMorePosts = Object.values(newPostsAfter).some(afterToken => afterToken !== null)
      const hasMoreComments = Object.values(newCommentsAfter).some(afterToken => afterToken !== null)

      const sourceCounts = {
        AS: { posts: asPostsRes.data.length, comments: asCommentsRes.data.length },
        PP: { posts: ppPostsRes.data.length, comments: ppCommentsRes.data.length },
        RD: { posts: rdPostsRes.data.length, comments: rdCommentsRes.data.length },
      }

      setState(s => ({
        ...s,
        loading: false,
        profile: rdProfile,
        posts,
        comments,
        status: accountStatus,
        sourceCounts,
        username: user,
        postsAfter: newPostsAfter,
        commentsAfter: newCommentsAfter,
        hasMorePosts,
        hasMoreComments,
      }))
    } catch (e) {
      setState(s => ({ ...s, loading: false, error: e.message || 'Unknown error' }))
    }
  }, [])

  const loadMore = useCallback(async (type) => {
    const { currentSearchCriteria, postsAfter, commentsAfter, posts, comments } = state
    if (!currentSearchCriteria) return

    const { username, subreddit, dateFrom, dateTo, sources } = currentSearchCriteria
    const user = username.trim().replace(/^u\//, '')
    const beforeTs = tsFromDate(dateTo)

    if (type === 'posts') {
      if (state.loadingMorePosts || !state.hasMorePosts) return
      setState(s => ({ ...s, loadingMorePosts: true }))

      const [
        asPostsRes,
        ppPostsRes,
        rdPostsRes,
      ] = await Promise.all([
        sources.arcticShift && postsAfter.AS ? fetchAS_posts(user, postsAfter.AS, beforeTs, subreddit, LOAD_MORE_LIMIT) : Promise.resolve({ data: [], after: null }),
        sources.pullPush    && postsAfter.PP ? fetchPP_posts(user, postsAfter.PP, beforeTs, subreddit, LOAD_MORE_LIMIT) : Promise.resolve({ data: [], after: null }),
        sources.reddit      && postsAfter.RD ? fetchRD_posts(user, postsAfter.RD, LOAD_MORE_LIMIT)                     : Promise.resolve({ data: [], after: null }),
      ])

      const newRawPosts = [
        ...(asPostsRes.data || []),
        ...(ppPostsRes.data || []),
        ...(rdPostsRes.data || []),
      ]

      const updatedPosts = dedupe([...posts, ...newRawPosts]).sort((a, b) => (b.created_utc || 0) - (a.created_utc || 0))

      const updatedPostsAfter = {
        AS: asPostsRes.after || postsAfter.AS, // Keep old token if no new one
        PP: ppPostsRes.after || postsAfter.PP,
        RD: rdPostsRes.after || postsAfter.RD,
      }
      const updatedHasMorePosts = Object.values(updatedPostsAfter).some(afterToken => afterToken !== null)

      setState(s => ({
        ...s,
        posts: updatedPosts,
        postsAfter: updatedPostsAfter,
        hasMorePosts: updatedHasMorePosts,
        loadingMorePosts: false,
      }))

    } else if (type === 'comments') {
      if (state.loadingMoreComments || !state.hasMoreComments) return
      setState(s => ({ ...s, loadingMoreComments: true }))

      const [
        asCommentsRes,
        ppCommentsRes,
        rdCommentsRes,
      ] = await Promise.all([
        sources.arcticShift && commentsAfter.AS ? fetchAS_comments(user, commentsAfter.AS, beforeTs, subreddit, LOAD_MORE_LIMIT) : Promise.resolve({ data: [], after: null }),
        sources.pullPush    && commentsAfter.PP ? fetchPP_comments(user, commentsAfter.PP, beforeTs, subreddit, LOAD_MORE_LIMIT) : Promise.resolve({ data: [], after: null }),
        sources.reddit      && commentsAfter.RD ? fetchRD_comments(user, commentsAfter.RD, LOAD_MORE_LIMIT)                     : Promise.resolve({ data: [], after: null }),
      ])

      const newRawComments = [
        ...(asCommentsRes.data || []),
        ...(ppCommentsRes.data || []),
        ...(rdCommentsRes.data || []),
      ]

      const updatedComments = dedupe([...comments, ...newRawComments]).sort((a, b) => (b.created_utc || 0) - (a.created_utc || 0))

      const updatedCommentsAfter = {
        AS: asCommentsRes.after || commentsAfter.AS,
        PP: ppCommentsRes.after || commentsAfter.PP,
        RD: rdCommentsRes.after || commentsAfter.RD,
      }
      const updatedHasMoreComments = Object.values(updatedCommentsAfter).some(afterToken => afterToken !== null)

      setState(s => ({
        ...s,
        comments: updatedComments,
        commentsAfter: updatedCommentsAfter,
        hasMoreComments: updatedHasMoreComments,
        loadingMoreComments: false,
      }))
    }
  }, [state]) // Depend on state to get latest postsAfter/commentsAfter

  return { ...state, search, loadMorePosts: () => loadMore('posts'), loadMoreComments: () => loadMore('comments') }
}
