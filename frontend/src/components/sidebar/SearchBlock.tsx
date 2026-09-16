import type { RefObject } from 'react'
import './SearchBlock.css'

type SearchBlockProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  searchRef: RefObject<HTMLInputElement | null>
}

function SearchBlock({ searchValue, onSearchChange, searchRef }: SearchBlockProps) {
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
      <a className="random-link" href="#losowy">
        ⚄ &nbsp; Losowy wpis <span>›</span>
      </a>
    </div>
  )
}

export default SearchBlock
