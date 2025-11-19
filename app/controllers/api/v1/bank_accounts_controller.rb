module Api
  module V1
    class BankAccountsController < ApplicationController
      before_action :set_bank_account, only: [:show, :update, :destroy]

      def index
        @bank_accounts = BankAccount.all
        @bank_accounts = @bank_accounts.where(company_id: params[:company_id]) if params[:company_id].present?

        @bank_accounts = @bank_accounts.includes(:company)

        render json: { bank_accounts: @bank_accounts.as_json(include: :company) }
      end

      def show
        render json: { bank_account: @bank_account.as_json(include: :company) }
      end

      def create
        @bank_account = BankAccount.new(bank_account_params)

        if @bank_account.save
          render json: { bank_account: @bank_account, message: 'Bank account created successfully' }, status: :created
        else
          render json: { errors: @bank_account.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @bank_account.update(bank_account_params)
          render json: { bank_account: @bank_account, message: 'Bank account updated successfully' }
        else
          render json: { errors: @bank_account.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @bank_account.destroy
        render json: { message: 'Bank account deleted successfully' }
      end

      private

      def set_bank_account
        @bank_account = BankAccount.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Bank account not found' }, status: :not_found
      end

      def bank_account_params
        params.require(:bank_account).permit(
          :company_id, :account_name, :bank_name, :bsb, :account_number,
          :account_type, :is_primary, :notes
        )
      end
    end
  end
end
