# Frontend Restructure Plan

## Current State Assessment

### ✅ KEEP - Solid Infrastructure

- **Provider hierarchy** - Well-structured (Theme → QueryClient → Auth → Router)
- **AuthContext & useApiFetch** - Well-implemented, properly typed
- **ProtectedRoute component** - Clean auth guard
- **Primitives.tsx** - Good foundation (HStack, VStack, Button, Card, Badge)
- **FormInput component** - Reusable, well-typed
- **TypeScript setup** - Strict mode, good type definitions
- **Theme type interface** (`styled.d.ts`) - Well-designed
- **Config pattern** - Clean environment variable handling

### 🔧 REPLACE/FIX - Generic Scaffold

- **Missing theme.ts** - CRITICAL: File imported but doesn't exist
- **Generic blue SaaS styling** - Replace with warm dark editorial aesthetic
- **Login page** - Keep structure, replace styling completely
- **Home page** - Replace with proper photo grid HomeScreen
- **No GraphQL client** - Backend has GraphQL, frontend uses REST
- **Underutilized React Query** - Installed but not used for data fetching
- **Routing** - Only one route exists, need full routing structure

### ❌ REMOVE - Unused/Low-Value

- `parse-fetch` dependency (not used)
- Inline styled components in Login (move to themed components)
- Direct localStorage manipulation (abstract behind hooks if needed)

---

## New Architecture

### Folder Structure

```
apps/web/src/
├── app/
│   ├── providers/
│   │   └── AppProviders.tsx       # All providers composed
│   ├── router/
│   │   └── AppRouter.tsx          # Route definitions
│   └── ViewerBootstrap.tsx        # Auth bootstrap with viewer query
├── graphql/
│   ├── client.ts                  # Apollo/Urql client setup
│   ├── queries/
│   │   └── viewer.graphql
│   ├── mutations/
│   └── generated/                 # Code generation output
├── screens/
│   ├── LoggedOutScreen.tsx        # Public landing/auth
│   ├── HomeScreen.tsx             # Photo grid / dashboard
│   ├── AlbumScreen.tsx            # Album detail view
│   └── MediaItemScreen.tsx        # Full media viewer
├── features/
│   ├── auth/                      # Auth components (forms, etc)
│   ├── media/                     # Media grid, upload, viewer
│   ├── albums/                    # Album cards, lists
│   └── sharing/                   # Sharing controls
├── shared/
│   ├── components/                # AppShell, Layout, Navigation
│   ├── ui/                        # Design system components
│   └── hooks/                     # Shared hooks
├── styles/
│   ├── theme.ts                   # NEW: Actual theme implementation
│   ├── globalStyle.ts             # Updated with new aesthetic
│   └── styled.d.ts                # Keep existing
├── contexts/                      # Keep AuthContext
└── types/                         # Keep existing
```

### Theme: Warm Dark Editorial

**New Color Palette:**

```typescript
colors: {
  bg: '#111315',           // Warm near-black
  surface: '#181b1f',      // Raised surface
  surfaceHover: '#1f2329', // Hover state
  border: '#2a2f36',       // Subtle borders
  text: '#f3f1ec',         // Primary cream
  textMuted: '#b7b0a4',    // Secondary beige
  accent: '#a8927a',       // Muted amber
  accentHover: '#c4a882',  // Lighter amber
  danger: '#d98c7e',       // Muted red
  success: '#8b9d88',      // Muted sage
}
```

**Design Principles:**

- Photos provide most color
- Chrome stays quiet and low-saturation
- Large imagery with generous spacing
- Subtle borders, restrained shadows
- Premium editorial feel, not dashboard

---

## Implementation Plan

### Phase 1: Foundation (Critical Fixes)

1. ✅ Create missing `theme.ts` with warm dark palette
2. ✅ Update `globalStyle.ts` with new aesthetic
3. ✅ Install GraphQL client (Apollo Client)
4. ✅ Set up GraphQL code generation
5. ✅ Create `graphql/client.ts`

### Phase 2: Auth Bootstrap & Layout

6. ✅ Create `app/ViewerBootstrap.tsx` with viewer query
7. ✅ Create `app/providers/AppProviders.tsx`
8. ✅ Create `shared/components/AppShell.tsx` (navigation, layout)
9. ✅ Create `screens/LoggedOutScreen.tsx` (replace generic Login)
10. ✅ Update `App.tsx` to use new structure

### Phase 3: Core Screens

11. ✅ Create `screens/HomeScreen.tsx` with photo grid layout
12. ✅ Create `screens/AlbumScreen.tsx` placeholder
13. ✅ Create `screens/MediaItemScreen.tsx` placeholder
14. ✅ Create `app/router/AppRouter.tsx` with all routes

### Phase 4: Feature Components

15. ✅ Create `features/media/MediaGrid.tsx`
16. ✅ Create `features/albums/AlbumCard.tsx`
17. ✅ Update `shared/ui/` components with new theme
18. ✅ Create `shared/components/Navigation.tsx`

### Phase 5: Cleanup

19. ✅ Remove old `pages/` folder
20. ✅ Remove unused dependencies
21. ✅ Update `main.tsx` and `App.tsx` to use new structure
22. ✅ Verify build and fix any linter errors

---

## GraphQL Integration

### Viewer Query Pattern

```graphql
query Viewer {
  viewer {
    id
    name
    email
    role
  }
}
```

### Auth Bootstrap Flow

1. App starts → show loading skeleton
2. Run viewer query
3. If `viewer = null` → show LoggedOutScreen
4. If `viewer` exists → show AppShell with authenticated routes
5. Auth state lives in GraphQL cache, not separate context

### Data Fetching Pattern

- Screens own route-level GraphQL queries
- Child components receive props (presentational)
- No duplicated server state in React state
- React Query for REST if needed (uploads, etc)

---

## Visual Components Needed

### Immediate

- MediaGrid (responsive masonry/grid)
- AlbumCard (cover image + metadata)
- Navigation (subtle sidebar or top nav)
- LoadingShell (skeleton during bootstrap)
- MediaViewer (full-screen lightbox)

### Later

- Upload dropzone
- Sharing controls
- Member avatars
- Date grouping headers
- Search/filter controls

---

## Success Criteria

✅ No generic blue SaaS styling
✅ Warm dark editorial aesthetic throughout
✅ Viewer query bootstraps auth state
✅ HomeScreen shows photo grid
✅ AppShell provides navigation
✅ Routes for Home, Album, MediaItem exist
✅ Theme is premium and image-first
✅ Build compiles without errors
✅ Folder structure matches plan

---

## Migration Notes

### Keep Using

- AuthContext can stay during migration (or replace with GraphQL viewer)
- useApiFetch can stay for non-GraphQL endpoints (uploads)
- Existing Primitives components (update styling)

### Deprecate Gradually

- REST endpoints → move to GraphQL
- localStorage token → could move to httpOnly cookie (later)
- Inline styled-components → use theme consistently

### Delete Immediately

- Generic Login page styling (keep logic)
- Placeholder Home page
- Unused dependencies
