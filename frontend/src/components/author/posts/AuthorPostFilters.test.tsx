import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AuthorPostFilters from './AuthorPostFilters'

describe('AuthorPostFilters', () => {
  it('reports the current result count and filters by category', () => {
    const onCategoryChange = vi.fn()
    render(
      <AuthorPostFilters
        categories={['kuchnia', 'filmy']}
        totalCount={5}
        resultCount={2}
        selectedCategory="ALL"
        featuredFilter="ALL"
        dateSort="NEWEST"
        onCategoryChange={onCategoryChange}
        onFeaturedFilterChange={vi.fn()}
        onDateSortChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent('2 z 5 wpisów')
    fireEvent.change(screen.getByLabelText('Kategoria'), { target: { value: 'filmy' } })
    expect(onCategoryChange).toHaveBeenCalledWith('filmy')
  })

  it('supports featured filters and clears active filters', () => {
    const onCategoryChange = vi.fn()
    const onFeaturedFilterChange = vi.fn()
    render(
      <AuthorPostFilters
        categories={['kuchnia']}
        totalCount={2}
        resultCount={1}
        selectedCategory="kuchnia"
        featuredFilter="FEATURED"
        dateSort="NEWEST"
        onCategoryChange={onCategoryChange}
        onFeaturedFilterChange={onFeaturedFilterChange}
        onDateSortChange={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Pozostałe' }))
    expect(onFeaturedFilterChange).toHaveBeenCalledWith('NOT_FEATURED')

    fireEvent.click(screen.getByRole('button', { name: 'Wyczyść filtry' }))
    expect(onCategoryChange).toHaveBeenCalledWith('ALL')
    expect(onFeaturedFilterChange).toHaveBeenLastCalledWith('ALL')
  })
})
