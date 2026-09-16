import './TagsBlock.css'

const tags = ['filmy', 'książka', 'nowości', 'inspiracje', 'technologie', 'kuchnia']

function TagsBlock() {
  return (
    <div className="tags-block sidebar-block">
      <p className="sidebar-label">Tagi</p>
      <div className="tag-list">
        {tags.map((tag) => (
          <a href={`#${tag}`} key={tag}>
            {tag}
          </a>
        ))}
      </div>
    </div>
  )
}

export default TagsBlock
