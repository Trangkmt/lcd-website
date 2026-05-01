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

            if (tagName === 'IMG') {
                const alt = node.getAttribute('alt');
                // Detect if the IMG is actually an emoji (common in Facebook/Zalo/Word)
                // These usually have the emoji character in the 'alt' attribute.
                // We consider it an emoji if it's 1-2 characters long (surrogate pairs) 
                // or matches an emoji regex.
                const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}\u{1F004}\u{1F0CF}\u{1F170}-\u{1F171}\u{1F17E}-\u{1F17F}\u{1F18E}\u{3030}\u{2B50}\u{2B55}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{3297}\u{3299}\u{303D}\u{00A9}\u{00AE}\u{2122}\u{231A}-\u{231B}\u{23E9}-\u{23EC}\u{23F0}\u{23F3}\u{25FD}-\u{25FE}\u{2614}-\u{2615}\u{2648}-\u{2653}\u{267F}\u{2693}\u{26A1}\u{26AA}-\u{26AB}\u{26BD}-\u{26BE}\u{26C4}-\u{26C5}\u{26CE}\u{26D4}\u{26EA}-\u{26EB}\u{26F2}-\u{26F3}\u{26F5}\u{26FA}\u{2702}\u{2705}\u{2708}-\u{270C}\u{270F}\u{2712}\u{2714}\u{2716}\u{2728}\u{2733}-\u{2734}\u{2744}\u{2747}\u{274C}\u{274E}\u{2753}-\u{2755}\u{2757}\u{2763}-\u{2764}\u{2795}-\u{2797}\u{27A1}\u{27B0}\u{27BF}\u{2934}-\u{2935}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}]/u;

                if (alt && (alt.length <= 4 && emojiRegex.test(alt))) {
                    return document.createTextNode(alt);
                }

                if (node.hasAttribute('src')) {
                    newNode.setAttribute('src', node.getAttribute('src'));
                    if (alt) newNode.setAttribute('alt', alt);
                    newNode.style.maxWidth = '100%';
                    newNode.style.height = 'auto';
                    newNode.style.borderRadius = '8px';
                } else {
                    return null; // Skip images without src
                }
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
