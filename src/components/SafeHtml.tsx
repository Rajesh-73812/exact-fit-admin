'use client';

import { useEffect, useState } from 'react';

interface SafeHtmlProps {
  html: string;
  className?: string;
}

export default function SafeHtml({ html, className = '' }: SafeHtmlProps) {
  const [cleanHtml, setCleanHtml] = useState<string>('');

  useEffect(() => {
    // Dynamic import — only runs on client
    import('dompurify').then((DOMPurify) => {
      const clean = DOMPurify.default.sanitize(html, {
        ADD_ATTR: ['target', 'rel'],
        ADD_TAGS: ['iframe'],
      });
      setCleanHtml(clean);
    });
  }, [html]);

  if (!html) return null;

  return (
    <div
      className={`prose prose-sm max-w-none prose-headings:font-semibold prose-li:my-1 prose-ol:pl-6 prose-ul:pl-6 prose-a:text-violet-600 hover:prose-a:underline ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
}