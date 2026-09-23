import './TagsBlock.css'

type TagsBlockProps = {
  categories: string[]
  selectedCategories: string[]
  onCategoryChange: (category: string) => void
}

function TagsBlock({ categories, selectedCategories, onCategoryChange }: TagsBlockProps) {
  return (
    <div className="tags-block sidebar-block">
      <p className="sidebar-label">Wybierz kategorie</p>
      <div className="tag-list">
        {categories.map((category) => (
          <button
            aria-pressed={selectedCategories.includes(category)}
            className={selectedCategories.includes(category) ? 'active' : ''}
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
