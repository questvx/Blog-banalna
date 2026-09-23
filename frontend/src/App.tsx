import { useEffect, useState } from 'react'
import { fetchPosts } from './api/posts'
import Footer from './components/Footer'
import Header from './components/Header'
import TeaserManager from './components/teasers/TeaserManager'
import type { Post } from './data/posts'
import HomePage from './pages/HomePage'
import PostPage from './pages/posts/PostPage'

function getPostFromHash(posts: Post[]) {
  const match = window.location.hash.match(/^#post-(\d+)$/)
  if (!match) return undefined
  return posts.find((post) => post.id === Number(match[1]))
}

function App() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [post, setPost] = useState<Post>()

  useEffect(() => {
    fetchPosts()
      .then((loadedPosts) => {
        setPosts(loadedPosts)
        setPost(getPostFromHash(loadedPosts))
      })
      .catch((fetchError: unknown) => {
        setError(fetchError instanceof Error ? fetchError.message : 'Nie udało się pobrać wpisów.')
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    const handleHashChange = () => setPost(getPostFromHash(posts))
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [posts])

  if (isLoading) return <div className="app-state">Ładowanie wpisów...</div>
  if (error) return <div className="app-state app-state-error">{error}</div>

  return (
    <div className="app-shell">
      <Header onSearchFocus={() => document.getElementById('post-search')?.focus()} />
      {post ? <PostPage post={post} /> : <HomePage posts={posts} />}
      <Footer />
      <TeaserManager />
    </div>
  )
}

export default App
