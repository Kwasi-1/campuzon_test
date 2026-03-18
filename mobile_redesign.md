
## 📋 Mobile-First Redesign Procedure

Use this procedure when updating the home screen or any dense commerce surface so mobile improves without breaking tablet and desktop.

### Goal

- Preserve business logic, routing, API calls, state management, and data models.
- Refactor presentation only.
- Keep desktop and tablet stable while mobile is redesigned in controlled steps.

### Non-Negotiable Rules

1. Treat `main` as the stable desktop and tablet baseline.
2. Do mobile work on dedicated branches.
3. Do not modify styles at `min-width: 768px` and above unless the task explicitly requires it.
4. Prefer CSS breakpoints over screen-size hooks for layout.
5. Change one UI layer at a time and verify before moving on.

### Recommended Branch Flow

1. `main`
   Stable baseline.
2. `mobile-shell`
   Header, top tabs, bottom nav, sticky behavior, safe-area handling.
3. `mobile-home-content`
   Hero, info bar, category shortcuts.
4. `mobile-product-cards`
   Product cards, section headers, grid density.
5. `mobile-polish`
   Spacing, touch targets, scroll snap, visual cleanup.

### Step-by-Step Execution

#### Step 1: Lock Constraints

Before editing, restate the constraints so scope does not drift.

Prompt:

```text
Before making any changes, confirm these constraints and follow them strictly:
1. Preserve all business logic, API calls, state, and routing behavior.
2. Mobile-first only for this phase.
3. Do not modify any styles at min-width 768px and above.
4. Only refactor presentation layer (JSX structure and mobile CSS/classes).
5. Keep existing brand colors, typography, and identity.
```

#### Step 2: Build the Mobile Shell Only

Do not touch hero banners, grids, or cards yet. Make the shell stable first.

Scope:

- Sticky top header
- Search bar prominence
- Horizontal sub-navigation tabs
- Sticky bottom navigation
- Safe-area spacing and offsets

Prompt:

```text
Step 1 only: refactor Header, top horizontal tabs, and Bottom Navigation for mobile-first behavior.
Do not edit desktop/tablet styles.
Add sticky behavior, safe-area bottom spacing, horizontal scroll tab rail, and active tab indicator.
No hero/content changes in this step.
```

#### Step 3: Run Breakpoint Verification Immediately

Check that mobile improved and larger screens did not regress.

Required widths:

- 375
- 430
- 768
- 1024
- 1280

Prompt:

```text
After Step 1, run a UI verification checklist for widths 375, 430, 768, 1024, 1280.
Report:
- what changed on mobile
- anything changed above 768
- exact classes/components that could cause desktop drift
```

#### Step 4: Add Hero, Info Bar, and Categories

Once the shell is approved, move to the next content band only.

Scope:

- Hero banner or carousel
- Slim info bar
- Category quick-links
- Horizontal scroll and optional scroll snap

Prompt:

```text
Step 2 only: implement mobile-first hero/banner, slim info bar, and category quick-links.
Preserve existing data bindings.
Use horizontal scroll and optional scroll snap for category chips.
Do not modify product grid yet.
```

#### Step 5: Audit Mobile Density and Rhythm

Before cards are redesigned, tighten spacing and hierarchy.

Review:

- vertical spacing between sections
- card gaps
- text size hierarchy
- sticky overlaps
- bottom nav safe-area padding

Prompt:

```text
Audit mobile vertical rhythm: section padding, card gaps, title spacing, sticky offsets.
Tighten for dense mobile commerce feel while preserving readability.
Do not change desktop/tablet breakpoints.
```

#### Step 6: Refactor Product Cards Last

Cards usually create the most unintended regression. Leave them until the shell and content bands are stable.

Scope:

- image-first layout
- sale or promo badges
- price hierarchy
- old price strike-through
- quick add button
- section headers with title and view-all action

Prompt:

```text
Step 3 only: refactor product card and section grid presentation for mobile:
- large image first
- badge overlays
- clear price hierarchy
- optional old-price strike
- quick add button
No business logic changes, no API changes, no desktop style changes.
```

#### Step 7: Add Regression Guardrails Per Step

Every step should confirm that no `md`, `lg`, or `xl` styles were changed unintentionally.

Prompt:

```text
List all files modified in this step and flag any class that applies at md/lg/xl.
If md+ classes were changed, explain why; otherwise confirm none changed.
```

#### Step 8: Keep Commits Small and Reversible

Recommended commit sequence:

- `mobile shell`
- `mobile hero and categories`
- `mobile product cards`
- `mobile polish`

Each commit should be independently reversible without affecting business logic.

#### Step 9: Final Mobile Polish Pass

Use the last pass for fit and finish only.

Review:

- icon alignment
- search field prominence
- tab active state clarity
- touch target sizes
- safe-area padding
- sticky stacking and overlap
- scroll smoothness and snap feel

Prompt:

```text
Perform final mobile polish pass:
- icon alignment
- header/search prominence
- tab rail active state
- bottom nav touch targets
- safe area and sticky overlap checks
Then provide a final checklist and unresolved items.
```

### When to Use a Screen Size Hook

Do not use a screen size hook as the default answer for layout.

Use CSS for:

- breakpoints
- spacing
- visibility
- scroll behavior
- stacking and alignment

Use a hook only for behavior changes such as:

- swapping interaction patterns
- disabling heavy animations on smaller devices
- changing data density or logic that CSS cannot express

### Mobile Redesign Checklist

Use this before merging mobile work:

- Header is sticky and does not overlap content incorrectly.
- Search bar is visually dominant and usable with thumbs.
- Top tabs scroll smoothly and expose active state clearly.
- Bottom nav is fixed, balanced, and safe-area aware.
- Hero and info bar feel dense but not cramped.
- Categories are easy to scan and tap.
- Product cards emphasize image, price, and promotions.
- Section spacing feels intentional and consistent.
- Nothing above 768px changed unintentionally.

### Short Decision Rule

If mobile is unfinished and desktop is already stable, do not keep redesigning everything at once.

1. Stabilize shell.
2. Validate breakpoints.
3. Continue section by section.
4. Only then move to deeper visual redesign.