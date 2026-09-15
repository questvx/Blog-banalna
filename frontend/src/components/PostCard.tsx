import type { Post } from '../data/posts'
import './PostCard.css'

type PostCardProps = { post: Post; featured?: boolean; gradientIndex: number }

function PostCard({ post, featured = false, gradientIndex }: PostCardProps) {
  return (
    <article className={`post-card post-card-gradient-${(gradientIndex % 6) + 1} ${featured ? 'post-card-featured' : ''}`}>
      <a className="post-image" href={`#post-${post.id}`} aria-label={`Przeczytaj: ${post.title}`}>
        <img src={post.image} alt="" loading="lazy" />
        <span className="post-category">{post.category}</span>
      </a>
      <div className="post-content">
        <p className="post-meta">{post.date} <span>·</span> {post.readTime}</p>
        <h3><a href={`#post-${post.id}`}>{post.title}</a></h3>
        <p className="post-excerpt">{post.excerpt}</p>
        <a className="read-more" href={`#post-${post.id}`}>Czytaj więcej <span aria-hidden="true">›</span></a>
      </div>
    </article>
  )
}

export default PostCard