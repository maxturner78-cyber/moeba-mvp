

## Plan: Update sidebar section label to use object lookup

### Change
**`src/components/AppSidebar.tsx`** — Line 68: Replace the ternary `{activeTab === "graduate" ? "INSIGHTS" : "TEAM"}` with an object lookup:

```ts
{{ graduate: "INSIGHTS", manager: "TEAM", peer: "COLLEAGUES" }[activeTab]}
```

Single-line replacement. No other changes.

