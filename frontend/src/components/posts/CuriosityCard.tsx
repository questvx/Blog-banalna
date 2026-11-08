import type { Curiosity } from '../../data/curiosities'
import './CuriosityCard.css'

type CuriosityCardProps = {
  curiosity: Curiosity
}

function CuriosityCard({ curiosity }: CuriosityCardProps) {
  return (
    <article className="post-card post-card-visible curiosity-card" aria-labelledby={`curiosity-title-${curiosity.id}`}>
      <div className="post-content">
        <div className="curiosity-card-header">
          <span className="curiosity-card-label">Ciekawostka</span>
          <span className="curiosity-card-bulb" aria-hidden="true">💡</span>
        </div>
        <h3 id={`curiosity-title-${curiosity.id}`}>{curiosity.title}</h3>
        <p className="curiosity-card-body">{curiosity.content}</p>
      </div>
    </article>
  )
}

export default CuriosityCard
