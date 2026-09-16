import './ArchiveBlock.css'

const archiveItems = [
  ['wrzesien', 'wrzesień 2026', '5'],
  ['sierpien', 'sierpień 2026', '8'],
  ['lipiec', 'lipiec 2026', '12'],
  ['czerwiec', 'czerwiec 2026', '9'],
]

function ArchiveBlock() {
  return (
    <div className="archive-block sidebar-block">
      <p className="sidebar-label">Archiwum</p>
      <ul className="archive-list">
        {archiveItems.map(([id, label, count]) => (
          <li key={id}>
            <a href={`#${id}`}>{label}</a>
            <span>{count}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ArchiveBlock
