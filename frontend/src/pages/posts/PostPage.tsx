import { useLayoutEffect, useRef, useState } from 'react'
import Sidebar from '../../components/sidebar/Sidebar'
import SafePostContent from '../../components/posts/SafePostContent'
import type { Post } from '../../data/posts'
import './PostPage.css'

type PostPageProps = {
  post: Post
  posts: Post[]
  categories: string[]
  selectedCategories: string[]
  onCategoryChange: (category: string) => void
  onRandomPost: () => void
  onShowRecommended: () => void
  showFeaturedOnly: boolean
}

function PostPage({ post, posts, categories, selectedCategories, onCategoryChange, onRandomPost, onShowRecommended, showFeaturedOnly }: PostPageProps) {
  const [searchValue, setSearchValue] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [post.id])

  return (
    <div className="post-page-shell">
      <main className="post-page-layout">
        <article className="post-article">
          <a className="back-link" href={showFeaturedOnly ? '#polecane' : '#najnowsze'}>← Wróć do wpisów</a>
          <img className="post-hero-image" src={post.image} alt="" />
          <div className="post-article-content">
            <p className="post-article-category">{post.category}</p>
            <p className="post-article-date">{post.date}</p>
            <h1>{post.title}</h1>
            <p className="post-article-lead">{post.excerpt}</p>
            <div className="post-body">
              {post.content.map((paragraph, index) => (
                <div className="post-body-paragraph" key={`${index}-${paragraph}`}>
                  <SafePostContent content={paragraph} />
                </div>
              ))}
            </div>
          </div>
        </article>
      <Sidebar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchRef={searchRef}
        categories={categories}
        selectedCategories={selectedCategories}
        onCategoryChange={onCategoryChange}
        posts={posts}
        onRandomPost={onRandomPost}
        onShowRecommended={onShowRecommended}
      />
      </main>
    </div>
  )
}

export default PostPage
