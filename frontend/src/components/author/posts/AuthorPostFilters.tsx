type AuthorPostFiltersProps = {
  categories: string[]
  totalCount: number
  resultCount: number
  selectedCategory: string
  featuredFilter: FeaturedFilter
  dateSort: PostDateSort
  onCategoryChange: (category: string) => void
  onFeaturedFilterChange: (filter: FeaturedFilter) => void
  onDateSortChange: (sort: PostDateSort) => void
}

export type FeaturedFilter = 'ALL' | 'FEATURED' | 'NOT_FEATURED'
export type PostDateSort = 'NEWEST' | 'OLDEST'

function AuthorPostFilters({
  categories,
  totalCount,
  resultCount,
  selectedCategory,
  featuredFilter,
  dateSort,
  onCategoryChange,
  onFeaturedFilterChange,
  onDateSortChange,
}: AuthorPostFiltersProps) {
  const hasActiveFilters = selectedCategory !== 'ALL' || featuredFilter !== 'ALL'

  return (
    <div className="author-post-filters" aria-label="Filtrowanie i sortowanie wpisów">
      <label className="author-post-filter-field">
        <span>Kategoria</span>
        <select value={selectedCategory} onChange={(event) => onCategoryChange(event.target.value)}>
          <option value="ALL">Wszystkie kategorie</option>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
      </label>

      <fieldset className="author-post-featured-filter">
        <legend>Polecane</legend>
        <div className="author-post-filter-segmented">
          <button type="button" aria-pressed={featuredFilter === 'ALL'} onClick={() => onFeaturedFilterChange('ALL')}>Wszystkie</button>
          <button type="button" aria-pressed={featuredFilter === 'FEATURED'} onClick={() => onFeaturedFilterChange('FEATURED')}>Polecane</button>
          <button type="button" aria-pressed={featuredFilter === 'NOT_FEATURED'} onClick={() => onFeaturedFilterChange('NOT_FEATURED')}>Pozostałe</button>
        </div>
      </fieldset>

      <label className="author-post-filter-field author-post-date-sort">
        <span>Data</span>
        <select value={dateSort} onChange={(event) => onDateSortChange(event.target.value as PostDateSort)}>
          <option value="NEWEST">Najnowsze najpierw</option>
          <option value="OLDEST">Najstarsze najpierw</option>
        </select>
      </label>

      <p className="author-post-filter-count" role="status">{resultCount} z {totalCount} wpisów</p>
      {hasActiveFilters && (
        <button
          className="author-post-filter-reset"
          type="button"
          onClick={() => {
            onCategoryChange('ALL')
            onFeaturedFilterChange('ALL')
          }}
        >
          Wyczyść filtry
        </button>
      )}
    </div>
  )
}

export default AuthorPostFilters