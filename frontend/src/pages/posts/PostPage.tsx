import { useRef, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import type { Post } from '../../data/posts'
import './PostPage.css'

type PostPageProps = {
  post: Post
}

function PostPage({ post }: PostPageProps) {
  const [searchValue, setSearchValue] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  return (
    <div className="post-page-shell">
      <main className="post-page-layout">
        <article className="post-article">
          <a className="back-link" href="#najnowsze">← Wróć do wpisów</a>
          <img className="post-hero-image" src={post.image} alt="" />
          <div className="post-article-content">
            <p className="post-article-category">{post.category}</p>
            <p className="post-article-date">{post.date}</p>
            <h1>{post.title}</h1>
            <p className="post-article-lead">{post.excerpt}</p>
            <div className="post-body">
              {post.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </div>
        </article>
        <Sidebar searchValue={searchValue} onSearchChange={setSearchValue} searchRef={searchRef} />
      </main>
    </div>
  )
}

export default PostPage
