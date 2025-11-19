module Api
  module V1
    class AssetsController < ApplicationController
      before_action :set_asset, only: [:show, :update, :destroy, :insurance, :add_insurance, :service_history, :add_service]

      def index
        @assets = Asset.all
        @assets = @assets.for_company(params[:company_id]) if params[:company_id].present?
        @assets = @assets.by_type(params[:asset_type]) if params[:asset_type].present?
        @assets = @assets.where(status: params[:status]) if params[:status].present?
        @assets = @assets.needs_attention if params[:needs_attention] == 'true'

        @assets = @assets.includes(:company, :current_insurance)

        render json: { assets: @assets.as_json(include: :company) }
      end

      def show
        render json: { asset: @asset.as_json(include: [:company, :current_insurance]) }
      end

      def create
        @asset = Asset.new(asset_params)

        if @asset.save
          render json: { asset: @asset, message: 'Asset created successfully' }, status: :created
        else
          render json: { errors: @asset.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @asset.update(asset_params)
          render json: { asset: @asset, message: 'Asset updated successfully' }
        else
          render json: { errors: @asset.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @asset.destroy
        render json: { message: 'Asset deleted successfully' }
      end

      def insurance
        render json: { insurance_policies: @asset.insurance_policies.order(expiry_date: :desc) }
      end

      def add_insurance
        insurance = @asset.insurance_policies.new(insurance_params)

        if insurance.save
          render json: { insurance: insurance, message: 'Insurance added successfully' }, status: :created
        else
          render json: { errors: insurance.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def service_history
        render json: { service_records: @asset.service_records.recent }
      end

      def add_service
        service = @asset.service_records.new(service_params)

        if service.save
          render json: { service: service, message: 'Service record added successfully' }, status: :created
        else
          render json: { errors: service.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_asset
        @asset = Asset.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Asset not found' }, status: :not_found
      end

      def asset_params
        params.require(:asset).permit(
          :company_id, :description, :asset_type, :make, :model, :year, :vin, :registration,
          :purchase_date, :purchase_price, :current_value, :depreciation_rate, :status,
          :disposal_date, :disposal_value, :notes, :photo_url
        )
      end

      def insurance_params
        params.require(:insurance).permit(
          :insurance_company, :policy_number, :insurance_type, :start_date, :expiry_date,
          :premium_amount, :premium_frequency, :coverage_amount, :notes
        )
      end

      def service_params
        params.require(:service_record).permit(
          :service_type, :service_date, :service_provider, :description, :cost,
          :odometer_reading, :next_service_date, :next_service_odometer, :notes
        )
      end
    end
  end
end
