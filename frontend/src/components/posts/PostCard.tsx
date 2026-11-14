import { useEffect, useRef, useState } from 'react'
import {
  getCardCropRect,
  getCropImageElementStyle,
  type PostCardCropType,
} from '../../data/imageCardCrops'
import type { Post } from '../../data/posts'
import './PostCard.css'

type PostCardProps = { post: Post; featured?: boolean; gradientIndex: number; cropType?: PostCardCropType }

function PostCard({ post, featured = false, gradientIndex, cropType = featured ? 'large' : 'small' }: PostCardProps) {
  const cardRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>()

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
        observer.disconnect()
      }
    }, { threshold: 0.12 })

    observer.observe(card)
    return () => observer.disconnect()
  }, [])

  return (
    <article ref={cardRef} className={`post-card post-card-gradient-${(gradientIndex % 6) + 1} ${featured ? 'post-card-featured' : ''} ${isVisible ? 'post-card-visible' : ''}`}>
      <a className="post-image" href={`#post-${post.id}`} aria-label={`Przeczytaj: ${post.title}`}>
        <img
          src={post.image}
          alt=""
          loading="lazy"
          onLoad={(event) => setImageDimensions({
            width: event.currentTarget.naturalWidth,
            height: event.currentTarget.naturalHeight,
          })}
          style={post.cardCrops && imageDimensions
            ? getCropImageElementStyle(getCardCropRect(
              imageDimensions.width,
              imageDimensions.height,
              cropType,
              post.cardCrops[cropType],
            ))
            : undefined}
        />
        <span className="post-category">{post.category}</span>
      </a>
      <div className="post-content">
        <p className="post-meta">{post.date}</p>
        <h3><a href={`#post-${post.id}`}>{post.title}</a></h3>
        <p className="post-excerpt">{post.excerpt}</p>
        <a className="read-more" href={`#post-${post.id}`}>Czytaj więcej <span aria-hidden="true">›</span></a>
      </div>
    </article>
  )
}

export default PostCard