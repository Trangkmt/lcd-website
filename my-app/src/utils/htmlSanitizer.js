/**
 * Sanitizes HTML content for pasting into a rich text editor.
 * Preserves structural tags but removes styles, classes, and disallowed tags.
 */
export function sanitizeHtmlForPaste(html) {
    if (!html) return '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const allowedTags = ['B', 'STRONG', 'I', 'EM', 'U', 'A', 'UL', 'OL', 'LI', 'P', 'BR', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'IMG'];

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
            // If tag is not allowed, but has children, keep children content
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
