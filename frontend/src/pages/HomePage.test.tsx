import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Curiosity } from '../data/curiosities'
import { createPost } from '../test/fixtures'
import HomePage from './HomePage'

vi.mock('../components/layout/Hero', () => ({ default: () => null }))

function renderHomePage(posts = [
  createPost({ id: 1, title: 'Spacer nad morzem', excerpt: 'Wycieczka w spokojny dzień.' }),
  createPost({ id: 2, title: 'Zupa na chłodny dzień', category: 'kuchnia' }),
  createPost({ id: 3, title: 'Książka na weekend', category: 'książka' }),
  createPost({ id: 4, title: 'Wieczór filmowy', category: 'filmy' }),
  createPost({ id: 5, title: 'Piąty wpis', category: 'sport' }),
], curiosities: Curiosity[] = []) {
  const props = {
    posts,
    curiosities,
    categories: ['kuchnia', 'filmy', 'książka', 'sport', 'ciekawostka'],
    selectedCategories: [],
    onCategoryChange: vi.fn(),
    onRandomPost: vi.fn(),
    onShowRecommended: vi.fn(),
    onShowAllPosts: vi.fn(),
    showFeaturedOnly: false,
  }

  return { ...render(<HomePage {...props} />), props }
}

describe('HomePage', () => {
  it('filters posts by title and excerpt text', () => {
    renderHomePage()

    fireEvent.change(screen.getByRole('textbox', { name: 'Szukaj' }), { target: { value: 'spokojny' } })

    expect(screen.getByRole('heading', { name: 'Spacer nad morzem' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Zupa na chłodny dzień' })).not.toBeInTheDocument()
  })

  it('shows an empty state when no post matches the search', () => {
    renderHomePage()

    fireEvent.change(screen.getByRole('textbox', { name: 'Szukaj' }), { target: { value: 'brak takiego wpisu' } })

    expect(screen.getByText('Nie znalazłam niczego pod tą frazą. Spróbuj inaczej.')).toBeInTheDocument()
  })

  it('renders the full curiosity as a non-clickable card in the post feed', () => {
    const curiosity: Curiosity = {
      id: 12,
      title: 'Dlaczego miód się nie psuje?',
      content: 'Pełna treść ciekawostki.\nDrugi akapit.',
      createdAt: '2026-12-01T12:00:00',
    }
    renderHomePage(undefined, [curiosity])

    const card = screen.getByRole('article', { name: curiosity.title })
    expect(within(card).getByRole('heading', { level: 3, name: curiosity.title })).toBeInTheDocument()
    expect(card).toHaveTextContent('Pełna treść ciekawostki. Drugi akapit.')
    expect(within(card).getByText('Ciekawostka')).toBeInTheDocument()
    expect(within(card).queryByRole('link')).not.toBeInTheDocument()
  })

  it('loads two more posts when the user requests older posts', () => {
    renderHomePage()

    expect(screen.queryByRole('heading', { name: 'Piąty wpis' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /pokaż starsze wpisy/i }))
    expect(screen.getByRole('heading', { name: 'Piąty wpis' })).toBeInTheDocument()
  })

  it('clears the search and resets pagination when recommended posts are requested', () => {
    const featuredPosts = Array.from({ length: 6 }, (_, index) => createPost({
      id: index + 1,
      title: `Polecany wpis ${index + 1}`,
      featured: true,
    }))
    const { props } = renderHomePage(featuredPosts)
    fireEvent.change(screen.getByRole('textbox', { name: 'Szukaj' }), { target: { value: 'Polecany wpis 6' } })
    expect(screen.getByRole('heading', { name: 'Polecany wpis 6' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Zobacz Więcej' }))

    expect(screen.getByRole('textbox', { name: 'Szukaj' })).toHaveValue('')
    expect(screen.getByRole('heading', { name: 'Polecany wpis 1' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Polecany wpis 5' })).not.toBeInTheDocument()
    expect(props.onShowRecommended).toHaveBeenCalledOnce()
  })
})
