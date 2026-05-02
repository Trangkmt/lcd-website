# UI Restoration & Standardization Design

## Goal
Restore the exact visual identity and responsive behavior of the original design (as seen in screenshots and pre-refactor code) while maintaining the centralized design system and clean code architecture.

## Architecture
- **Single Source of Truth**: All design tokens (colors, fonts, sizes, spacing, radius) will reside in `global.css`.
- **Component Variants**: The unified `PostCard` component will use CSS modifiers (e.g., `--news`, `--activity`, `--achievement`) to replicate the original distinct styles of separate card components.
- **Typography Engine**: Standardized hierarchy using `Work Sans` across all screens, with specific mapping for weights and text transformations.

## Key Design Tokens (Restored)
- **Primary Font**: `Work Sans`
- **Headings (h1, h2)**: 
  - `text-transform: uppercase`
  - `h1`: Weight 800
  - `h2`: Weight 900
- **Colors**: Revert to original hex codes (e.g., `#183563` for DarkSlateBlue, `#2C6BCC` for Primary).
- **Radius**: Revert to original values (8px for buttons, mostly 0px for cards/images unless specified).
- **Breakpoints**: `1024px`, `768px`, `640px`, `480px`.

## Implementation Strategy
1. **Extraction**: Deep-dive into `comparison_original/*.css` to extract exact property values.
2. **Synchronization**: Update `global.css` with these values.
3. **Refinement**: Update component-level CSS files to use these tokens and restore original layout/responsive logic.
4. **Verification**: Side-by-side comparison with original screenshots.

## Success Criteria
- The UI looks identical to the original screenshots in `Báo cáo KLTN.docx`.
- The font is `Work Sans` everywhere.
- `h1` and `h2` are uppercase and have correct weights.
- Responsive behavior (stacking, margins, font scaling) matches the original.
- No redundant CSS definitions or local color overrides.
