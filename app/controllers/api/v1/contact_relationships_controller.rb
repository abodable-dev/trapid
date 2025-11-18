module Api
  module V1
    class ContactRelationshipsController < ApplicationController
      before_action :set_contact
      before_action :set_relationship, only: [:show, :update, :destroy]

      # GET /api/v1/contacts/:contact_id/relationships
      def index
        @relationships = @contact.outgoing_relationships.includes(:related_contact)
        render json: { relationships: @relationships.map { |rel| serialize_relationship(rel) } }
      end

      # GET /api/v1/contacts/:contact_id/relationships/:id
      def show
        render json: serialize_relationship(@relationship)
      end

      # POST /api/v1/contacts/:contact_id/relationships
      def create
        @relationship = @contact.outgoing_relationships.build(relationship_params)

        if @relationship.save
          render json: serialize_relationship(@relationship), status: :created
        else
          render json: { errors: @relationship.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /api/v1/contacts/:contact_id/relationships/:id
      def update
        if @relationship.update(relationship_params)
          render json: serialize_relationship(@relationship)
        else
          render json: { errors: @relationship.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/contacts/:contact_id/relationships/:id
      def destroy
        @relationship.destroy
        head :no_content
      end

      private

      def set_contact
        @contact = Contact.find(params[:contact_id])
      end

      def set_relationship
        @relationship = @contact.outgoing_relationships.find(params[:id])
      end

      def relationship_params
        params.require(:contact_relationship).permit(:related_contact_id, :relationship_type, :notes)
      end

      def serialize_relationship(relationship)
        {
          id: relationship.id,
          source_contact_id: relationship.source_contact_id,
          related_contact_id: relationship.related_contact_id,
          relationship_type: relationship.relationship_type,
          notes: relationship.notes,
          created_at: relationship.created_at,
          updated_at: relationship.updated_at,
          related_contact: {
            id: relationship.related_contact.id,
            full_name: relationship.related_contact.display_name,
            email: relationship.related_contact.email,
            phone: relationship.related_contact.primary_phone,
            contact_types: relationship.related_contact.contact_types
          }
        }
      end
    end
  end
end
