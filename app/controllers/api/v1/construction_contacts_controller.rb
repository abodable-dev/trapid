module Api
  module V1
    class ConstructionContactsController < ApplicationController
      before_action :set_construction
      before_action :set_construction_contact, only: [:update, :destroy]

      # GET /api/v1/constructions/:construction_id/construction_contacts
      def index
        @construction_contacts = @construction.construction_contacts
                                              .includes(contact: :outgoing_relationships)
                                              .order(primary: :desc, created_at: :asc)

        contacts_data = @construction_contacts.map do |cc|
          {
            id: cc.id,
            contact_id: cc.contact_id,
            primary: cc.primary,
            role: cc.role,
            contact: cc.contact.as_json(
              only: [:id, :first_name, :last_name, :full_name, :company_name, :email, :mobile_phone, :office_phone]
            ),
            relationships_count: cc.contact.outgoing_relationships.count
          }
        end

        render json: { construction_contacts: contacts_data }
      end

      # POST /api/v1/constructions/:construction_id/construction_contacts
      def create
        @construction_contact = @construction.construction_contacts.build(construction_contact_params)

        # If this is marked as primary, unmark all other primary contacts first
        if @construction_contact.primary
          @construction.construction_contacts.update_all(primary: false)
        end

        if @construction_contact.save
          # Return the contact with relationship count
          contact_data = {
            id: @construction_contact.id,
            contact_id: @construction_contact.contact_id,
            primary: @construction_contact.primary,
            role: @construction_contact.role,
            contact: @construction_contact.contact.as_json(
              only: [:id, :first_name, :last_name, :full_name, :company_name, :email, :mobile_phone, :office_phone]
            ),
            relationships_count: @construction_contact.contact.outgoing_relationships.count
          }

          render json: contact_data, status: :created
        else
          render json: { errors: @construction_contact.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /api/v1/constructions/:construction_id/construction_contacts/:id
      def update
        # If changing to primary, unmark all other primary contacts first
        if construction_contact_params[:primary] == true || construction_contact_params[:primary] == "true"
          @construction.construction_contacts.where.not(id: @construction_contact.id).update_all(primary: false)
        end

        if @construction_contact.update(construction_contact_params)
          # Return the contact with relationship count
          contact_data = {
            id: @construction_contact.id,
            contact_id: @construction_contact.contact_id,
            primary: @construction_contact.primary,
            role: @construction_contact.role,
            contact: @construction_contact.contact.as_json(
              only: [:id, :first_name, :last_name, :full_name, :company_name, :email, :mobile_phone, :office_phone]
            ),
            relationships_count: @construction_contact.contact.outgoing_relationships.count
          }

          render json: contact_data
        else
          render json: { errors: @construction_contact.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/constructions/:construction_id/construction_contacts/:id
      def destroy
        # Prevent deleting the last contact
        if @construction.construction_contacts.count <= 1
          render json: { error: 'Cannot remove the last contact from a job. At least one contact is required.' }, status: :unprocessable_entity
          return
        end

        # If deleting the primary contact, make the next contact primary
        if @construction_contact.primary
          next_contact = @construction.construction_contacts.where.not(id: @construction_contact.id).first
          next_contact&.update(primary: true)
        end

        @construction_contact.destroy
        head :no_content
      end

      private

      def set_construction
        @construction = Construction.find(params[:construction_id])
      end

      def set_construction_contact
        @construction_contact = @construction.construction_contacts.find(params[:id])
      end

      def construction_contact_params
        params.require(:construction_contact).permit(:contact_id, :primary, :role)
      end
    end
  end
end
