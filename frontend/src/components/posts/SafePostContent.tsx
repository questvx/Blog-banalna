import DOMPurify from 'dompurify'
import type { Post } from '../../data/posts'

type SafePostContentProps = {
  content: string
  posts: Post[]
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character)
}

function createRecommendationMarkup(postId: number, posts: Post[]): string {
  const post = posts.find((candidate) => candidate.id === postId)
  if (!post) {
    return '<div class="post-recommendation post-recommendation-unavailable"><span class="post-recommendation-label">Rzuć okiem też na:</span><span>Ten wpis nie jest już dostępny.</span></div>'
  }

  return `<div class="post-recommendation"><span class="post-recommendation-label">Polecam przeczytać:</span><a class="post-recommendation-link" href="#post-${post.id}"><img class="post-recommendation-image" src="${escapeHtml(post.image)}" alt=""><span class="post-recommendation-title">${escapeHtml(post.title)}</span></a></div>`
}

function SafePostContent({ content, posts }: SafePostContentProps) {
  const contentWithRecommendations = content.replace(
    /<polecajka\b[^>]*\bid\s*=\s*(?:"(\d+)"|'(\d+)'|(\d+))[^>]*>(?:\s*<\/polecajka\s*>)?/gi,
    (_match, doubleQuotedId: string | undefined, singleQuotedId: string | undefined, unquotedId: string | undefined) =>
      createRecommendationMarkup(Number(doubleQuotedId ?? singleQuotedId ?? unquotedId), posts),
  )
  const sanitizedHtml = DOMPurify.sanitize(contentWithRecommendations, {
    ADD_TAGS: ['ciekawostka', 'serif'],
    ADD_ATTR: ['target', 'rel'],
    USE_PROFILES: { html: true },
  })
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
}

export default SafePostContent
