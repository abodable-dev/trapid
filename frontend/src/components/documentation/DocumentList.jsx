export default function DocumentList({ documents, selectedDoc, onSelectDoc }) {
  return (
    <div className="p-4">
      <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        Documents
      </h2>
      <div className="space-y-1">
        {documents.map((doc) => (
          <button
            key={doc.id}
            onClick={() => onSelectDoc(doc)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              selectedDoc?.id === doc.id
                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-l-2 border-indigo-600'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <span className="text-lg">{doc.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{doc.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {doc.audience}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
