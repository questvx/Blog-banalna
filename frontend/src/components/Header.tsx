type HeaderProps = {
  onSearchFocus: () => void
}

import './Header.css'

function Header({ onSearchFocus }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="header-socials"><a href="#instagram" aria-label="Instagram">◎</a><a href="#facebook" aria-label="Facebook">f</a></div>
      <div className="header-center">
        <a className="wordmark" href="/" aria-label="Banalna i tyle - strona główna">banalna... i tyle</a>
        <p className="tagline">Codzienne inspiracje i nowości</p>
        <nav className="main-nav" aria-label="Główna nawigacja">
          <a className="active" href="#najnowsze">Strona główna</a>
          <a href="#o-mnie">O mnie</a>
          <a href="#kontakt">Kontakt</a>
        </nav>
      </div>
      <button className="search-button" type="button" onClick={onSearchFocus} aria-label="Przejdź do wyszukiwarki">⌕</button>
    </header>
  )
}

export default Header