# 📸 How to Upload Your Pack Images and Coin Lists

## 🖼️ UPLOADING PACK IMAGES

### Step 1: Prepare Your Images
1. Take clear photos of your 4 pack types
2. Recommended specs:
   - Size: 800x600 pixels (or similar 4:3 ratio)
   - Format: JPG or PNG
   - File size: Keep under 500KB each
   - Quality: High resolution, well-lit photos

### Step 2: Name Your Files
Name them **exactly** like this:
- `shackpack-starter.jpg`
- `shackpack-deluxe.jpg`
- `shackpack-xtreme.jpg`
- `shackpack-elite.jpg`

### Step 3: Upload to Folder
**Location:** `coins/public/images/packs/`

On Windows:
1. Open File Explorer
2. Navigate to: `C:\Users\zfrey\OneDrive\Desktop\Shackpck\coins\public\images\packs\`
3. Drag and drop your 4 image files here

### Step 4: Update Code (OPTIONAL - I can do this for you)
If you want to update the code yourself:

**File:** `coins/app/page.tsx` (Line 10, 18, 26, 34)
**File:** `coins/app/repacks/page.tsx` (Line 9, 17, 25, 33)

Change from:
```tsx
image: 'https://images.unsplash.com/photo-...'
```

To:
```tsx
image: '/images/packs/shackpack-starter.jpg'
```

Do this for all 4 packs in both files.

**OR** just tell me you've uploaded the images and I'll update the code for you! ✅

---

## 📋 UPLOADING COIN LISTS - 3 OPTIONS

### OPTION 1: Google Sheets (RECOMMENDED ⭐)

**Pros:** Easy to update, searchable, sortable, no file upload needed

#### Step-by-Step:
1. **Create Google Sheet:**
   - Go to sheets.google.com
   - Create a new spreadsheet
   - Name it: "Shackpack Starter - Coin List" (or whatever pack)

2. **Add Your Coin Data:**
   Create columns like:
   | Coin Name | Year | Metal | Weight | Purity | Mint Mark | Country | Grade | Rarity | Notes |
   |-----------|------|-------|--------|--------|-----------|---------|-------|--------|-------|
   | American Eagle | 2023 | Gold | 1 oz | .9999 | - | USA | MS70 | Common | Beautiful condition |
   | Silver Maple | 2022 | Silver | 1 oz | .9999 | - | Canada | BU | Common | Brilliant uncirculated |
   
3. **Make it Public:**
   - Click "Share" button (top right)
   - Change "Restricted" to "Anyone with the link"
   - Set permission to "Viewer"
   - Copy the link

4. **Give Me the Link:**
   Send me the Google Sheet link and tell me which pack it's for, and I'll add it to your website!

   **OR** update it yourself in `coins/app/checklist/page.tsx`:
   - Line 11: Starter pack
   - Line 22: Deluxe pack
   - Line 32: X-Treme pack
   - Line 41: Elite pack

---

### OPTION 2: PDF Files

**Pros:** Professional looking, can be printed, offline access

#### Step-by-Step:
1. **Create Your Coin List:**
   - Use Excel, Word, or Google Docs
   - Format it nicely with your coin list
   - Export as PDF

2. **Name Your Files:**
   - `shackpack-starter.pdf`
   - `shackpack-deluxe.pdf`
   - `shackpack-xtreme.pdf`
   - `shackpack-elite.pdf`

3. **Upload to Folder:**
   **Location:** `coins/public/checklists/`
   
   Navigate to: `C:\Users\zfrey\OneDrive\Desktop\Shackpck\coins\public\checklists\`
   
   Drag and drop your PDF files here.

4. **Done!** The website already links to these files automatically.

---

### OPTION 3: Embedded Lists (I'll Code It)

**Pros:** Lists show directly on the page, no external links needed

#### How This Works:
Tell me the coins you want in each pack, and I'll create a beautiful table directly on the checklist page. Format like:

**Shackpack Starter (15-20 coins):**
- 2023 American Silver Eagle, 1 oz, .999 Silver, BU
- 2022 Canadian Gold Maple Leaf, 1/10 oz, .9999 Gold, BU  
- 1964 Kennedy Half Dollar, 90% Silver, Circulated
- etc...

I'll format it beautifully with sortable tables!

---

## 🎯 WHICH OPTION SHOULD YOU CHOOSE?

### Choose **Google Sheets** if:
- ✅ You want to easily update lists later
- ✅ You want searchable/sortable functionality
- ✅ You want the easiest option

### Choose **PDF** if:
- ✅ You already have formatted documents
- ✅ You want professional-looking downloadable files
- ✅ You don't need to update lists often

### Choose **Embedded Lists** if:
- ✅ You want everything on one page
- ✅ You don't mind sending me the list to format
- ✅ You want the most integrated experience

---

## 🚀 QUICK CHECKLIST

After uploading, check these:

### Images:
- [ ] 4 pack images uploaded to `/coins/public/images/packs/`
- [ ] Files named correctly (shackpack-starter.jpg, etc.)
- [ ] Code updated to use `/images/packs/[filename].jpg`

### Coin Lists:
- [ ] Google Sheets created and links added to code
- [ ] OR PDF files uploaded to `/coins/public/checklists/`
- [ ] OR sent me the lists to embed

### Test:
- [ ] Run `npm run dev`
- [ ] Visit http://localhost:3000
- [ ] Check homepage - see your pack images?
- [ ] Visit /repacks page - see your pack images?
- [ ] Visit /checklist page - do the links work?

---

## 💡 NEED HELP?

Just tell me:
1. "I've uploaded the pack images" - I'll update the code
2. "Here's my Google Sheet link for [pack name]" - I'll add it
3. "Here's my coin list for [pack name]" - I'll format it

I'm here to help! 🎉

