import Header from './components/Header'
import HomePage from './pages/HomePage'

function App() {
  return (
    <div className="app-shell">
      <Header onSearchFocus={() => document.getElementById('post-search')?.focus()} />
      <HomePage />
    </div>
  )
}

export default App
