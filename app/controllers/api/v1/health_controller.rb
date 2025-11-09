module Api
  module V1
    class HealthController < ApplicationController
      def pricebook
        # Get pricebook items without default supplier
        items_without_default_supplier = PricebookItem.active
          .where(default_supplier_id: nil)
          .select(:id, :item_code, :item_name, :category, :current_price)
          .order(:item_code)

        # Find suppliers with incomplete category coverage
        # A supplier has incomplete coverage if they have price history for SOME items in a category
        # but not ALL items in that category
        incomplete_suppliers = find_suppliers_with_incomplete_categories

        render json: {
          itemsWithoutDefaultSupplier: {
            count: items_without_default_supplier.count,
            items: items_without_default_supplier.limit(100)
          },
          suppliersWithIncompleteCategoryPricing: {
            count: incomplete_suppliers.length,
            suppliers: incomplete_suppliers
          }
        }
      end

      private

      def find_suppliers_with_incomplete_categories
        results = []

        # Get all suppliers who have price history
        supplier_ids = PriceHistory.where.not(supplier_id: nil).distinct.pluck(:supplier_id)

        supplier_ids.each do |supplier_id|
          supplier = Contact.find_by(id: supplier_id)
          next unless supplier

          # Get categories this supplier has price history for
          categories = PriceHistory
            .joins(:pricebook_item)
            .where(supplier_id: supplier_id)
            .where(pricebook_items: { is_active: true })
            .distinct
            .pluck('pricebook_items.category')
            .compact

          categories.each do |category|
            # Count total active items in this category
            total_items = PricebookItem.active.where(category: category).count

            # Count items this supplier has price history for in this category
            supplier_items = PriceHistory
              .joins(:pricebook_item)
              .where(supplier_id: supplier_id)
              .where(pricebook_items: { category: category, is_active: true })
              .distinct
              .count('pricebook_items.id')

            # If supplier has some but not all items, flag it
            if supplier_items > 0 && supplier_items < total_items
              results << {
                supplier: {
                  id: supplier.id,
                  name: supplier.name
                },
                category: category,
                items_with_pricing: supplier_items,
                total_items_in_category: total_items,
                coverage_percentage: ((supplier_items.to_f / total_items) * 100).round(1),
                missing_items_count: total_items - supplier_items
              }
            end
          end
        end

        # Sort by missing items count (descending) then by category
        results.sort_by { |r| [-r[:missing_items_count], r[:category], r[:supplier][:name]] }
      end
    end
  end
end
