import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createPost } from '../../test/fixtures'
import PostPage from './PostPage'

function renderPostPage(content = ['Akapit <strong>formatowany</strong>.']) {
  const post = createPost({ title: 'Post do przeczytania', content })

  return render(
    <PostPage
      post={post}
      posts={[post]}
      categories={[]}
      selectedCategories={[]}
      onCategoryChange={vi.fn()}
      onRandomPost={vi.fn()}
      onShowRecommended={vi.fn()}
      showFeaturedOnly={false}
    />,
  )
}

describe('PostPage', () => {
  it('scrolls to the top when a post is opened', () => {
    renderPostPage()

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' })
  })

  it('renders the article and safely formatted body content', () => {
    const { container } = renderPostPage(['Akapit <strong>formatowany</strong>.', '<script>alert(1)</script><p>Bezpieczna treść.</p>'])

    expect(screen.getByRole('heading', { level: 1, name: 'Post do przeczytania' })).toBeInTheDocument()
    expect(screen.getByText('Akapit', { exact: false }).querySelector('strong')).toHaveTextContent('formatowany')
    expect(screen.getByText('Bezpieczna treść.')).toBeInTheDocument()
    expect(container.querySelector('.post-body script')).not.toBeInTheDocument()
  })

  it('links back to the currently selected post list', () => {
    const post = createPost()
    render(
      <PostPage
        post={post}
        posts={[post]}
        categories={[]}
        selectedCategories={[]}
        onCategoryChange={vi.fn()}
        onRandomPost={vi.fn()}
        onShowRecommended={vi.fn()}
        showFeaturedOnly
      />,
    )

    expect(screen.getByRole('link', { name: '← Wróć do wpisów' })).toHaveAttribute('href', '#polecane')
  })
})
