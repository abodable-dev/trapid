# frozen_string_literal: true

module Api
  module V1
    class BibleRulesController < ApplicationController
      skip_before_action :authorize_request, only: [:index, :show, :stats]
      before_action :set_bible_rule, only: [:show, :update, :destroy]

      # GET /api/v1/bible_rules
      # Query params:
      #   ?chapter=3
      #   ?rule_type=MUST|NEVER|ALWAYS|PROTECTED|CONFIG
      #   ?search=table
      def index
        @rules = BibleRule.all

        @rules = @rules.by_chapter(params[:chapter]) if params[:chapter].present?
        @rules = @rules.by_rule_type(params[:rule_type]) if params[:rule_type].present?
        @rules = @rules.search(params[:search]) if params[:search].present?

        @rules = @rules.ordered.limit(500)

        render json: {
          success: true,
          data: @rules.map { |rule| rule_json(rule) },
          total: @rules.count
        }
      end

      # GET /api/v1/bible_rules/:id
      def show
        render json: {
          success: true,
          data: rule_json(@rule, detailed: true)
        }
      end

      # POST /api/v1/bible_rules
      def create
        @rule = BibleRule.new(rule_params)

        if @rule.save
          render json: {
            success: true,
            data: rule_json(@rule, detailed: true),
            message: 'Bible rule created successfully'
          }, status: :created
        else
          render json: {
            success: false,
            errors: @rule.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # PATCH /api/v1/bible_rules/:id
      def update
        if @rule.update(rule_params)
          render json: {
            success: true,
            data: rule_json(@rule, detailed: true),
            message: 'Bible rule updated successfully'
          }
        else
          render json: {
            success: false,
            errors: @rule.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/bible_rules/:id
      def destroy
        @rule.destroy
        render json: {
          success: true,
          message: 'Bible rule deleted successfully'
        }
      end

      # GET /api/v1/bible_rules/stats
      # Returns statistics about rules per chapter
      def stats
        stats = {
          total_rules: BibleRule.count,
          by_type: BibleRule.group(:rule_type).count,
          by_chapter: BibleRule.group(:chapter_number, :chapter_name).count.map do |(num, name), count|
            {
              chapter_number: num,
              chapter_name: name,
              total_count: count,
              must_count: BibleRule.by_chapter(num).must_rules.count,
              never_count: BibleRule.by_chapter(num).never_rules.count,
              always_count: BibleRule.by_chapter(num).always_rules.count,
              protected_count: BibleRule.by_chapter(num).protected_rules.count,
              config_count: BibleRule.by_chapter(num).config_rules.count
            }
          end.sort_by { |c| c[:chapter_number] }
        }

        render json: {
          success: true,
          data: stats
        }
      end

      # POST /api/v1/bible_rules/export
      # Exports Bible rules to TRAPID_BIBLE.md
      def export
        result = system("cd #{Rails.root} && bundle exec rake trapid:export_bible")

        if result
          render json: {
            success: true,
            message: 'Bible exported to TRAPID_BIBLE.md successfully',
            file_path: Rails.root.join('..', 'TRAPID_DOCS', 'TRAPID_BIBLE.md').to_s,
            total_rules: BibleRule.count
          }
        else
          render json: {
            success: false,
            error: 'Export failed'
          }, status: :internal_server_error
        end
      end

      private

      def set_bible_rule
        @rule = BibleRule.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: {
          success: false,
          error: 'Bible rule not found'
        }, status: :not_found
      end

      def rule_params
        params.require(:bible_rule).permit(
          :chapter_number,
          :chapter_name,
          :rule_number,
          :title,
          :rule_type,
          :description,
          :code_example,
          :cross_references,
          :sort_order
        )
      end

      def rule_json(rule, detailed: false)
        base = {
          id: rule.id,
          chapter_number: rule.chapter_number,
          chapter_name: rule.chapter_name,
          rule_number: rule.rule_number,
          rule_display: rule.rule_display,
          title: rule.title,
          full_title: rule.full_title,
          rule_type: rule.rule_type,
          type_display: rule.type_display,
          type_emoji: rule.type_emoji,
          sort_order: rule.sort_order
        }

        if detailed
          base.merge({
            description: rule.description,
            code_example: rule.code_example,
            cross_references: rule.cross_references,
            search_text: rule.search_text,
            created_at: rule.created_at,
            updated_at: rule.updated_at
          })
        else
          base
        end
      end
    end
  end
end
