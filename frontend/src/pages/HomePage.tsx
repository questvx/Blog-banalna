import { useEffect, useRef, useState } from 'react'
import Hero from '../components/Hero'
import PostCard from '../components/PostCard'
import Sidebar from '../components/Sidebar'
import type { Post } from '../data/posts'
import './HomePage.css'

type HomePageProps = {
  posts: Post[]
  onRandomPost: () => void
}

const categories = ['kuchnia', 'filmy', 'książka', 'technologia', 'sport', 'dlaczego?', 'inne']

function HomePage({ posts, onRandomPost }: HomePageProps) {
  const [searchValue, setSearchValue] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [visibleCount, setVisibleCount] = useState(4)
  const searchRef = useRef<HTMLInputElement>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = `${post.title} ${post.excerpt} ${post.category}`.toLowerCase().includes(searchValue.toLowerCase())
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(post.category)
    return matchesSearch && matchesCategory
  })
  const visiblePosts = filteredPosts.slice(0, visibleCount)

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    setVisibleCount(4)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((currentCategories) => currentCategories.includes(category)
      ? currentCategories.filter((currentCategory) => currentCategory !== category)
      : [...currentCategories, category])
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
          <section className="posts-column" id="najnowsze">
            <div className="section-heading"><p className="eyebrow">z ostatnich dni</p><h2>Najnowsze wpisy</h2><span className="heading-line" /></div>
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
            posts={posts}
          />
        </div>
      </main>
    </div>
  )
}

export default HomePage