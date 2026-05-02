# UI Restoration & Standardization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the exact original UI look and responsive behavior using Work Sans font while maintaining a clean, centralized design system.

**Architecture:** Update the global design tokens in `global.css` to match original values and refine component styles (especially `PostCard`) to support specific original variants.

**Tech Stack:** React, CSS (Vanilla)

---

### Task 1: Restore Global Design Tokens in `global.css`

**Files:**
- Modify: `my-app/src/global.css`
- Reference: `comparison_original/global_original.css`

- [ ] **Step 1: Update Font Family and Weights**
  - Set `--font-primary` and all related variables to `Work Sans`.
  - Set `--fw-extrabold: 800` and `--fw-black: 900` (ensure 900 is available).
  - Update `h1`, `h2` classes to use `text-transform: uppercase` and correct weights.

- [ ] **Step 2: Update Color Palette**
  - Revert `--color-darkslateblue` to `#183563`.
  - Revert other core colors to match `global_original.css`.

- [ ] **Step 3: Update Spacing and Radius Tokens**
  - Update `--radius-*` values.
  - Update `--space-*` and `--container-*` values to match original layout logic.

---

### Task 2: Restore Original Card Styles via `PostCard` Variants

**Files:**
- Modify: `my-app/src/components/PostCard/PostCard.jsx`
- Modify: `my-app/src/components/PostCard/PostCard.css`
- Reference: `comparison_original/NewsCard_original.css`, `comparison_original/ActivityCard_original.css`, `comparison_original/AchievementCard_original.css`

- [ ] **Step 1: Add variant support to PostCard.jsx**
  - Ensure the component accepts a `variant` prop or uses the category to apply specific classes (`postcard--news`, `postcard--activity`, `postcard--achievement`).

- [ ] **Step 2: Extract and implement original Card styles**
  - Move the specific styles from the three original CSS files into `PostCard.css` under the respective variant classes.
  - Focus on: image aspect ratios, font weights of titles, badge positioning, and hover effects.

---

### Task 3: Restore Homepage Layout and Responsive Logic

**Files:**
- Modify: `my-app/src/screens/User/Homepage/Homepage.css`
- Reference: `comparison_original/Homepage_original.css`

- [ ] **Step 1: Restore Homepage Grid and Section Headers**
  - Match the `grid-template-columns` and `gap` values.
  - Restore the `section-header` and `section-divider` styles exactly.

- [ ] **Step 2: Restore Responsive Media Queries**
  - Copy and adapt the `@media` blocks from `Homepage_original.css` (lines 547+).
  - Ensure font scaling and stacking behavior is identical.

---

### Task 4: Sync Admin and Other User Screens

**Files:**
- Modify: `my-app/src/screens/Admin/AdminLayout/AdminLayout.css`
- Modify: `my-app/src/screens/User/News/News.css`
- Modify: `my-app/src/screens/User/Achievement/Achievement.css`

- [ ] **Step 1: Verify Admin Layout Consistency**
  - Ensure Admin titles follow the restored global hierarchy.
  - Check that padding/margins match the "clean but original" requirement.

- [ ] **Step 2: Verify Achievement and News Screens**
  - Ensure the hero titles and section layouts match original responsive behavior.

---

### Task 5: Final Cleanup and Verification

- [ ] **Step 1: Remove comparison folder**
  - `Remove-Item -Recurse -Force "comparison_original"`
  - `Remove-Item -Recurse -Force "temp_media"`
  - `Remove-Item "BaoCao.zip"`

- [ ] **Step 2: Visual Audit**
  - Compare the live site with screenshots from `Báo cáo KLTN.docx`.
  - Verify font is `Work Sans` across all elements.
