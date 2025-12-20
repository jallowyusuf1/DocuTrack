# Shortcuts Panel Fix - Execution Plan

## Problem Statement
- Shortcuts panel is too large
- Should be in same card as search bar
- Button should say "Open Shortcuts" (changes to "Close Shortcuts" when open)
- Shortcuts should appear underneath button in same card
- Filters should appear below (not covered/overlapping)
- Panel should be hidden by default

## Execution Steps

### Step 1: Verify Current State
- [x] Check if `showShortcuts` state exists and defaults to `false`
- [x] Verify shortcuts are in same card container as search bar
- [x] Check button text changes correctly
- [x] Verify shortcuts panel is conditionally rendered

### Step 2: Ensure Panel is Hidden by Default
- [ ] Verify `const [showShortcuts, setShowShortcuts] = useState(false);` is set
- [ ] Remove any code that shows shortcuts by default
- [ ] Test that panel doesn't render when `showShortcuts === false`

### Step 3: Make Shortcuts Much Smaller
- [ ] Reduce font sizes further (target: 7px keys, 6px labels)
- [ ] Reduce padding/spacing
- [ ] Make grid more compact (reduce gap)
- [ ] Minimize overall height

### Step 4: Verify Card Structure
- [ ] Search bar is inside card container
- [ ] Button is directly below search bar in same card
- [ ] Shortcuts panel is directly below button in same card
- [ ] All three elements share same parent container

### Step 5: Ensure Filters Appear Below
- [ ] Verify two-column layout starts AFTER the search card
- [ ] Check no absolute positioning overlaps filters
- [ ] Ensure proper spacing/margin between card and filters
- [ ] Test that filters are fully visible when shortcuts are open

### Step 6: Test Button Functionality
- [ ] Button text shows "Open Shortcuts" when closed
- [ ] Button text shows "Close Shortcuts" when open
- [ ] Clicking button toggles `showShortcuts` state
- [ ] Panel animates in/out smoothly

### Step 7: Final Verification
- [ ] Panel is hidden on page load
- [ ] Clicking "Open Shortcuts" shows panel
- [ ] Panel is compact and small
- [ ] Filters are visible below
- [ ] No overlapping or covering

## Implementation Checklist

```
1. Verify showShortcuts state initialization
2. Ensure shortcuts panel is conditionally rendered (only when showShortcuts === true)
3. Make shortcuts text extremely small (7px keys, 6px labels)
4. Reduce all padding/margins in shortcuts panel
5. Verify card structure (search + button + shortcuts all in one container)
6. Check filters sidebar starts after search card (proper spacing)
7. Test button text toggle
8. Test panel show/hide animation
9. Verify no absolute positioning causing overlap
10. Final visual check - everything should be compact and properly positioned
```

