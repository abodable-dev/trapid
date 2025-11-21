module Api
  module V1
    class CompaniesController < ApplicationController
      before_action :set_company, only: [:show, :update, :destroy, :directors, :add_director, :remove_director,
                                          :bank_accounts, :compliance_items, :documents, :activities]

      def index
        @companies = Company.all
        @companies = @companies.by_group(params[:group]) if params[:group].present?
        @companies = @companies.where(status: params[:status]) if params[:status].present?
        @companies = @companies.where("name ILIKE ? OR acn LIKE ? OR abn LIKE ?",
                                      "%#{params[:search]}%", "%#{params[:search]}%", "%#{params[:search]}%") if params[:search].present?

        @companies = @companies.with_directors.includes(:xero_connection)

        render json: { companies: @companies.as_json(include: {
          current_directors: { only: [:id, :full_name] },
          xero_connection: { only: [:id, :connected] }
        }, methods: [:formatted_acn, :formatted_abn, :has_xero_connection]) }
      end

      def show
        render json: { company: @company.as_json(include: {
          current_directors: { only: [:id, :full_name, :email, :phone] },
          bank_accounts: { only: [:id, :account_name, :bank_name, :bsb, :account_number, :is_primary] },
          xero_connection: { only: [:id, :connected, :last_sync_at] }
        }, methods: [:formatted_acn, :formatted_abn]) }
      end

      def create
        @company = Company.new(company_params)

        if @company.save
          render json: { company: @company, message: 'Company created successfully' }, status: :created
        else
          render json: { errors: @company.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @company.update(company_params)
          render json: { company: @company, message: 'Company updated successfully' }
        else
          render json: { errors: @company.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @company.destroy
        render json: { message: 'Company deleted successfully' }
      end

      def directors
        render json: { directors: @company.current_directors }
      end

      def add_director
        director = CompanyDirector.new(
          company: @company,
          contact_id: params[:contact_id],
          position: params[:position],
          appointment_date: params[:appointment_date] || Date.today
        )

        if director.save
          render json: { director: director, message: 'Director added successfully' }, status: :created
        else
          render json: { errors: director.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def remove_director
        director = @company.company_directors.current.find_by(contact_id: params[:director_id])

        if director
          director.update(is_current: false, resignation_date: Date.today)
          render json: { message: 'Director removed successfully' }
        else
          render json: { error: 'Director not found' }, status: :not_found
        end
      end

      def bank_accounts
        render json: { bank_accounts: @company.bank_accounts }
      end

      def compliance_items
        items = @company.compliance_items
        items = items.due_soon(params[:days].to_i) if params[:due_soon] == 'true'

        render json: { compliance_items: items.as_json(include: :company, methods: [:is_overdue, :days_until_due]) }
      end

      def documents
        render json: { documents: @company.documents.recent }
      end

      def activities
        render json: { activities: @company.activities.recent.includes(:user) }
      end

      private

      def set_company
        @company = Company.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Company not found' }, status: :not_found
      end

      def company_params
        params.require(:company).permit(
          :name, :company_group, :acn, :abn, :tfn, :status, :date_incorporated,
          :registered_office_address, :principal_place_of_business, :is_trustee, :trust_name,
          :gst_registration_status, :asic_username, :asic_password, :asic_recovery_question,
          :asic_recovery_answer, :asic_last_review_date, :asic_next_review_date, :notes
        )
      end
    end
  end
end
