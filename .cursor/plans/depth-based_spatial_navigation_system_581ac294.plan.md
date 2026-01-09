---
name: Depth-Based Spatial Navigation System
overview: Implement a depth-based spatial navigation system with scale and tile density transitions. Each page represents different scales (1x1, 2x2, 4x4, 8x8 tiles) and transitions create a zooming effect through nested scales of space.
todos:
  - id: 1
    content: "Enhance TiledBackground: Start with single canvas + dynamic redraw (YAGNI). Implement grid density logic (repetition count), calculate tile size dynamically: viewportSize / gridDensity. Only add two-layer crossfade if 60fps drops. CRITICAL: Ensure continuous background coverage - NO BLACK BACKGROUNDS during transitions."
    status: pending
  - id: 2
    content: Add transition constants for depth-based navigation (durations, grid densities, parallax multipliers)
    status: pending
  - id: 3
    content: "Create use-spatial-transition hook: Animation loop that calculates content transform AND parallax transform in sync (parallaxTransform = contentTransform * multiplier). Parallax must stay synchronized, not independent."
    status: pending
  - id: 4
    content: "Update app/page.tsx: Track previousPage, detect transition types. Reuse existing isCinematic state for About→Passions Phase 1. Connect Phase 2 to new grid system with parallax sync. Ensure background layers overlap to prevent black gaps."
    status: pending
  - id: 5
    content: Add CSS keyframes for content scaling, parallax animations, skip transition blur. Ensure animations maintain continuous background visibility.
    status: pending
  - id: 6
    content: Update AboutPage with scalable container and transition props. Ensure TiledBackground maintains coverage during all transitions.
    status: pending
  - id: 7
    content: Update PassionsPage with scalable container and transition props (house scale animation). Ensure background continuous during transitions.
    status: pending
  - id: 8
    content: Update ProjectsPage with scalable container and transition props (globe rise/scale animation). Ensure background continuous during transitions.
    status: pending
  - id: 9
    content: Update StackPage with scalable container and transition props (orbit expansion animation). Ensure background continuous during transitions.
    status: pending
  - id: 10
    content: Implement all 6 adjacent transitions (forward and reverse). Test no black backgrounds appear.
    status: pending
  - id: 11
    content: Implement skip transitions (About↔Projects, About↔Stack, Passions↔Stack) with blur effects. Verify no black backgrounds during rapid density jumps.
    status: pending
  - id: 12
    content: Add reduced motion support (prefers-reduced-motion media query detection)
    status: pending
  - id: 13
    content: "Performance optimization: GPU acceleration, will-change properties, canvas redraw optimization. Ensure background rendering maintains 60fps."
    status: pending
---

# Depth-Based Spatial Navigation System

## Architecture Overview

The system implements spatial navigation with depth perception through:

1. **Dynamic Grid Density**: TiledBackground adapts REPETITION COUNT (1x1 → 2x2 → 4x4 → 8x8 tiles). More tiles = more depth = farther away. Tile size = viewportSize / gridDensity.
2. **Scale Transitions**: Page content scales during transitions (1x → 3x, 0.3x → 1x, etc.)
3. **Parallax System**: Background tiles move MORE than content during transitions (1.5x, 2x speed) via separate transform on background container. If content moves 100px down, tiles move 150px down (1.5x) or 200px (2x). This creates depth perception - closer objects move faster relative to background. Implement as transition-time transform multiplier, not scroll effect.
4. **Direction Detection**: Tracks adjacent vs skip transitions to apply correct animation variants
5. **Special Monitor Zoom**: About → Passions uses unique two-phase transition establishing "portal to universe" metaphor

## ⚠️ CRITICAL REQUIREMENT: NO BLACK BACKGROUNDS

**During ALL transitions, the background must maintain continuous coverage. Black backgrounds will break the depth illusion.**

- Exit page background must remain visible until enter page background is fully rendered
- TiledBackground must maintain opacity/visibility during density changes
- Canvas redraws must happen behind existing canvas (z-index layering) or with instant opacity swap
- Page overlays/containers must ensure background tiles are always visible
- Test every transition to verify no black gaps or flashes appear

## File Changes

### 1. Enhanced TiledBackground Component

**File**: `components/tiled-background.tsx`

Changes:

- Add `gridDensity` prop (1, 2, 4, 8) to control REPETITION COUNT (numberOfTiles = gridDensity * gridDensity)
- Calculate tile size: `viewportSize / gridDensity` (not division of base tile size)
- Grid density mapping:
  - About (density=1): ONE large tile filling viewport (1x1 grid)
  - Passions (density=2): 2x2 grid = 4 tiles
  - Projects (density=4): 4x4 grid = 16 tiles  
  - Stack (density=8): 8x8 grid = 64 tiles
- Start with single canvas + dynamic redraw (simpler approach)
- **For transitions: Pre-render target density canvas BEFORE transition starts**
- **During transition: Display both old and new density canvases with opacity crossfade** (prevents black background)
- For skip transitions: Pre-render target density, swap with blur effect, both visible during blur
- For adjacent transitions: Pre-render target density, crossfade old→new with overlap
- Only implement two-layer crossfade if single canvas drops below 60fps during testing (YAGNI principle)
- **CRITICAL: Canvas rendering must happen before transition, not during - instant visibility swap**
- Continuous drift animation on active layer
- Remove base tileSize constant (320px) - calculate dynamically based on viewport and density

Key additions:

```typescript
interface TiledBackgroundProps {
  gridDensity?: 1 | 2 | 4 | 8  // Controls repetition count (1x1, 2x2, 4x4, 8x8)
  transitionToDensity?: 1 | 2 | 4 | 8  // Target density for transition (single canvas redraw)
  transitionProgress?: number  // 0-1 for transition progress (used for opacity/blur effects)
  isSkipTransition?: boolean  // If true, use blur effect during density jump
  parallaxOffset?: { x: number; y: number }  // Transform offset synchronized with content animation
  // ... existing props
}

// Calculation logic:
const tileCountPerAxis = gridDensity
const tileSize = Math.ceil(viewportSize / gridDensity)
const totalTiles = gridDensity * gridDensity
```

### 2. Transition System & State Management

**File**: `app/page.tsx`

Changes:

- Track `previousPage` state to determine transition direction
- Detect adjacent vs skip transitions using page indices
- Implement transition type detection (adjacent, skip-1, skip-2)
- Coordinate exit/enter animations with overlapping timing
- Pass grid density and transition props to all pages

New state structure:

```typescript
type TransitionType = 'adjacent' | 'skip-1' | 'skip-2' | 'special-monitor-zoom'
const [previousPage, setPreviousPage] = useState<PageType | null>(null)
const [transitionType, setTransitionType] = useState<TransitionType>('adjacent')
const [gridDensity, setGridDensity] = useState<1 | 2 | 4 | 8>(1)
const [isSkipTransition, setIsSkipTransition] = useState(false)

// Special handling for About → Passions
const isMonitorZoomTransition = 
  previousPage === 'about' && currentPage === 'passions'
```

### 3. Transition Configuration Constants

**File**: `constants/transitions.ts`

Add new constants:

```typescript
export const DEPTH_TRANSITIONS = {
  ADJACENT_DURATION: 1200,  // 1.2s for adjacent transitions
  SKIP_DURATION: 800,       // 0.8s for skip transitions  
  FULL_JOURNEY_DURATION: 1500,  // 1.5s for About ↔ Stack
  
  GRID_DENSITIES: {
    about: 1,
    passions: 2,
    projects: 4,
    stack: 8,
  },
  
  PARALLAX_MULTIPLIERS: {
    // Tiles move MORE than content (1.5x, 2x) to create depth
    // Closer objects move faster relative to background
    1: 1.0,    // About: no parallax during transitions
    2: 1.5,    // Passions: tiles move 1.5x content movement
    4: 2.0,    // Projects: tiles move 2x content movement
    8: 2.0,    // Stack: tiles move 2x content movement
  },
  
  CONTENT_SCALES: {
    // Entry scales for each page
    passions: { from: 0.3, to: 1 },
    projects: { from: 1.2, to: 1 },
    stack: { from: 0, to: 1 },
  }
}
```

### 4. Page-Specific Transition Props

**Files**:

- `components/pages/about-page.tsx`
- `components/pages/passions-page.tsx`
- `components/pages/projects-page.tsx`
- `components/pages/stack-page.tsx`

Changes for each:

- Accept `gridDensity`, `transitionGridDensity`, `transitionProgress` props
- Wrap main content in scalable container with `will-change: transform`
- Apply scale transforms based on transition state
- Use CSS custom properties for transition values
- Pass grid density to TiledBackground

Example structure:

```typescript
interface PageProps {
  // ... existing props
  gridDensity?: 1 | 2 | 4 | 8  // Current grid density (repetition count)
  transitionGridDensity?: 1 | 2 | 4 | 8  // Target density for crossfade (adjacent only)
  transitionProgress?: number  // 0-1 for crossfade opacity (adjacent only)
  parallaxMultiplier?: number  // How much MORE tiles move than content (1.5x, 2x)
  isSkipTransition?: boolean  // If true, skip crossfade, use direct density jump
  parallaxOffset?: { x: number; y: number }  // Transform offset for parallax effect
}
```

### 5. CSS Animation Keyframes

**File**: `app/globals.css`

Add new keyframes for:

- Grid crossfade transitions
- Content scale animations (zoom in/out)
- Parallax transforms
- Blur effects for skip transitions
- Hyperspace effect for full journey

Key animations:

```css
@keyframes grid-crossfade {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes content-scale-enter {
  0% { transform: scale(var(--from-scale, 0.3)); }
  100% { transform: scale(var(--to-scale, 1)); }
}

@keyframes content-scale-exit {
  0% { transform: scale(1); }
  100% { transform: scale(var(--exit-scale, 0.3)) translate(var(--exit-x, 0), var(--exit-y, 0)); }
}

@keyframes skip-transition-blur {
  0%, 100% { filter: blur(0px); }
  50% { filter: blur(10px); }
}

@keyframes parallax-tiles {
  /* Parallax transform applied via JS during transition */
  /* Tiles container gets transform: translate(x, y) where */
  /* x = contentTransformX * parallaxMultiplier */
  /* y = contentTransformY * parallaxMultiplier */
}
```

### 6. Transition Variants Implementation

**File**: Create `hooks/use-spatial-transition.ts` (NEW)

Custom hook to manage transition logic:

- Calculate transition parameters based on from/to pages
- Determine scale values, directions, durations
- **Parallax calculation**: During animation loop, calculate `parallaxOffset = { x: contentX * multiplier, y: contentY * multiplier }`
- Handle reduced motion preferences
- Return transition configuration object with parallax multipliers
- Coordinate animation loop that updates both content transform AND parallax transform in sync

### 7. Reduced Motion Support

**File**: `app/page.tsx` and all page components

Changes:

- Detect `prefers-reduced-motion` media query
- Simplify transitions to opacity-only when enabled
- Remove scale/translate transforms for reduced motion
- Keep grid density changes but disable crossfade animations

## Implementation Flow

### Transition Flow (Standard Adjacent: Passions → Projects)

1. **Transition Start** (`handlePageChange`):

   - Set `isTransitioning = true`
   - Detect transition type: adjacent
   - Calculate: Passions (density 2) → Projects (density 4)
   - Set transition duration: 1200ms
   - Set `isSkipTransition = false` (enables crossfade)

2. **Exit Animation** (Passions page):

   - House scales down to 30% while translating down/out
   - **TiledBackground maintains visibility** - 2x2 grid stays visible until 4x4 is ready
   - Parallax: tiles move at 1.5x content speed (MORE than content)
   - Duration: 1200ms, easing: ease-in-out

3. **Enter Animation** (Projects page):

   - **TiledBackground renders 4x4 grid BEFORE exit fades** - ensures no black gap
   - 4x4 grid fades in (opacity 0 → 1) WHILE 2x2 grid still visible (opacity 1 → 0)
   - Earth globe rises from bottom (translateY(100%) → 0, scale 1.2 → 1)
   - Parallax: tiles move at 2x content speed (MORE than content)
   - Duration: 1200ms, easing: ease-in-out
   - Overlaps with exit (not sequential) - **backgrounds must overlap to prevent black**

4. **Transition Complete**:

   - Set `isTransitioning = false`
   - Update `gridDensity = 4`
   - Clear transition props

### Transition Flow (Special: About → Passions - Monitor Zoom Portal)

1. **Phase 1 Start** (`handlePageChange`):

   - Detect special case: About → Passions
   - **Reuse existing `isCinematic` state and monitor zoom animation** (already working)
   - Existing monitor zoom code handles Phase 1:
     - Monitor content scales from 1 → fullscreen (~4x)
     - Room elements fade (opacity 1 → 0)
     - TiledBackground maintains density 1 (1x1 large tile)
     - Duration: ~600ms, easing: ease-out

2. **Phase 2: Page Swap & Entry**:

   - At ~600ms: Swap page (setCurrentPage("passions"))
   - TiledBackground: Single canvas redraw to density 2 (1x1 → 2x2)
   - House scales from 0.3 → 1
   - **Parallax**: Calculate `parallaxTransform = contentTransform * 1.5` during animation loop
   - Apply parallax to TiledBackground container (separate transform, synchronized with content)
   - Duration: ~600ms, easing: ease-out

3. **Transition Complete**:

   - Set `isTransitioning = false`
   - Set `isCinematic = false` (reuse existing cleanup)
   - Update `gridDensity = 2`
   - Clear transition props

### Transition Flow (Skip: About → Stack - Direct Jump)

1. **Transition Start** (`handlePageChange`):

   - Detect transition type: skip-2
   - Calculate: About (density 1) → Stack (density 8)
   - Set transition duration: 800ms
   - Set `isSkipTransition = true` (no crossfade, direct jump)

2. **Single-Phase Animation**:

   - Globe scales dramatically (scale 0.1 → 1 or reverse)
   - **TiledBackground: Pre-render density 8 canvas BEFORE transition starts** - instant swap when transition begins
   - Direct density jump 1 → 8 (canvas swap, not redraw during transition)
   - Blur effect: 0px → 10px → 0px (peaks at 50%) - applied to both old and new canvas during swap
   - Parallax: tiles move at 2x content speed
   - Duration: 800ms, easing: ease-out
   - **Ensure both density 1 and density 8 canvases are visible during blur to prevent black**

3. **Transition Complete**:

   - Set `isTransitioning = false`
   - Update `gridDensity = 8`
   - Clear transition props

### Skip Transition Handling (Summary)

For non-adjacent transitions (e.g., About → Stack):

- **Direct density jump**: 1 → 8 (no intermediate steps: 1→2→4→8)
- Apply blur effect during middle of transition (masks the grid density "pop")
- Fast duration (800ms) makes jump feel intentional, not like a bug
- Blur peaks at 50% progress: `filter: blur(0px → 10px → 0px)`
- Single canvas redraw at target density (no crossfade needed)

## Performance Optimizations

1. **GPU Acceleration**:

   - Use `transform` and `opacity` only (never layout properties)
   - Add `will-change: transform` to transitioning elements
   - Use `transform3d()` to force GPU layer

2. **Canvas Optimization**:

   - **Start with single canvas + dynamic redraw approach** (simpler, YAGNI principle)
   - Only redraw TiledBackground when density actually changes
   - Single canvas redraws at target density during transitions
   - For skip transitions: Apply blur mask during density jump
   - Only implement two-layer crossfade if single canvas drops below 60fps during testing
   - Debounce rapid navigation attempts (existing 1000ms cooldown)
   - Use `content-visibility: hidden` for off-screen pages

3. **Animation Coordination**:

   - Single `requestAnimationFrame` loop for all transitions
   - **Parallax synchronization**: Calculate `parallaxTransform = contentTransform * multiplier` during same animation loop
   - Apply parallax to TiledBackground container transform (separate from content, but synchronized)
   - Parallax is NOT an independent animation - must stay synchronized with content animation
   - Batch DOM reads/writes
   - Avoid layout thrashing

## Testing Considerations

1. **All 12 Transition Variants**:

   - About → Passions (special monitor zoom portal - two-phase)
   - Passions → About (standard adjacent reverse)
   - Passions ↔ Projects (adjacent, standard)
   - Projects ↔ Stack (adjacent, standard)
   - About ↔ Projects (skip-1)
   - About ↔ Stack (skip-2)
   - Passions ↔ Stack (skip-1)

2. **Edge Cases**:

   - Rapid navigation (debouncing)
   - Mobile responsiveness (simplified transitions)
   - Reduced motion preference
   - Window resize during transition

3. **Visual Verification**:

   - Smooth 60fps transitions
   - **NO BLACK BACKGROUNDS at any point during any transition** (critical test)
   - No jarring cuts or jumps
   - Proper scale perception
   - Grid density changes are visible but smooth
   - Background tiles maintain continuous coverage during all density changes
   - Test rapid navigation (skip transitions) to ensure no black flashes

## Migration Path

1. Start with TiledBackground enhancements:

   - Implement grid density logic (repetition count, not tile division)
   - Calculate tile size dynamically: viewportSize / gridDensity
   - **Start with single canvas + dynamic redraw** (simpler, YAGNI)
   - Implement single canvas redraw during transitions
   - Implement blur effect for skip transitions
   - Only add two-layer crossfade if 60fps drops during testing

2. Add transition system infrastructure:

   - Track previousPage state
   - Detect transition types (adjacent, skip-1, skip-2, special-monitor-zoom)
   - Create animation loop that calculates content transform AND parallax transform in sync
   - Parallax calculation: `parallaxTransform = contentTransform * multiplier` during same loop

3. Implement special monitor zoom transition (About → Passions):

   - **Reuse existing `isCinematic` state and monitor zoom animation** (Phase 1 already works)
   - Two-phase transition handler
   - Phase 1: Existing monitor expansion code (no changes needed)
   - Phase 2: Galaxy entry with grid density change (1 → 2)
   - Connect Phase 2 to new grid system and parallax synchronization

4. Implement standard adjacent transitions:

   - Passions ↔ Projects (first, as it's standard)
   - Projects ↔ Stack
   - Reverse transitions

5. Add skip transition logic:

   - Direct density jumps
   - Blur effect masking
   - Fast duration (800ms)

6. Polish and performance optimization:

   - GPU acceleration checks
   - Canvas redraw optimization
   - **Parallax synchronization**: Ensure parallax transforms calculated during content animation loop
   - Test 60fps performance - only implement two-layer crossfade if single canvas drops below threshold

7. Add reduced motion support