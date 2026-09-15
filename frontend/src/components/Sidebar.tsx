type SidebarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
};

import "./Sidebar.css";

function Sidebar({ searchValue, onSearchChange, searchRef }: SidebarProps) {
  return (
    <aside className="sidebar">
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
          ▦ &nbsp; Losowy wpis <span>›</span>
        </a>
      </div>
      <div className="recommended-block">
        <p className="sidebar-label">polecane</p>
        <h2>
          Wpisy, które
          <br />
          warto przeczytać.
        </h2>

        <p>Małe rytuały na dobry dzień.</p>
        <p>Jak zwolnić i odpocząć.</p>
        <p>Pomysły na idealny weekend.</p>

        <a className="text-link" href="#posts">
          zobacz więcej <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div className="sidebar-block">
        <p className="sidebar-label">Tagi</p>
        <div className="tag-list">
          {["głowa", "po swojemu", "stół", "rzeczy", "miasto", "blisko"].map(
            (tag) => (
              <a href={`#${tag}`} key={tag}>
                #{tag}
              </a>
            ),
          )}
        </div>
      </div>

      <div className="sidebar-block">
        <p className="sidebar-label">archiwum</p>
        <ul className="archive-list">
          <li>
            <a href="#wrzesien">wrzesień 2026</a>
            <span>5</span>
          </li>
          <li>
            <a href="#sierpien">sierpień 2026</a>
            <span>8</span>
          </li>
          <li>
            <a href="#lipiec">lipiec 2026</a>
            <span>12</span>
          </li>
          <li>
            <a href="#czerwiec">czerwiec 2026</a>
            <span>9</span>
          </li>
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;
