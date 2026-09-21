# Plan: Toiri Premium Workspace Upgrade
**Stack:** Existing TanStack Start app + Lovable Cloud
**Direction:** Midnight Obsidian — a restrained, high-contrast builder workspace with lime publish/success accents and bilingual Bangla/English support.

## What will change
1. **Premium workspace shell**
   - Replace the atmospheric purple background with a calmer obsidian workbench.
   - Tighten the top bar, panel boundaries, controls, typography, and visual hierarchy.
   - Keep chat responses unboxed and preserve all existing builder actions.

2. **Mobile-first workflow**
   - Use dynamic viewport height and safe-area spacing so the composer remains reachable above mobile keyboards.
   - Keep one clear Chat/Preview switch on small screens and defer the heavy preview until it is opened.
   - Improve 360–430px toolbar fit, text contrast, touch targets, and payment notice wrapping.

3. **Advanced project safety**
   - Warn before starting over and make version restores reversible.
   - Show that work is stored in this browser, without adding sign-in.
   - Clearly flag when imported code cannot be represented by the current single-entry publish flow rather than publishing stale output.

4. **Preview and accessibility polish**
   - Fix the Preview/Code/SEO view contract.
   - Add keyboard resizing, correct expanded-menu states, stronger labels, and live announcements for restore/publish actions.
   - Improve the preview frame and controls to match the selected direction.

5. **SEO and performance hardening**
   - Complete per-route Open Graph/Twitter metadata.
   - Reduce font loading cost, set a mobile theme color, and synchronize the page language after switching Bangla/English.
   - Improve semantic structure and contrast while retaining the existing canonical URLs and sitemap.

## Verification
- Run focused type checks and inspect the latest build result.
- Test chat, mobile switching, Preview/Code/SEO, menus, restore confirmation, and responsive layouts in Chromium at desktop and phone sizes.

## Deferred
- Sign-in, cloud project lists, dynamic sitemap entries for every published app, and GitHub push-back remain outside this release.
