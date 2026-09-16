import { useEffect, useState } from 'react'
import Footer from './components/Footer'
import Header from './components/Header'
import TeaserManager from './components/teasers/TeaserManager'
import { posts } from './data/posts'
import HomePage from './pages/HomePage'
import PostPage from './pages/posts/PostPage'

function getPostFromHash() {
  const match = window.location.hash.match(/^#post-(\d+)$/)
  if (!match) return undefined
  return posts.find((post) => post.id === Number(match[1]))
}

function App() {
  const [post, setPost] = useState(getPostFromHash)

  useEffect(() => {
    const handleHashChange = () => setPost(getPostFromHash())
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <div className="app-shell">
      <Header onSearchFocus={() => document.getElementById('post-search')?.focus()} />
      {post ? <PostPage post={post} /> : <HomePage />}
      <Footer />
      <TeaserManager />
    </div>
  )
}

export default App
