module Api
  module V1
    class HealthController < ApplicationController
      def pricebook
        # Get pricebook items without default supplier
        items_without_default_supplier = PricebookItem.active
          .where(default_supplier_id: nil)
          .select(:id, :item_code, :item_name, :category, :current_price)
          .order(:item_code)

        render json: {
          itemsWithoutDefaultSupplier: {
            count: items_without_default_supplier.count,
            items: items_without_default_supplier.limit(100)
          }
        }
      end
    end
  end
end
