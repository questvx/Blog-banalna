import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createPost } from '../test/fixtures'
import HomePage from './HomePage'

vi.mock('../components/layout/Hero', () => ({ default: () => null }))

function renderHomePage(posts = [
  createPost({ id: 1, title: 'Spacer nad morzem', excerpt: 'Wycieczka w spokojny dzień.' }),
  createPost({ id: 2, title: 'Zupa na chłodny dzień', category: 'kuchnia' }),
  createPost({ id: 3, title: 'Książka na weekend', category: 'książka' }),
  createPost({ id: 4, title: 'Wieczór filmowy', category: 'filmy' }),
  createPost({ id: 5, title: 'Piąty wpis', category: 'sport' }),
]) {
  const props = {
    posts,
    categories: ['kuchnia', 'filmy', 'książka', 'sport'],
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
