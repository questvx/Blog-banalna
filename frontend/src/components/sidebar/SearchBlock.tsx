import type { RefObject } from 'react'
import './SearchBlock.css'

type SearchBlockProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  searchRef: RefObject<HTMLInputElement | null>
  onRandomPost: () => void
}

function SearchBlock({ searchValue, onSearchChange, searchRef, onRandomPost }: SearchBlockProps) {
  return (
    <div className="sidebar-block search-block">
      <label htmlFor="post-search">Szukaj</label>
      <div className="search-field">
        <input
          ref={searchRef}
          id="post-search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Szukaj wpisu..."
        />
        <button
          type="button"
          onClick={() => searchRef.current?.focus()}
          aria-label="Szukaj"
        >
          ⌕
        </button>
      </div>
      <button className="random-link" type="button" onClick={onRandomPost}>
        ⚄ &nbsp; Losowy wpis <span>›</span>
      </button>
    </div>
  )
}

export default SearchBlock
