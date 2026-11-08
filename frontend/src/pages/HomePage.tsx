import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Hero from '../components/layout/Hero'
import CuriosityCard from '../components/posts/CuriosityCard'
import PostCard from '../components/posts/PostCard'
import Sidebar from '../components/sidebar/Sidebar'
import type { Curiosity } from '../data/curiosities'
import type { Post } from '../data/posts'
import './HomePage.css'

type FeedEntry =
  | { type: 'POST'; post: Post }
  | { type: 'CURIOSITY'; curiosity: Curiosity }

type HomePageProps = {
  posts: Post[]
  curiosities: Curiosity[]
  categories: string[]
  selectedCategories: string[]
  onCategoryChange: (category: string) => void
  onRandomPost: () => void
  onShowRecommended: () => void
  onShowAllPosts: () => void
  showFeaturedOnly: boolean
}

function HomePage({ posts, curiosities, categories, selectedCategories, onCategoryChange, onRandomPost, onShowRecommended, onShowAllPosts, showFeaturedOnly }: HomePageProps) {
  const [searchValue, setSearchValue] = useState('')
  const [visibleCount, setVisibleCount] = useState(4)
  const searchRef = useRef<HTMLInputElement>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = `${post.title} ${post.excerpt} ${post.category}`.toLowerCase().includes(searchValue.toLowerCase())
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(post.category)
    return matchesSearch && matchesCategory && (!showFeaturedOnly || post.featured)
  })
  const filteredCuriosities = showFeaturedOnly ? [] : curiosities.filter((curiosity) => {
    const matchesSearch = `${curiosity.title} ${curiosity.content}`.toLowerCase().includes(searchValue.toLowerCase())
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes('ciekawostka')
    return matchesSearch && matchesCategory
  })
  const filteredItems: FeedEntry[] = [
    ...filteredPosts.map((post) => ({ type: 'POST' as const, post })),
    ...filteredCuriosities.map((curiosity) => ({ type: 'CURIOSITY' as const, curiosity })),
  ].sort((first, second) => {
    const firstDate = first.type === 'POST' ? first.post.date : first.curiosity.createdAt.slice(0, 10)
    const secondDate = second.type === 'POST' ? second.post.date : second.curiosity.createdAt.slice(0, 10)
    return secondDate.localeCompare(firstDate)
  })
  const visibleItems = filteredItems.slice(0, visibleCount)

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
    if (!sentinel || visibleCount >= filteredItems.length) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisibleCount((count) => Math.min(count + 2, filteredItems.length))
    }, { rootMargin: '240px' })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [filteredItems.length, visibleCount])

  const loadMore = () => setVisibleCount((count) => Math.min(count + 2, filteredItems.length))
  const renderFeedEntry = (entry: FeedEntry, gradientIndex: number, featured = false) => entry.type === 'CURIOSITY'
    ? <CuriosityCard key={`curiosity-${entry.curiosity.id}`} curiosity={entry.curiosity} />
    : <PostCard key={`post-${entry.post.id}`} post={entry.post} gradientIndex={gradientIndex} featured={featured} />

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
            {visibleItems.length > 0 ? <div className="posts-grid">
              <div className="post-column">{visibleItems.filter((_, index) => index % 2 === 0).map((entry, index) => renderFeedEntry(entry, index * 2, index === 0 && entry.type === 'POST'))}</div>
              <div className="post-column">{visibleItems.filter((_, index) => index % 2 !== 0).map((entry, index) => renderFeedEntry(entry, index * 2 + 1))}</div>
            </div> : <p className="empty-state">Nie znalazłam niczego pod tą frazą. Spróbuj inaczej.</p>}
            {visibleCount < filteredItems.length && visibleItems.length > 0 && <><div className="load-more-sentinel" ref={loadMoreRef} /><button className="load-more" type="button" onClick={loadMore}>pokaż starsze wpisy <span aria-hidden="true">↓</span></button></>}
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