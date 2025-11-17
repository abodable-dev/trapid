# frozen_string_literal: true

module Api
  module V1
    class DocumentationEntriesController < ApplicationController
      skip_before_action :authorize_request, only: [:index, :show, :stats]
      before_action :set_documentation_entry, only: [:show, :update, :destroy]

      # GET /api/v1/documentation_entries
      # Query params:
      #   ?chapter=3
      #   ?section=19.1
      #   ?type=bug|architecture|component|feature|etc
      #   ?category=bible|lexicon|teacher (filters by category)
      #   ?status=open (only for bugs)
      #   ?severity=critical (only for bugs)
      #   ?difficulty=beginner|intermediate|advanced (only for teacher)
      #   ?search=xero sync
      def index
        @entries = DocumentationEntry.all

        # Filter by category
        if params[:category] == 'bible'
          @entries = @entries.bible_entries
        elsif params[:category] == 'lexicon'
          @entries = @entries.lexicon_entries
        elsif params[:category] == 'teacher'
          @entries = @entries.teacher_entries
        end

        @entries = @entries.by_chapter(params[:chapter]) if params[:chapter].present?
        @entries = @entries.by_section(params[:section]) if params[:section].present?
        @entries = @entries.by_type(params[:type]) if params[:type].present?
        @entries = @entries.by_status(params[:status]) if params[:status].present?
        @entries = @entries.by_severity(params[:severity]) if params[:severity].present?
        @entries = @entries.by_difficulty(params[:difficulty]) if params[:difficulty].present?
        @entries = @entries.search(params[:search]) if params[:search].present?

        @entries = @entries.recent.limit(100)

        render json: {
          success: true,
          data: @entries.map { |entry| entry_json(entry) },
          total: @entries.count
        }
      end

      # GET /api/v1/documentation_entries/:id
      def show
        render json: {
          success: true,
          data: entry_json(@entry, detailed: true)
        }
      end

      # POST /api/v1/documentation_entries
      def create
        @entry = DocumentationEntry.new(entry_params)

        if @entry.save
          render json: {
            success: true,
            data: entry_json(@entry, detailed: true),
            message: 'Documentation entry created successfully'
          }, status: :created
        else
          render json: {
            success: false,
            errors: @entry.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # PATCH /api/v1/documentation_entries/:id
      def update
        if @entry.update(entry_params)
          render json: {
            success: true,
            data: entry_json(@entry, detailed: true),
            message: 'Documentation entry updated successfully'
          }
        else
          render json: {
            success: false,
            errors: @entry.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/documentation_entries/:id
      def destroy
        @entry.destroy
        render json: {
          success: true,
          message: 'Documentation entry deleted successfully'
        }
      end

      # GET /api/v1/documentation_entries/stats
      # Returns statistics about entries per chapter
      def stats
        stats = {
          total_entries: DocumentationEntry.count,
          bible_count: DocumentationEntry.bible_entries.count,
          lexicon_count: DocumentationEntry.lexicon_entries.count,
          teacher_count: DocumentationEntry.teacher_entries.count,
          by_type: DocumentationEntry.group(:entry_type).count,
          by_category: DocumentationEntry.group(:category).count,
          by_status: DocumentationEntry.group(:status).count,
          by_severity: DocumentationEntry.group(:severity).count,
          by_difficulty: DocumentationEntry.group(:difficulty).count,
          by_chapter: DocumentationEntry.group(:chapter_number, :chapter_name).count.map do |(num, name), count|
            {
              chapter_number: num,
              chapter_name: name,
              total_count: count,
              bible_count: DocumentationEntry.by_chapter(num).bible_entries.count,
              lexicon_count: DocumentationEntry.by_chapter(num).lexicon_entries.count,
              teacher_count: DocumentationEntry.by_chapter(num).teacher_entries.count,
              open_bugs_count: DocumentationEntry.by_chapter(num).open_bugs.count,
              critical_bugs_count: DocumentationEntry.by_chapter(num).critical_bugs.count
            }
          end.sort_by { |c| c[:chapter_number] }
        }

        render json: {
          success: true,
          data: stats
        }
      end

      # POST /api/v1/documentation_entries/export_lexicon
      # Exports Lexicon (bug/architecture/etc) entries to TRAPID_LEXICON.md
      def export_lexicon
        result = system("cd #{Rails.root} && bundle exec rake trapid:export_lexicon")

        if result
          render json: {
            success: true,
            message: 'Lexicon exported to TRAPID_LEXICON.md successfully',
            file_path: Rails.root.join('..', 'TRAPID_DOCS', 'TRAPID_LEXICON.md').to_s,
            total_entries: DocumentationEntry.lexicon_entries.count
          }
        else
          render json: {
            success: false,
            error: 'Export failed'
          }, status: :internal_server_error
        end
      end

      # POST /api/v1/documentation_entries/export_teacher
      # Exports Teacher (component/feature/etc) entries to TRAPID_TEACHER.md
      def export_teacher
        result = system("cd #{Rails.root} && bundle exec rake trapid:export_teacher")

        if result
          render json: {
            success: true,
            message: 'Teacher exported to TRAPID_TEACHER.md successfully',
            file_path: Rails.root.join('..', 'TRAPID_DOCS', 'TRAPID_TEACHER.md').to_s,
            total_entries: DocumentationEntry.teacher_entries.count
          }
        else
          render json: {
            success: false,
            error: 'Export failed'
          }, status: :internal_server_error
        end
      end

      private

      def set_documentation_entry
        @entry = DocumentationEntry.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: {
          success: false,
          error: 'Documentation entry not found'
        }, status: :not_found
      end

      def entry_params
        params.require(:documentation_entry).permit(
          :category,
          :chapter_number,
          :chapter_name,
          :section_number,
          :component,
          :title,
          :entry_type,
          # Bug-specific fields (Lexicon)
          :status,
          :severity,
          :first_reported,
          :last_occurred,
          :fixed_date,
          :scenario,
          :root_cause,
          :solution,
          :prevention,
          # Teacher-specific fields
          :difficulty,
          :summary,
          :code_example,
          :common_mistakes,
          :testing_strategy,
          :related_rules,
          # Universal fields
          :description,
          :details,
          :examples,
          :recommendations,
          :rule_reference,
          metadata: {}
        )
      end

      def entry_json(entry, detailed: false)
        base = {
          id: entry.id,
          category: entry.category,
          chapter_number: entry.chapter_number,
          chapter_name: entry.chapter_name,
          section_number: entry.section_number,
          section_display: entry.section_display,
          full_title: entry.full_title,
          component: entry.component,
          title: entry.title,
          entry_type: entry.entry_type,
          type_display: entry.type_display,
          type_emoji: entry.type_emoji,
          # Lexicon fields
          status: entry.status,
          status_display: entry.status_display,
          severity: entry.severity,
          severity_display: entry.severity_display,
          first_reported: entry.first_reported,
          last_occurred: entry.last_occurred,
          fixed_date: entry.fixed_date,
          # Teacher fields
          difficulty: entry.difficulty,
          difficulty_display: entry.difficulty_display,
          summary: entry.summary,
          # Meta
          bible_entry: entry.bible_entry?,
          lexicon_entry: entry.lexicon_entry?,
          teacher_entry: entry.teacher_entry?
        }

        if detailed
          base.merge({
            # Lexicon detailed fields
            scenario: entry.scenario,
            root_cause: entry.root_cause,
            solution: entry.solution,
            prevention: entry.prevention,
            # Teacher detailed fields
            code_example: entry.code_example,
            common_mistakes: entry.common_mistakes,
            testing_strategy: entry.testing_strategy,
            related_rules: entry.related_rules,
            # Universal fields
            description: entry.description,
            details: entry.details,
            examples: entry.examples,
            recommendations: entry.recommendations,
            rule_reference: entry.rule_reference,
            metadata: entry.metadata,
            created_at: entry.created_at,
            updated_at: entry.updated_at
          })
        else
          base
        end
      end
    end
  end
end
