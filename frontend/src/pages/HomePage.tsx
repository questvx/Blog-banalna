import { useEffect, useRef, useState } from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import PostCard from '../components/PostCard'
import Sidebar from '../components/Sidebar'
import { posts } from '../data/posts'
import './HomePage.css'

function HomePage() {
  const [searchValue, setSearchValue] = useState('')
  const [visibleCount, setVisibleCount] = useState(4)
  const searchRef = useRef<HTMLInputElement>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const visiblePosts = posts.filter((post) => `${post.title} ${post.excerpt} ${post.category}`.toLowerCase().includes(searchValue.toLowerCase())).slice(0, visibleCount)

  const loadMore = () => setVisibleCount((count) => Math.min(count + 2, posts.length))

  useEffect(() => {
    const sentinel = loadMoreRef.current
    if (!sentinel || visibleCount >= posts.length) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMore()
    }, { rootMargin: '240px' })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [visibleCount])

  return (
    <div className="site-shell">
      <Header onSearchFocus={() => searchRef.current?.focus()} />
      <main>
        <Hero />
        <div className="content-layout">
          <section className="posts-column" id="najnowsze">
            <div className="section-heading"><p className="eyebrow">z ostatnich dni</p><h2>Najnowsze wpisy</h2><span className="heading-line" /></div>
            {visiblePosts.length > 0 ? <div className="posts-grid">
              <div className="post-column">{visiblePosts.filter((_, index) => index % 2 === 0).map((post, index) => <PostCard key={post.id} post={post} gradientIndex={index * 2} featured={index === 0} />)}</div>
              <div className="post-column">{visiblePosts.filter((_, index) => index % 2 !== 0).map((post, index) => <PostCard key={post.id} post={post} gradientIndex={index * 2 + 1} />)}</div>
            </div> : <p className="empty-state">Nie znalazłam niczego pod tą frazą. Spróbuj inaczej.</p>}
            {visibleCount < posts.length && visiblePosts.length > 0 && <><div className="load-more-sentinel" ref={loadMoreRef} /><button className="load-more" type="button" onClick={loadMore}>pokaż starsze wpisy <span aria-hidden="true">↓</span></button></>}
          </section>
          <Sidebar searchValue={searchValue} onSearchChange={setSearchValue} searchRef={searchRef} />
        </div>
      </main>
      <footer><span>banalna i tyle...</span><span>© 2026 · robione powoli</span></footer>
    </div>
  )
}

export default HomePage