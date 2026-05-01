# Design Spec: Standardizing Font on Paste for Rich Text Editor

**Date:** 2026-05-01
**Topic:** font-standardization-on-paste

## Context
The current Rich Text Editor (a `contentEditable` div) in `PostsManagement.jsx` preserves source formatting when users paste content from external sources like Facebook, Zalo, or Microsoft Word. This results in inconsistent fonts, sizes, and colors that clash with the system's design.

## Goal
Standardize pasted content by removing all inline styles and non-essential HTML tags/attributes, while preserving basic structure (bold, italic, links, lists, and images).

## Proposed Design

### HTML Sanitization Logic
We will implement a utility function `sanitizeHtmlForPaste(html)`:
1.  Use `DOMParser` to parse the pasted HTML.
2.  Define a whitelist of allowed tags: `<b>`, `<strong>`, `<i>`, `em`, `<u>`, `<a>`, `<ul>`, `<ol>`, `<li>`, `<p>`, `<br>`, `<h2>`, `<h3>`, `<h4>`, `<img>`.
3.  Recursively traverse the DOM:
    - Replace disallowed tags with their text content (or `<p>` if they are block-level).
    - Remove ALL attributes from allowed tags EXCEPT:
        - `href` for `<a>`
        - `src`, `alt`, `style` (only for `max-width` and `height`) for `<img>`
    - Specifically remove `style`, `class`, `id`, `font`, `face`, `size`, `color` attributes.

### Paste Interception
In `PostsManagement.jsx`:
1.  Add `onPaste` listener to the `contentEditable` div.
2.  In the listener:
    - `e.preventDefault()`
    - Try to get `text/html` from `e.clipboardData`.
    - If HTML exists:
        - Clean it using `sanitizeHtmlForPaste`.
        - Insert the cleaned HTML at the current selection using `document.execCommand('insertHTML', false, cleanedHtml)`.
    - If only `text/plain` exists:
        - Insert as plain text.
3.  Call `syncContentFromEditor()` to update the React state.

## Trade-offs
- **Complexity**: Handling cross-browser `Selection` and `Range` for pasting can be tricky, but `document.execCommand('insertHTML')` is widely supported for this specific use case.
- **Data Loss**: Users lose complex formatting (e.g., tables, specific colors), but this is the intended behavior to ensure consistency.

## Verification Plan
1.  Copy text with complex formatting from Word/Facebook and paste into the editor.
2.  Verify that the font matches the system font and no inline styles are present in the resulting HTML (check DOM).
3.  Verify that Bold/Italic/Links/Images are still preserved.
