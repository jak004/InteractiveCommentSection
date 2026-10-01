# Interactive Comments Section

A responsive, interactive comments section built with **HTML, CSS, and vanilla JavaScript**. The project supports creating, replying to, editing, deleting, and voting on comments while keeping user changes saved in the browser.

## Features

- View comments and nested replies
- Add new comments
- Reply to existing comments
- Edit your own comments
- Delete your own comments with a confirmation dialog
- Upvote and downvote comments
- Prevent multiple votes in the same direction
- Display relative timestamps such as "2 weeks ago"
- Persist comments and votes using `localStorage`
- Responsive layout for mobile and desktop screens
- Keyboard-focus preservation after voting
- Accessible labels, focus states, and semantic HTML
- Reduced-motion support with `prefers-reduced-motion`

## Built With

- HTML5
- CSS3
  - CSS Cascade Layers
  - CSS Custom Properties
  - CSS Container Queries
  - CSS Grid and Flexbox
  - Responsive design
- Vanilla JavaScript
- Browser `localStorage`
- `Intl.RelativeTimeFormat`

No frontend framework or external JavaScript library is required.

## Project Structure

```text
interactive-comments-section/
├── images/
│   ├── avatars/
│   ├── icon-delete.svg
│   ├── icon-edit.svg
│   ├── icon-minus.svg
│   ├── icon-plus.svg
│   └── icon-reply.svg
├── design/
│   ├── active-states.jpg
│   ├── desktop-design.jpg
│   ├── desktop-modal.jpg
│   ├── mobile-design.jpg
│   └── mobile-modal.jpg
├── app.js
├── data.json
├── index.html
├── styles.css
├── style-guide.md
└── README.md
```

## How It Works

The initial comments are loaded from `data.json`. On the first load, the data is converted into the application's internal state and stored in `localStorage`.

After that, changes made by the user are saved locally, so comments, replies, edits, deletions, and votes remain available when the page is refreshed in the same browser.

The application uses HTML `<template>` elements to generate comment and form interfaces dynamically. JavaScript handles the application state and user interactions without requiring a frontend framework.

## Getting Started

Because the application loads `data.json` with `fetch()`, it should be served through a local web server rather than opened directly with `file://`.

### Option 1: VS Code Live Server

1. Open the project folder in VS Code.
2. Install the **Live Server** extension if it is not already installed.
3. Right-click `index.html`.
4. Select **Open with Live Server**.

### Option 2: Using `npx serve`

If Node.js is installed:

```bash
npx serve .
```

Then open the local address shown in the terminal.

## Resetting the Demo Data

The application stores changes under the `comments-v1` key in browser `localStorage`.

To restore the original `data.json` state, clear the site's local storage from your browser's developer tools and reload the page.

## Responsive Design

The layout is designed to adapt across different screen sizes. It uses:

- Mobile-first CSS
- CSS Grid
- Flexbox
- Container queries for comment-specific layout changes
- Relative sizing and spacing
- Reduced-motion preferences

The accompanying design references are available in the `design/` folder.

## Accessibility

Accessibility considerations include:

- Semantic HTML elements
- Descriptive button labels
- `aria-label` and `aria-pressed` states where appropriate
- Visible `:focus-visible` indicators
- Keyboard-friendly controls
- A native `<dialog>` for delete confirmation
- Support for `prefers-reduced-motion`
- Alternative text handling for avatars

## Main Files

### `index.html`
Contains the semantic page structure, comment templates, composer templates, and delete confirmation dialog.

### `styles.css`
Contains the responsive visual design, design tokens, component styles, layout rules, accessibility states, and reduced-motion support.

### `app.js`
Controls application state, rendering, comments, replies, editing, deletion, voting, timestamps, and `localStorage` persistence.

### `data.json`
Contains the initial user and comment data used to populate the application on first load.

## Future Improvements

Possible extensions include:

- Backend/database persistence
- User authentication
- Real-time comments
- Comment sorting options
- Improved error handling for storage and network failures
- Loading and empty states
- Automated tests
- Deployment to a live hosting platform

## Credits

The project design and assets are based on the Interactive Comments Section challenge from **Frontend Mentor**.

This implementation focuses on building the interface and interactions with plain HTML, CSS, and JavaScript.
