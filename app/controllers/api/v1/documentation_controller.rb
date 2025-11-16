# frozen_string_literal: true

module Api
  module V1
    class DocumentationController < ApplicationController
      skip_before_action :authorize_request, only: [:index, :show, :search]

      # GET /api/v1/documentation
      # Returns list of available documentation files
      def index
        docs = [
          {
            id: 'bible',
            name: 'TRAPID Bible',
            description: 'Development rules and protected patterns',
            icon: '📖',
            audience: 'Developers',
            path: 'TRAPID_BIBLE.md',
            chapters: 19
          },
          {
            id: 'implementation-patterns',
            name: 'Teach',
            description: 'Code examples and implementation guides',
            icon: '🔧',
            audience: 'Developers',
            path: 'IMPLEMENTATION_PATTERNS.md',
            chapters: 2
          },
          {
            id: 'lexicon',
            name: 'TRAPID Lexicon',
            description: 'Bug history and knowledge base',
            icon: '📕',
            audience: 'Developers',
            path: 'TRAPID_LEXICON.md',
            chapters: 19
          },
          {
            id: 'user-manual',
            name: 'TRAPID User Manual',
            description: 'Step-by-step user guides',
            icon: '📘',
            audience: 'End Users',
            path: 'TRAPID_USER_MANUAL.md',
            chapters: 19
          }
        ]

        render json: { success: true, data: docs }
      end

      # GET /api/v1/documentation/:id
      # Returns content of a specific documentation file
      def show
        doc_id = params[:id]
        chapter = params[:chapter]

        file_path = case doc_id
                    when 'bible'
                      Rails.root.join('..', 'TRAPID_DOCS', 'TRAPID_BIBLE.md')
                    when 'implementation-patterns'
                      Rails.root.join('..', 'TRAPID_DOCS', 'IMPLEMENTATION_PATTERNS.md')
                    when 'lexicon'
                      Rails.root.join('..', 'TRAPID_DOCS', 'TRAPID_LEXICON.md')
                    when 'user-manual'
                      Rails.root.join('..', 'TRAPID_DOCS', 'TRAPID_USER_MANUAL.md')
                    else
                      return render json: { success: false, error: 'Documentation not found' }, status: :not_found
                    end

        unless File.exist?(file_path)
          return render json: { success: false, error: 'File not found' }, status: :not_found
        end

        content = File.read(file_path)

        # If chapter specified, extract that chapter only
        if chapter.present?
          content = extract_chapter(content, chapter.to_i)
        end

        render json: {
          success: true,
          data: {
            id: doc_id,
            content: content,
            chapter: chapter
          }
        }
      rescue StandardError => e
        Rails.logger.error("Documentation error: #{e.message}")
        render json: { success: false, error: 'Failed to load documentation' }, status: :internal_server_error
      end

      # GET /api/v1/documentation/search?q=gantt
      # Searches across all documentation files
      def search
        query = params[:q]&.downcase

        if query.blank?
          return render json: { success: false, error: 'Query parameter required' }, status: :bad_request
        end

        results = []
        docs_path = Rails.root.join('..', 'TRAPID_DOCS')

        # Search in Trinity+1 files
        ['TRAPID_BIBLE.md', 'IMPLEMENTATION_PATTERNS.md', 'TRAPID_LEXICON.md', 'TRAPID_USER_MANUAL.md'].each do |filename|
          file_path = docs_path.join(filename)
          next unless File.exist?(file_path)

          content = File.read(file_path)
          doc_type = filename.gsub('TRAPID_', '').gsub('.md', '').downcase

          # Find matching lines
          content.each_line.with_index do |line, index|
            if line.downcase.include?(query)
              results << {
                doc_type: doc_type,
                doc_name: filename.gsub('TRAPID_', '').gsub('.md', ''),
                line_number: index + 1,
                content: line.strip,
                icon: doc_type == 'bible' ? '📖' : (doc_type == 'lexicon' ? '📕' : '📘')
              }
            end
          end
        end

        render json: {
          success: true,
          data: {
            query: query,
            results: results.first(50), # Limit to 50 results
            total: results.count
          }
        }
      rescue StandardError => e
        Rails.logger.error("Search error: #{e.message}")
        render json: { success: false, error: 'Search failed' }, status: :internal_server_error
      end

      private

      def extract_chapter(content, chapter_num)
        # Extract specific chapter from markdown
        lines = content.split("\n")
        chapter_start = nil
        chapter_end = nil

        # Find chapter start
        lines.each_with_index do |line, idx|
          if line.match?(/^# Chapter #{chapter_num}:/i)
            chapter_start = idx
            break
          end
        end

        return "Chapter #{chapter_num} not found" if chapter_start.nil?

        # Find next chapter (chapter end)
        lines[(chapter_start + 1)..-1].each_with_index do |line, idx|
          if line.match?(/^# Chapter \d+:/i)
            chapter_end = chapter_start + idx + 1
            break
          end
        end

        # If no next chapter found, take until end
        chapter_end ||= lines.length

        lines[chapter_start...chapter_end].join("\n")
      end
    end
  end
end
