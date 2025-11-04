# 🖼️ Automated Product Image Scraping System

## Overview
Fully automated system to fetch and store product images for all 5,000+ pricebook items using web scraping and Cloudinary CDN.

## ✅ What's Been Built

### Database
- Added `image_url`, `image_source`, `image_fetched_at`, `image_fetch_status` columns to `pricebook_items`
- Tracks image fetch progress and status for each item

### Backend Services
1. **ProductImageScraper** (`app/services/product_image_scraper.rb`)
   - Searches DuckDuckGo/Google for product images
   - Downloads and uploads images to Cloudinary
   - Automatic image optimization and CDN delivery
   - Error handling and retry logic

2. **Background Jobs**
   - `FetchProductImageJob` - Fetch image for single item
   - `FetchAllImagesJob` - Batch process all items
   - `FetchSupplierImagesJob` - Process items for specific supplier

### API Endpoints

#### 1. Fetch Single Item Image
```bash
POST /api/v1/pricebook/:id/fetch_image
```

Response:
```json
{
  "success": true,
  "message": "Image fetch queued for Decina Novara Bath 1525mm",
  "item": { ... }
}
```

#### 2. Manually Set Image
```bash
POST /api/v1/pricebook/:id/update_image
Content-Type: application/json

{
  "image_url": "https://example.com/product.jpg"
}
```

#### 3. Batch Fetch All Images
```bash
# Fetch for all items (limit: 100)
POST /api/v1/pricebook/fetch_all_images?limit=100

# Fetch for specific supplier
POST /api/v1/pricebook/fetch_all_images?supplier_id=47&limit=50
```

Response:
```json
{
  "success": true,
  "message": "Image fetch queued for all items (limit: 100)",
  "stats": {
    "total": 5287,
    "with_images": 0,
    "without_images": 5287,
    "pending": 5287,
    "fetching": 0,
    "failed": 0,
    "percentage_complete": 0.0
  }
}
```

#### 4. Get Image Statistics
```bash
GET /api/v1/pricebook/image_stats
```

Response:
```json
{
  "total": 5287,
  "with_images": 1250,
  "without_images": 4037,
  "pending": 3800,
  "fetching": 12,
  "failed": 225,
  "percentage_complete": 23.64
}
```

## 🚀 How to Use

### Option 1: Fetch All Images (Recommended for First Run)
```bash
curl -X POST "https://trapid-backend-447058022b51.herokuapp.com/api/v1/pricebook/fetch_all_images?limit=100"
```

This will:
1. Queue background jobs for 100 items
2. Each job searches for product image
3. Downloads and uploads to Cloudinary
4. Saves image URL to database

**Note:** Run this multiple times to process all 5,000+ items in batches of 100.

### Option 2: Fetch for Specific Supplier
```bash
curl -X POST "https://trapid-backend-447058022b51.herokuapp.com/api/v1/pricebook/fetch_all_images?supplier_id=47&limit=50"
```

### Option 3: Fetch Single Item
```bash
curl -X POST "https://trapid-backend-447058022b51.herokuapp.com/api/v1/pricebook/275/fetch_image"
```

### Check Progress
```bash
curl "https://trapid-backend-447058022b51.herokuapp.com/api/v1/pricebook/image_stats"
```

## 🎯 Image Search Strategy

The system searches for images using:
1. **Supplier Name** + **Item Code** + **Item Name** + "product"
2. Example: "Harvey Norman Commercial QLD SSFL Abey Flushline Laundry Tub product"

### Image Sources
- DuckDuckGo Image Search (primary, no API key needed)
- Google Custom Search (optional, requires API key for better results)

### Image Selection
- Currently: First valid, accessible image
- **TODO**: Integrate Claude AI to analyze and select best image

## 📦 Cloudinary Integration

### Storage
- **Cloud Name:** dtg6d2c7h
- **Free Tier:** 25 GB storage, 25 GB bandwidth/month
- **Current Usage:** 0/5,287 items (~10 GB estimated)

### Image Optimization
Cloudinary automatically:
- Compresses images (50-70% size reduction)
- Converts to WebP format
- Serves from global CDN
- Generates thumbnails on-demand

### Image URLs
Format: `https://res.cloudinary.com/dtg6d2c7h/image/upload/v{version}/pricebook_items/item_{id}.jpg`

## 🔄 Status Tracking

Each item has an `image_fetch_status`:
- `null` / `pending` - Not yet processed
- `fetching` - Currently searching/downloading
- `success` - Image successfully fetched and uploaded
- `failed` - Could not find or upload image

## 🛠️ Configuration

### Environment Variables (Already Set on Heroku)
```bash
CLOUDINARY_CLOUD_NAME=dtg6d2c7h
CLOUDINARY_API_KEY=895213223838643
CLOUDINARY_API_SECRET=Cl1Ufiux0DQMBnkDSUvfdrG-XVo
```

### Optional (for better image search results)
```bash
GOOGLE_SEARCH_API_KEY=your_key_here
GOOGLE_SEARCH_CX=your_cx_here
```

## 📊 Expected Results

For 5,287 items:
- **Success Rate:** ~70-80% (3,700-4,200 items)
- **Failed:** ~20-30% (800-1,000 items - generic/obscure products)
- **Processing Time:** ~1-2 hours for all items (with rate limiting)

## 🚨 Rate Limiting

- Sleep 1 second between requests
- Process 100 items per batch
- Prevents overwhelming search engines
- Can be adjusted in `ProductImageScraper`

## 🔜 Future Enhancements

1. **Claude AI Integration**
   - Analyze multiple image candidates
   - Select most relevant product image
   - Filter out logos, unrelated images

2. **Supplier Website Scraping**
   - Direct scraping from supplier websites
   - Higher quality, more relevant images

3. **Image Quality Validation**
   - Check minimum resolution
   - Detect and reject low-quality images

4. **Bulk Upload Interface**
   - Manual CSV upload with image URLs
   - Drag-and-drop image upload

## 📝 Example Usage Script

### Fetch All Images in Batches
```bash
#!/bin/bash

API_URL="https://trapid-backend-447058022b51.herokuapp.com/api/v1"

# Get total count
stats=$(curl -s "$API_URL/pricebook/image_stats")
total=$(echo $stats | jq '.without_images')

echo "Items without images: $total"

# Process in batches of 100
batches=$((total / 100 + 1))
echo "Processing $batches batches..."

for i in $(seq 1 $batches); do
  echo "Batch $i/$batches"
  curl -X POST "$API_URL/pricebook/fetch_all_images?limit=100"

  # Wait between batches
  sleep 30

  # Check progress
  curl -s "$API_URL/pricebook/image_stats" | jq '.percentage_complete'
done

echo "✓ Complete!"
```

## 🎨 Frontend Integration (Next Steps)

1. Display images in price book list
2. Show placeholder for items without images
3. Add "Fetch Image" button for single items
4. Show progress bar for batch operations
5. Allow manual image upload

## 📞 Support

For issues or questions:
- Check Heroku logs: `heroku logs --tail --app trapid-backend`
- Review background job status in SolidQueue
- Check Cloudinary dashboard for storage usage

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Date: November 4, 2025
Version: v44 (Production)
