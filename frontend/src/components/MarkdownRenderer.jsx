import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

export default function MarkdownRenderer({ content }) {
  return (
    <ReactMarkdown
      className="prose prose-slate dark:prose-invert max-w-none
        prose-headings:font-semibold
        prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-8 prose-h1:border-b prose-h1:border-gray-200 dark:prose-h1:border-gray-700 prose-h1:pb-2
        prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-6
        prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-4
        prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
        prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
        prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
        prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-gray-900 dark:prose-pre:bg-black prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto prose-pre:shadow-lg
        prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4 prose-ul:space-y-2
        prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4 prose-ol:space-y-2
        prose-li:text-gray-700 dark:prose-li:text-gray-300
        prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400
        prose-table:border-collapse prose-table:w-full
        prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-700
        prose-td:px-4 prose-td:py-2 prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-700
        prose-hr:border-gray-300 dark:prose-hr:border-gray-700 prose-hr:my-8
        prose-img:rounded-lg prose-img:shadow-md"
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        // Custom rendering for specific elements
        h1: ({ node, ...props }) => (
          <h1 className="group relative" {...props}>
            {props.children}
            <span className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">#</span>
          </h1>
        ),
        h2: ({ node, ...props }) => (
          <h2 className="group relative" {...props}>
            {props.children}
            <span className="absolute -left-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">##</span>
          </h2>
        ),
        h3: ({ node, ...props }) => (
          <h3 className="group relative" {...props}>
            {props.children}
            <span className="absolute -left-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">###</span>
          </h3>
        ),
        // Style code blocks
        code: ({ node, inline, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '')
          return !inline ? (
            <code className={className} {...props}>
              {children}
            </code>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          )
        },
        // Add icons to lists
        ul: ({ node, ...props }) => (
          <ul className="space-y-2" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="space-y-2" {...props} />
        ),
        // Style links with external icon
        a: ({ node, ...props }) => {
          const isExternal = props.href?.startsWith('http')
          return (
            <a
              {...props}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center gap-1"
            >
              {props.children}
              {isExternal && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              )}
            </a>
          )
        },
        // Add note/warning/tip blocks for blockquotes
        blockquote: ({ node, children, ...props }) => {
          const text = node.children[0]?.children[0]?.value || ''
          let icon = '💡'
          let borderColor = 'border-indigo-500'
          let bgColor = 'bg-indigo-50 dark:bg-indigo-900/20'

          if (text.startsWith('⚠️') || text.toLowerCase().includes('warning')) {
            icon = '⚠️'
            borderColor = 'border-yellow-500'
            bgColor = 'bg-yellow-50 dark:bg-yellow-900/20'
          } else if (text.startsWith('❌') || text.toLowerCase().includes('error')) {
            icon = '❌'
            borderColor = 'border-red-500'
            bgColor = 'bg-red-50 dark:bg-red-900/20'
          } else if (text.startsWith('✅') || text.toLowerCase().includes('tip')) {
            icon = '✅'
            borderColor = 'border-green-500'
            bgColor = 'bg-green-50 dark:bg-green-900/20'
          }

          return (
            <div className={`flex gap-3 p-4 rounded-lg border-l-4 ${borderColor} ${bgColor} my-4`}>
              <span className="text-xl flex-shrink-0">{icon}</span>
              <blockquote className="border-0 pl-0 my-0" {...props}>
                {children}
              </blockquote>
            </div>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
