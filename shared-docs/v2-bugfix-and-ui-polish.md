# V2 Bugfix and UI Polish Plan

## Objectives
1. **Fix Incorrect/Future Dates:** Ensure tracked changes and snapshot times are anchored to realistic or actual server timestamps without spurious future values.
2. **Live Data Refresh:** Fix caching or state management issues preventing live extractions from visibly updating upon completion.
3. **Resilience:** Guarantee the frontend gracefully survives and communicates any slow responses or failed network calls.
4. **Copy Compression:** Enforce the rules from `ui-copy-compression-guidelines.md` across the entire app. Eliminate essays, use crisp executives summaries, leading bold labels, and focus on numbers.
5. **Visual Hierarchy:** Make key metrics larger, support text shorter, and insert company/source icons to ground the app in realism.

## Constraints
- **Preserve existing architecture, seeded demo mode, and GEO/Whitespace engines.**
- **No vast redesigns.**
- **No fabricated datasets.**
- **Prefer small, high-confidence patches over files sweeps.**
