# Open Graph Image Setup

## Current Status ✅

Your social sharing preview is configured with:
- **Favicon**: Shows in browser tabs and search results ✅
- **OG Image**: Using `android-chrome-512x512.png` (your logo)
- **Meta Tags**: Optimized for all social platforms ✅

## Important Note ⚠️

**Open Graph images are STATIC** - social media platforms (Facebook, Twitter, LinkedIn, WhatsApp, etc.) do NOT support animated images in link previews. They only display static images (PNG, JPG, WebP).

## What's Currently Set Up

1. **Favicon**: Configured and will show in:
   - Browser tabs
   - Google search results (small icon)
   - Bookmarks

2. **Social Sharing Preview**: When someone shares your link, they'll see:
   - **Image**: Your logo (android-chrome-512x512.png)
   - **Title**: "DocuTrackr - Never Miss Another Document Expiration Date"
   - **Description**: About tracking documents with reminders
   - **Platforms**: Works on Facebook, Twitter, LinkedIn, WhatsApp, Messages, Discord, etc.

## Optional: Create a Custom 1200x630px OG Image

If you want a better preview image (larger, more detailed):

### Option 1: Use the Template
1. Open `og-image.html` in a browser
2. Take a screenshot at 1200x630px
3. Save as `og-image.png` in `/public/`
4. Update `index.html` meta tags to use `/og-image.png`

### Option 2: Use a Design Tool
1. Create a 1200x630px image in Canva/Figma/Photoshop
2. Include:
   - Your logo
   - App name
   - Key features or tagline
   - Brand colors (purple gradient background)
3. Save as `og-image.png` in `/public/`
4. Update meta tags

### Option 3: Use a Screenshot
1. Take a screenshot of your hero section
2. Resize to 1200x630px
3. Save as `og-image.png`
4. Update meta tags

## Testing Your Preview

After deploying, test with:
- **Facebook**: https://developers.facebook.com/tools/debug/
- **Twitter**: https://cards-dev.twitter.com/validator
- **LinkedIn**: https://www.linkedin.com/post-inspector/

## Current Configuration

Your meta tags are in `index.html` and use:
- `android-chrome-512x512.png` as the OG image
- Optimized title and description
- Proper favicon setup

Everything is ready to go! 🚀

