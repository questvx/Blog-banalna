import './TagsBlock.css'

type TagsBlockProps = {
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

function TagsBlock({ categories, selectedCategory, onCategoryChange }: TagsBlockProps) {
  return (
    <div className="tags-block sidebar-block">
      <p className="sidebar-label">Kategorie</p>
      <div className="tag-list">
        {['wszystkie', ...categories].map((category) => (
          <button
            className={selectedCategory === category ? 'active' : ''}
            key={category}
            type="button"
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TagsBlock
