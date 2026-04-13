

## Plan: Extract DivergenceDot to shared component

### 1. Create `src/components/shared/DivergenceDot.tsx`

- Export `DivergenceDotProps` interface with: `selfScore`, `managerScore`, `peerScore?`, `min?` (default 1), `max?` (default 10), plus the existing `maxGap`, `delay`, `animated` fields.
- Export `DivergenceDot` function component adapted from lines 48-115 of GraduateProfile.tsx.
- Map new prop names internally: `selfScore`→`self`, `managerScore`→`manager`, `peerScore`→`peer`. Use `min`/`max` for position calculation instead of hardcoded `10`.
- When `peerScore` is undefined, render only self+manager dots and bridge between them.
- Import `getGapColor` — either inline it or import from a shared location. Since it's also defined inline in GraduateProfile, I'll duplicate the small helper into the new file.

### 2. Update `src/components/manager/GraduateProfile.tsx`

- Delete the inline `DivergenceDot` component (lines 48-115).
- Import `DivergenceDot` from `@/components/shared/DivergenceDot`.
- Update all call sites (line 218) to use the new prop names: `selfScore={g.self}`, `managerScore={g.manager}`, `peerScore={g.peer}`.

### Technical notes
- The `getGapColor` helper (lines 38-46) is used by both `DivergenceDot` and the rest of GraduateProfile, so it stays in GraduateProfile and is also copied into the new file.
- Position math changes from `(val / 10) * 100` to `((val - min) / (max - min)) * 100`.

