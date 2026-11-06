import { useEffect, useState } from 'react'
import AuthorLogin from './pages/AuthorLogin'
import { fetchPosts } from './api/posts'
import Footer from './components/layout/Footer'
import Header from './components/layout/Header'
import TeaserManager from './components/teasers/TeaserManager'
import type { Post } from './data/posts'
import HomePage from './pages/HomePage'
import PostPage from './pages/posts/PostPage'

const categories = ['kuchnia', 'filmy', 'książka', 'technologia', 'sport', 'dlaczego?', 'inne']

function getPostFromHash(posts: Post[]) {
  const match = window.location.hash.match(/^#post-(\d+)$/)
  if (!match) return undefined
  return posts.find((post) => post.id === Number(match[1]))
}

function BlogApp() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [post, setPost] = useState<Post>()
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(() => window.location.hash === '#polecane')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

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
    const handleHashChange = () => {
      setPost(getPostFromHash(posts))
      if (window.location.hash === '#polecane') setShowFeaturedOnly(true)
      if (window.location.hash === '#najnowsze') setShowFeaturedOnly(false)
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [posts])

  const handleShowRecommended = () => {
    setShowFeaturedOnly(true)
    setSelectedCategories([])
    if (window.location.hash !== '#polecane') window.location.hash = 'polecane'
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((currentCategories) => currentCategories.includes(category) ? [] : [category])
    setShowFeaturedOnly(false)
    if (window.location.hash !== '#najnowsze') window.location.hash = 'najnowsze'
  }

  const handleCategoryChangeFromPost = (category: string) => {
    handleCategoryChange(category)
    setPost(undefined)
  }

  const handleShowAllPosts = () => {
    setShowFeaturedOnly(false)
    if (window.location.hash !== '#najnowsze') window.location.hash = 'najnowsze'
  }

  const handleRandomPost = () => {
    const availablePosts = posts.filter((candidate) => candidate.id !== post?.id)
    const randomPost = availablePosts[Math.floor(Math.random() * availablePosts.length)]
    if (!randomPost) return

    setPost(randomPost)
    window.location.hash = `post-${randomPost.id}`
  }

  if (isLoading) return <div className="app-state">Ładowanie wpisów...</div>
  if (error) return <div className="app-state app-state-error">{error}</div>

  return (
    <div className="app-shell">
      <Header onSearchFocus={() => document.getElementById('post-search')?.focus()} />
      {post
        ? <PostPage post={post} posts={posts} categories={categories} selectedCategories={selectedCategories} onCategoryChange={handleCategoryChangeFromPost} onRandomPost={handleRandomPost} onShowRecommended={handleShowRecommended} showFeaturedOnly={showFeaturedOnly} />
        : <HomePage posts={posts} categories={categories} selectedCategories={selectedCategories} onCategoryChange={handleCategoryChange} onRandomPost={handleRandomPost} onShowRecommended={handleShowRecommended} onShowAllPosts={handleShowAllPosts} showFeaturedOnly={showFeaturedOnly} />}
      <Footer />
      <TeaserManager />
    </div>
  )
}

function App() {
  if (window.location.pathname === '/autorka' || window.location.pathname.startsWith('/autorka/')) {
    return <AuthorLogin />
  }

  return <BlogApp />
}

export default App
