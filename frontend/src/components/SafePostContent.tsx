import DOMPurify from 'dompurify'

function SafePostContent({ content }: { content: string }) {
  const sanitizedHtml = DOMPurify.sanitize(content, {
    ADD_TAGS: ['ciekawostka', 'serif'],
    USE_PROFILES: { html: true },
  })
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
}

export default SafePostContent
