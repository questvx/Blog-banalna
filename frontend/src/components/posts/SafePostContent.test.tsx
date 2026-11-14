import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Post } from '../../data/posts'
import SafePostContent from './SafePostContent'

const recommendedPost: Post = {
  id: 42,
  title: 'Post do polecenia',
  excerpt: 'Nagłówek',
  content: [],
  date: '2026-10-01',
  category: 'inne',
  image: '/uploads/post.jpg',
}

describe('SafePostContent', () => {
  it('renders safe formatting and supported custom tags', () => {
    const { container } = render(
      <SafePostContent content="<p><strong>Ważne</strong> <serif>zdanie</serif></p><ciekawostka>Fakt</ciekawostka>" posts={[]} />,
    )

    expect(screen.getByText('Ważne')).toBeInTheDocument()
    expect(container.querySelector('serif')).toHaveTextContent('zdanie')
    expect(container.querySelector('ciekawostka')).toHaveTextContent('Fakt')
  })

  it('removes scripts and inline event handlers', () => {
    const { container } = render(
      <SafePostContent content='<img src="x" onerror="alert(1)"><script>alert(2)</script><p>Treść</p>' posts={[]} />,
    )

    expect(container.querySelector('script')).not.toBeInTheDocument()
    expect(container.querySelector('img')).not.toHaveAttribute('onerror')
    expect(screen.getByText('Treść')).toBeInTheDocument()
  })

  it('rejects javascript links but keeps a safe new-tab link', () => {
    const { container } = render(
      <SafePostContent content='<a href="javascript:alert(1)">niebezpieczny</a><a href="https://example.com" target="_blank" rel="noopener">bezpieczny</a>' posts={[]} />,
    )
    const links = container.querySelectorAll('a')

    expect(links[0]).not.toHaveAttribute('href')
    expect(links[1]).toHaveAttribute('href', 'https://example.com')
    expect(links[1]).toHaveAttribute('target', '_blank')
    expect(links[1]).toHaveAttribute('rel', 'noopener')
  })

  it('renders a recommendation marker as a relative link with the referenced post image and title', () => {
    const { container } = render(
      <SafePostContent content='<p>Wpis</p><polecajka id="42"></polecajka>' posts={[recommendedPost]} />,
    )
    const recommendationLink = container.querySelector('.post-recommendation-link')

    expect(container.querySelector('.post-recommendation-label')).toHaveTextContent('Rzuć okiem też na:')
    expect(recommendationLink).toHaveAttribute('href', '#post-42')
    expect(recommendationLink?.querySelector('img')).toHaveAttribute('src', '/uploads/post.jpg')
    expect(recommendationLink).toHaveTextContent('Post do polecenia')
  })

  it('shows a fallback if a referenced post is no longer published', () => {
    render(<SafePostContent content='<polecajka id="99"></polecajka>' posts={[]} />)

    expect(screen.getByText('Ten wpis nie jest już dostępny.')).toBeInTheDocument()
  })
})
