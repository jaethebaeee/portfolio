# Fake or Real News? - Chrome Extension

A satirical Chrome extension that displays verified facts about Jae's portfolio and skills.

## Features

- **Quick Facts Display**: Shows random interesting facts about Jae's background, skills, and projects
- **Refresh Functionality**: Click the refresh button to get a new random fact
- **Portfolio Link**: Direct link to the full portfolio website
- **Clean UI**: Modern, gradient-based design that matches the portfolio theme

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the `JusttheFacts` folder
4. The extension will appear in your browser toolbar

## Usage

1. Click the extension icon in your browser toolbar
2. View the current fact displayed
3. Click "🔄 Get Random Fact" to see a different fact
4. Click "🌐 View Full Portfolio" to visit the full website

## Facts Included

The extension includes facts about:
- Current role and specialization
- Educational background
- Technical skills and stack
- Project highlights
- Areas of focus and expertise
- Learning interests
- Architecture experience

## Development

To modify the extension:

1. Edit `popup.html` for UI changes
2. Edit `popup.js` to add/remove facts or change functionality
3. Update `manifest.json` for extension metadata
4. Reload the extension in `chrome://extensions/` after changes

## Icons

You'll need to create the following icon files in the `icons/` directory:
- `icon16.png` (16x16 pixels)
- `icon32.png` (32x32 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

You can use any icon generator or create simple colored squares for testing.

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Chrome Extension Manifest V3
