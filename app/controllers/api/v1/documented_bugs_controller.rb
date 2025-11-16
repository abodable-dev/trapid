# frozen_string_literal: true

module Api
  module V1
    class DocumentedBugsController < ApplicationController
      skip_before_action :authorize_request, only: [:index, :show, :stats]
      before_action :set_documented_bug, only: [:show, :update, :destroy]

      # GET /api/v1/documented_bugs
      # Query params:
      #   ?chapter=3
      #   ?type=bug|architecture|test|performance|dev_note|common_issue
      #   ?status=open (only for bugs)
      #   ?severity=critical (only for bugs)
      #   ?search=xero sync
      def index
        @bugs = DocumentedBug.all

        @bugs = @bugs.by_chapter(params[:chapter]) if params[:chapter].present?
        @bugs = @bugs.by_type(params[:type]) if params[:type].present?
        @bugs = @bugs.by_status(params[:status]) if params[:status].present?
        @bugs = @bugs.by_severity(params[:severity]) if params[:severity].present?
        @bugs = @bugs.search(params[:search]) if params[:search].present?

        @bugs = @bugs.recent.limit(100)

        render json: {
          success: true,
          data: @bugs.map { |bug| bug_json(bug) },
          total: @bugs.count
        }
      end

      # GET /api/v1/documented_bugs/:id
      def show
        render json: {
          success: true,
          data: bug_json(@bug, detailed: true)
        }
      end

      # POST /api/v1/documented_bugs
      def create
        @bug = DocumentedBug.new(bug_params)

        if @bug.save
          render json: {
            success: true,
            data: bug_json(@bug, detailed: true),
            message: 'Bug documented successfully'
          }, status: :created
        else
          render json: {
            success: false,
            errors: @bug.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # PATCH /api/v1/documented_bugs/:id
      def update
        if @bug.update(bug_params)
          render json: {
            success: true,
            data: bug_json(@bug, detailed: true),
            message: 'Bug updated successfully'
          }
        else
          render json: {
            success: false,
            errors: @bug.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/documented_bugs/:id
      def destroy
        @bug.destroy
        render json: {
          success: true,
          message: 'Bug deleted successfully'
        }
      end

      # GET /api/v1/documented_bugs/stats
      # Returns statistics about bugs per chapter
      def stats
        stats = {
          total_bugs: DocumentedBug.count,
          by_type: DocumentedBug.group(:knowledge_type).count,
          by_status: DocumentedBug.group(:status).count,
          by_severity: DocumentedBug.group(:severity).count,
          by_chapter: DocumentedBug.group(:chapter_number, :chapter_name).count.map do |(num, name), count|
            {
              chapter_number: num,
              chapter_name: name,
              bug_count: count,
              open_count: DocumentedBug.by_chapter(num).open_bugs.count,
              critical_count: DocumentedBug.by_chapter(num).critical_bugs.count
            }
          end.sort_by { |c| c[:chapter_number] }
        }

        render json: {
          success: true,
          data: stats
        }
      end

      # POST /api/v1/documented_bugs/export_to_markdown
      # Exports Lexicon database to markdown file
      def export_to_markdown
        result = system("cd #{Rails.root} && bundle exec rake trapid:export_lexicon")

        if result
          render json: {
            success: true,
            message: 'Lexicon exported to TRAPID_LEXICON.md successfully',
            file_path: Rails.root.join('..', 'TRAPID_DOCS', 'TRAPID_LEXICON.md').to_s,
            total_entries: DocumentedBug.count
          }
        else
          render json: {
            success: false,
            error: 'Export failed'
          }, status: :internal_server_error
        end
      end

      private

      def set_documented_bug
        @bug = DocumentedBug.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: {
          success: false,
          error: 'Bug not found'
        }, status: :not_found
      end

      def bug_params
        params.require(:documented_bug).permit(
          :chapter_number,
          :chapter_name,
          :component,
          :bug_title,
          :knowledge_type,
          # Bug-specific fields
          :status,
          :severity,
          :first_reported,
          :last_occurred,
          :fixed_date,
          :scenario,
          :root_cause,
          :solution,
          :prevention,
          # Universal fields
          :description,
          :details,
          :examples,
          :recommendations,
          :rule_reference,
          metadata: {}
        )
      end

      def bug_json(bug, detailed: false)
        base = {
          id: bug.id,
          chapter_number: bug.chapter_number,
          chapter_name: bug.chapter_name,
          component: bug.component,
          bug_title: bug.bug_title,
          knowledge_type: bug.knowledge_type,
          type_display: bug.type_display,
          # Bug-specific fields (nil for other types)
          status: bug.status,
          status_display: bug.status_display,
          severity: bug.severity,
          severity_display: bug.severity_display,
          first_reported: bug.first_reported,
          last_occurred: bug.last_occurred,
          fixed_date: bug.fixed_date
        }

        if detailed
          base.merge({
            # Old bug fields
            scenario: bug.scenario,
            root_cause: bug.root_cause,
            solution: bug.solution,
            prevention: bug.prevention,
            # New universal fields
            description: bug.description,
            details: bug.details,
            examples: bug.examples,
            recommendations: bug.recommendations,
            rule_reference: bug.rule_reference,
            metadata: bug.metadata,
            created_at: bug.created_at,
            updated_at: bug.updated_at
          })
        else
          base
        end
      end
    end
  end
end
