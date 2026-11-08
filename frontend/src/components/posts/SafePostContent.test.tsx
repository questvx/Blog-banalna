import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SafePostContent from './SafePostContent'

describe('SafePostContent', () => {
  it('renders safe formatting and supported custom tags', () => {
    const { container } = render(
      <SafePostContent content="<p><strong>Ważne</strong> <serif>zdanie</serif></p><ciekawostka>Fakt</ciekawostka>" />,
    )

    expect(screen.getByText('Ważne')).toBeInTheDocument()
    expect(container.querySelector('serif')).toHaveTextContent('zdanie')
    expect(container.querySelector('ciekawostka')).toHaveTextContent('Fakt')
  })

  it('removes scripts and inline event handlers', () => {
    const { container } = render(
      <SafePostContent content='<img src="x" onerror="alert(1)"><script>alert(2)</script><p>Treść</p>' />,
    )

    expect(container.querySelector('script')).not.toBeInTheDocument()
    expect(container.querySelector('img')).not.toHaveAttribute('onerror')
    expect(screen.getByText('Treść')).toBeInTheDocument()
  })

  it('rejects javascript links but keeps a safe new-tab link', () => {
    const { container } = render(
      <SafePostContent content='<a href="javascript:alert(1)">niebezpieczny</a><a href="https://example.com" target="_blank" rel="noopener">bezpieczny</a>' />,
    )
    const links = container.querySelectorAll('a')

    expect(links[0]).not.toHaveAttribute('href')
    expect(links[1]).toHaveAttribute('href', 'https://example.com')
    expect(links[1]).toHaveAttribute('target', '_blank')
    expect(links[1]).toHaveAttribute('rel', 'noopener')
  })
})
