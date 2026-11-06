import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Hero from '../components/layout/Hero'
import PostCard from '../components/posts/PostCard'
import Sidebar from '../components/sidebar/Sidebar'
import type { Post } from '../data/posts'
import './HomePage.css'

type HomePageProps = {
  posts: Post[]
  categories: string[]
  selectedCategories: string[]
  onCategoryChange: (category: string) => void
  onRandomPost: () => void
  onShowRecommended: () => void
  onShowAllPosts: () => void
  showFeaturedOnly: boolean
}

function HomePage({ posts, categories, selectedCategories, onCategoryChange, onRandomPost, onShowRecommended, onShowAllPosts, showFeaturedOnly }: HomePageProps) {
  const [searchValue, setSearchValue] = useState('')
  const [visibleCount, setVisibleCount] = useState(4)
  const searchRef = useRef<HTMLInputElement>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = `${post.title} ${post.excerpt} ${post.category}`.toLowerCase().includes(searchValue.toLowerCase())
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(post.category)
    return matchesSearch && matchesCategory && (!showFeaturedOnly || post.featured)
  }).sort((postA, postB) => showFeaturedOnly ? postB.date.localeCompare(postA.date) : 0)
  const visiblePosts = filteredPosts.slice(0, visibleCount)

  const handleShowRecommended = () => {
    setSearchValue('')
    setVisibleCount(4)
    onShowRecommended()
  }

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [selectedCategories, showFeaturedOnly])

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    setVisibleCount(4)
  }

  const handleCategoryChange = (category: string) => {
    onCategoryChange(category)
    setVisibleCount(4)
  }

  useEffect(() => {
    const sentinel = loadMoreRef.current
    if (!sentinel || visibleCount >= filteredPosts.length) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisibleCount((count) => Math.min(count + 2, filteredPosts.length))
    }, { rootMargin: '240px' })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [filteredPosts.length, visibleCount])

  const loadMore = () => setVisibleCount((count) => Math.min(count + 2, filteredPosts.length))

  return (
    <div className="site-shell">
      <main>
        <Hero />
        <div className="content-layout">
          <section className="posts-column" id={showFeaturedOnly ? 'polecane' : 'najnowsze'}>
            {showFeaturedOnly && (
              <div className="featured-posts-heading">
                <h2>Polecane wpisy</h2>
                <button type="button" onClick={onShowAllPosts}>Pokaż wszystkie wpisy</button>
              </div>
            )}
            <div className="section-heading"><p className="eyebrow">z ostatnich dni</p><h2>{showFeaturedOnly ? 'Polecane wpisy' : 'Najnowsze wpisy'}</h2><span className="heading-line" /></div>
            {visiblePosts.length > 0 ? <div className="posts-grid">
              <div className="post-column">{visiblePosts.filter((_, index) => index % 2 === 0).map((post, index) => <PostCard key={post.id} post={post} gradientIndex={index * 2} featured={index === 0} />)}</div>
              <div className="post-column">{visiblePosts.filter((_, index) => index % 2 !== 0).map((post, index) => <PostCard key={post.id} post={post} gradientIndex={index * 2 + 1} />)}</div>
            </div> : <p className="empty-state">Nie znalazłam niczego pod tą frazą. Spróbuj inaczej.</p>}
            {visibleCount < filteredPosts.length && visiblePosts.length > 0 && <><div className="load-more-sentinel" ref={loadMoreRef} /><button className="load-more" type="button" onClick={loadMore}>pokaż starsze wpisy <span aria-hidden="true">↓</span></button></>}
          </section>
          <Sidebar
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            searchRef={searchRef}
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoryChange={handleCategoryChange}
            onRandomPost={onRandomPost}
            onShowRecommended={handleShowRecommended}
            posts={posts}
          />
        </div>
      </main>
    </div>
  )
}

export default HomePage