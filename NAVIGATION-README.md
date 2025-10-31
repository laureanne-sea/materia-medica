# Navigation System Documentation

## Overview

The navigation is now centralized in a single JavaScript file (`navigation.js`) that automatically injects navigation into all pages. This eliminates code duplication and makes updates much easier.

## How It Works

### Single Source of Truth
All navigation links are defined in `navigation.js` in the `NAV_ITEMS` array:

```javascript
const NAV_ITEMS = [
    { href: 'index.html', label: 'All Plants', id: 'all' },
    { href: 'nervous-system.html', label: 'Nervous System', id: 'nervous' },
    // ... etc
];
```

### Automatic Injection
- JavaScript finds `<div id="nav-placeholder"></div>` in each page
- Replaces it with the full navigation HTML
- Automatically highlights the correct active link based on current page

### Path Detection
- Detects if page is in `/plants/` subdirectory
- Automatically adjusts links with `../` prefix for plant pages
- Root pages use direct links

## How to Update Navigation

### Adding a New System

1. Open `navigation.js`
2. Add new entry to `NAV_ITEMS` array:
   ```javascript
   { href: 'new-system.html', label: 'New System', id: 'newsystem' }
   ```
3. Save - navigation updates everywhere automatically!

### Changing Navigation Order

Just rearrange items in the `NAV_ITEMS` array.

### Changing Link Labels

Edit the `label` property in `NAV_ITEMS`.

## Benefits

✅ **Update once, change everywhere** - No more editing 39+ files
✅ **Consistency guaranteed** - All pages use identical navigation
✅ **Easy maintenance** - Single file to manage
✅ **Automatic active states** - JavaScript detects current page
✅ **Path-aware** - Works correctly in subdirectories

## Files Modified

- ✅ `navigation.js` - Created (single source of truth)
- ✅ `index.html` - Uses `<div id="nav-placeholder"></div>`
- ✅ All `*-system.html` files - Use placeholder
- ✅ All `plants/*.html` files - Include script with `../` path
- ✅ `styles.css` - Added loading state styles

## Fallback for No JavaScript

If JavaScript is disabled, users will see "Loading navigation..." message. For production, you could:
1. Add `<noscript>` tags with static navigation
2. Use server-side rendering
3. Add a basic link list as fallback

## Testing

Open any page in a browser and verify:
- Navigation appears correctly
- Active link is highlighted
- Links work from all pages
- Styling matches original design
