import type { AuthorPost } from '../../../api/adminPosts'
import type { AdminCuriosity } from '../../../api/adminCuriosities'

export type AuthorListEntry =
  | { type: 'POST'; post: AuthorPost }
  | { type: 'CURIOSITY'; curiosity: AdminCuriosity }

type AuthorPostListProps = {
  entries: AuthorListEntry[]
  deletingId: number | null
  deletingCuriosityId: number | null
  emptyMessage: string
  onEdit: (post: AuthorPost) => void
  onDelete: (post: AuthorPost) => void
  onEditCuriosity: (curiosity: AdminCuriosity) => void
  onDeleteCuriosity: (curiosity: AdminCuriosity) => void
}

function AuthorPostList({
  entries,
  deletingId,
  deletingCuriosityId,
  emptyMessage,
  onEdit,
  onDelete,
  onEditCuriosity,
  onDeleteCuriosity,
}: AuthorPostListProps) {
  if (entries.length === 0) {
    return <p className="author-dashboard-empty">{emptyMessage}</p>
  }

  return (
    <div className="author-post-list" role="list" aria-label="Lista wpisów">
      {entries.map((entry) => entry.type === 'CURIOSITY' ? (
        <article className="author-post-row" role="listitem" key={`curiosity-${entry.curiosity.id}`}>
          <div className="author-post-info">
            <h2>{entry.curiosity.title}</h2>
            <p>ciekawostka <span aria-hidden="true">·</span> {entry.curiosity.createdAt.slice(0, 10)}</p>
          </div>
          <span className="author-post-curiosity">Ciekawostka</span>
          <span className={`author-post-status ${entry.curiosity.status === 'PUBLISHED' ? 'is-published' : 'is-draft'}`}>
            {entry.curiosity.status === 'PUBLISHED' ? 'Opublikowany' : 'Szkic'}
          </span>
          <div className="author-post-actions">
            <button type="button" onClick={() => onEditCuriosity(entry.curiosity)}>Edytuj</button>
            <button
              type="button"
              className="is-danger"
              disabled={deletingCuriosityId === entry.curiosity.id}
              onClick={() => onDeleteCuriosity(entry.curiosity)}
            >
              {deletingCuriosityId === entry.curiosity.id ? 'Usuwanie...' : 'Usuń'}
            </button>
          </div>
        </article>
      ) : (
        <article className="author-post-row" role="listitem" key={`post-${entry.post.id}`}>
          <div className="author-post-info">
            <h2>{entry.post.title}</h2>
            <p>{entry.post.category} <span aria-hidden="true">·</span> {entry.post.date}</p>
          </div>
          <span className={`author-post-status ${entry.post.status === 'PUBLISHED' ? 'is-published' : 'is-draft'}`}>
            {entry.post.status === 'PUBLISHED' ? 'Opublikowany' : 'Szkic'}
          </span>
          {entry.post.featured && <span className="author-post-featured">Polecany</span>}
          <div className="author-post-actions">
            <button type="button" onClick={() => onEdit(entry.post)}>Edytuj</button>
            <button type="button" className="is-danger" disabled={deletingId === entry.post.id} onClick={() => onDelete(entry.post)}>
              {deletingId === entry.post.id ? 'Usuwanie...' : 'Usuń'}
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}

export default AuthorPostList