import type { AuthorPost } from '../../api/adminPosts'

type AuthorPostListProps = {
  posts: AuthorPost[]
  deletingId: number | null
  emptyMessage: string
  onEdit: (post: AuthorPost) => void
  onDelete: (post: AuthorPost) => void
}

function AuthorPostList({ posts, deletingId, emptyMessage, onEdit, onDelete }: AuthorPostListProps) {
  if (posts.length === 0) {
    return <p className="author-dashboard-empty">{emptyMessage}</p>
  }

  return (
    <div className="author-post-list" role="list" aria-label="Lista wpisów">
      {posts.map((post) => (
        <article className="author-post-row" role="listitem" key={post.id}>
          <div className="author-post-info">
            <h2>{post.title}</h2>
            <p>{post.category} <span aria-hidden="true">·</span> {post.date}</p>
          </div>
          <span className={`author-post-status ${post.status === 'PUBLISHED' ? 'is-published' : 'is-draft'}`}>
            {post.status === 'PUBLISHED' ? 'Opublikowany' : 'Szkic'}
          </span>
          {post.featured && <span className="author-post-featured">Polecany</span>}
          <div className="author-post-actions">
            <button type="button" onClick={() => onEdit(post)}>Edytuj</button>
            <button type="button" className="is-danger" disabled={deletingId === post.id} onClick={() => onDelete(post)}>
              {deletingId === post.id ? 'Usuwanie...' : 'Usuń'}
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}

export default AuthorPostList