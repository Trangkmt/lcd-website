# Font Standardization on Paste Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean pasted HTML content in the Rich Text Editor to remove external fonts and styles while preserving basic formatting.

**Architecture:** Intercept the `onPaste` event, sanitize the HTML using a whitelist approach, and insert the cleaned content back into the editor.

**Tech Stack:** React, DOMParser, Native Web Selection/Range APIs.

---

### Task 1: Create HTML Sanitizer Utility

**Files:**
- Create: `my-app/src/utils/htmlSanitizer.js`

- [ ] **Step 1: Implement `sanitizeHtmlForPaste` function**

```javascript
/**
 * Sanitizes HTML content for pasting into a rich text editor.
 * Preserves structural tags but removes styles, classes, and disallowed tags.
 */
export function sanitizeHtmlForPaste(html) {
    if (!html) return '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const allowedTags = ['B', 'STRONG', 'I', 'EM', 'U', 'A', 'UL', 'OL', 'LI', 'P', 'BR', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'IMG'];
    const blockTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI'];

    function cleanNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.cloneNode(true);
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return null;
        }

        const tagName = node.tagName.toUpperCase();

        if (allowedTags.includes(tagName)) {
            const newNode = document.createElement(tagName);

            // Preserve specific attributes
            if (tagName === 'A' && node.hasAttribute('href')) {
                newNode.setAttribute('href', node.getAttribute('href'));
                newNode.setAttribute('target', '_blank');
                newNode.setAttribute('rel', 'noopener noreferrer');
            }

            if (tagName === 'IMG' && node.hasAttribute('src')) {
                newNode.setAttribute('src', node.getAttribute('src'));
                if (node.hasAttribute('alt')) newNode.setAttribute('alt', node.getAttribute('alt'));
                newNode.style.maxWidth = '100%';
                newNode.style.height = 'auto';
                newNode.style.borderRadius = '8px';
            }

            // Recursively clean children
            Array.from(node.childNodes).forEach(child => {
                const cleanedChild = cleanNode(child);
                if (cleanedChild) newNode.appendChild(cleanedChild);
            });

            return newNode;
        } else {
            // If tag is not allowed, but is a block element, replace with P or just keep children
            const fragment = document.createDocumentFragment();
            Array.from(node.childNodes).forEach(child => {
                const cleanedChild = cleanNode(child);
                if (cleanedChild) fragment.appendChild(cleanedChild);
            });
            return fragment;
        }
    }

    const resultFragment = document.createDocumentFragment();
    Array.from(doc.body.childNodes).forEach(node => {
        const cleaned = cleanNode(node);
        if (cleaned) resultFragment.appendChild(cleaned);
    });

    const tempDiv = document.createElement('div');
    tempDiv.appendChild(resultFragment);
    return tempDiv.innerHTML;
}
```

- [ ] **Step 2: Commit utility function**

```bash
git add my-app/src/utils/htmlSanitizer.js
git commit -m "feat: add htmlSanitizer utility for cleaning pasted content"
```

---

### Task 2: Integrate `onPaste` Handler in PostsManagement

**Files:**
- Modify: `my-app/src/screens/Admin/PostsManagement/PostsManagement.jsx`

- [ ] **Step 1: Import the sanitizer**

```javascript
// Around line 34
import { sanitizeHtmlForPaste } from '../../../utils/htmlSanitizer';
```

- [ ] **Step 2: Implement `handleEditorPaste` function**

```javascript
// Add this inside the PostsManagement component, after other editor helpers
    function handleEditorPaste(e) {
        e.preventDefault();

        const html = e.clipboardData.getData('text/html');
        const text = e.clipboardData.getData('text/plain');

        let contentToInsert = '';

        if (html) {
            contentToInsert = sanitizeHtmlForPaste(html);
        } else if (text) {
            // Convert plain text newlines to <p> tags or <br>
            contentToInsert = text
                .split(/\r?\n/)
                .map(line => line.trim() ? `<p>${line}</p>` : '<p><br/></p>')
                .join('');
        }

        if (contentToInsert) {
            document.execCommand('insertHTML', false, contentToInsert);
            syncContentFromEditor();
        }
    }
```

- [ ] **Step 3: Attach the handler to the editor div**

```javascript
// Around line 1257
                            <div
                                ref={editorRef}
                                className="wp-editor-body"
                                contentEditable
                                suppressContentEditableWarning
                                onInput={syncContentFromEditor}
                                onPaste={handleEditorPaste} // Add this
                                onDrop={handleEditorDrop}
                                onDragOver={event => event.preventDefault()}
                            />
```

- [ ] **Step 4: Commit changes**

```bash
git add my-app/src/screens/Admin/PostsManagement/PostsManagement.jsx
git commit -m "feat: implement onPaste handler for font standardization"
```

---

### Task 3: Verification

- [ ] **Step 1: Manual verification**
- Open the Post Management screen.
- Create or edit a post.
- Copy text with custom fonts and colors from an external site (e.g., Facebook).
- Paste it into the editor.
- **Expected:** The text should appear in the system font, without external colors or background styles. Basic formatting (Bold/Italic/Links) should be preserved.
