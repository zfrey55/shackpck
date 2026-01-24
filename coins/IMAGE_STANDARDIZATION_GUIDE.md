# Image Standardization Guide

## Current Implementation

I've updated the `RepackCard` component to use `object-contain` instead of `object-cover`. This means:

✅ **All images will display fully** - no cropping
✅ **All cards are uniform size** - consistent 4:3 aspect ratio
✅ **Images maintain their original aspect ratio** - tall images stay tall, square images stay square
✅ **Dark background** - any empty space (letterboxing/pillarboxing) uses a dark background that matches the card

## How It Works

- **Container**: Fixed 4:3 aspect ratio (`aspect-[4/3]`)
- **Image Display**: `object-contain` - images scale to fit within the container while maintaining their aspect ratio
- **Background**: Dark slate background (`bg-slate-950`) fills any empty space

## Image Files in Folder

Current images have mixed formats and likely different dimensions:
- `.png` files: reign, prominence, apex, currencyclash, aura
- `.jpg` files: starter, deluxe, xtreme, unleashed, resurgence, transcendent
- `.PNG` files: ignite, eclipse, radiant
- `.jpeg` file: transcscendenttransformed (note: typo in filename)

## For Best Results (Optional)

If you want even more consistency, you could:

1. **Standardize all images to the same format** (recommend `.png` or `.jpg`)
2. **Resize all images to the same dimensions** (e.g., 800x600px for 4:3 ratio, or 600x600px for square)
3. **Use consistent file naming** (all lowercase, consistent format)

### Recommended Image Specifications:
- **Format**: PNG or JPG
- **Dimensions**: 800x600px (4:3 ratio) or 600x600px (square)
- **File naming**: `shackpack-[name].png` (all lowercase, consistent extension)

### Tools for Standardization:
- **Online**: Canva, Photopea, or similar image editors
- **Desktop**: Photoshop, GIMP, or ImageMagick
- **Batch processing**: ImageMagick command line or similar tools

## Current Status

✅ Aura pack added to homepage and repacks page
✅ Image display standardized with `object-contain`
✅ All cards now have uniform appearance

The website will now display all pack images consistently, with each image fitting within the card without cropping.

