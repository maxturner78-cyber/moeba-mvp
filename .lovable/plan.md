

## Plan: Pass `graduateId` to `GraduateProfile` and make header dynamic

### Changes

**1. `src/pages/Index.tsx`** — Pass `graduateId` prop to `GraduateProfile`
- In the `renderPage` function, update the `GraduateProfile` JSX to include `graduateId={selectedGraduateId!}`
- Simplify the `onBack` to just `() => setSelectedGraduateId(null)`

**2. `src/components/manager/GraduateProfile.tsx`** — Accept and use `graduateId`
- Add `graduateId: string` to the `Props` interface (line 552-554)
- Import `graduates` from `@/data/sampleData` and `statusLabels` from `@/data/teamData`
- Destructure `graduateId` in the component signature (line 558)
- Add lookup: `const graduate = graduates.find(g => g.id === graduateId)` with a `if (!graduate) return null` guard
- Line 592: Replace `Sarah Chen` with `{graduate.name}`
- Line 594: Replace `status="attention"` with `status={graduate.status}`
- Line 596: Replace hardcoded `Graduate Associate · Week 12 · Manager: David Liu` with `{graduate.role} · Week {graduate.week} · Manager: {graduate.managerName}`

All chart data, perception gap values, and check-in brief remain hardcoded for now.

