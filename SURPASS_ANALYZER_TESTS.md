# Surpass Possibility Analyzer - Test Cases & Examples

## Test Case 1: Basic Functionality

### Setup
- Open the app
- Navigate to the "Surpass" tab
- Select "DC" (Delhi Capitals)

### Expected Results
✓ Summary card displays:
  - Team: DC
  - Current Points: (matches current standings)
  - Remaining Matches: (matches unplayed fixtures)
  - Max Possible Pts: Current + (Remaining × 2)

✓ Table sections display properly:
  - Green section: "CAN SURPASS" with team count
  - Red section: "CANNOT SURPASS" with team count

---

## Test Case 2: Verify Max Points Calculation

### Setup
- Select a team with known stats
- Example: Team X with 16 points, 3 matches remaining

### Calculation
- Max Points = 16 + (3 × 2) = 16 + 6 = **22 points**

### Expected Result
- Max Points shown = 22 ✓

### Formula Verification
For any team:
```
Max Possible Points = Current Points + (Remaining Matches × 2)
```

---

## Test Case 3: Surpass Logic

### Scenario
- Selected Team: DC (20 points, 2 matches remaining)
- Other Team: MI (15 points, 2 matches remaining)

### Analysis
1. DC max = 20 + (2 × 2) = 24 pts
2. MI max = 15 + (2 × 2) = 19 pts
3. Can MI surpass DC?
   - MI's max (19) > DC's current (20)? NO
   - Therefore: MI **CANNOT SURPASS** DC

### Expected Result
- MI appears in "CANNOT SURPASS" section with:
  - Current Pts: 15
  - Max Pts: 19
  - Short By: 1 pts

---

## Test Case 4: Team Selection Changes

### Setup
1. Select "DC"
2. Note the results
3. Select "MI"
4. Verify results change

### Expected Behavior
✓ All data recalculates instantly
✓ Different teams appear in "Can Surpass" vs "Cannot Surpass"
✓ Numbers update accordingly

---

## Test Case 5: Real-time Updates

### Setup
1. In "Surpass" tab, select "DC"
2. Open "Fixtures" tab in parallel tab
3. Add a result for one of DC's remaining matches
4. Return to "Surpass" tab

### Expected Changes
✓ Remaining Matches: decreases by 1
✓ Max Possible Pts: decreases by 2 (one fewer win possible)
✓ "Can Surpass" / "Cannot Surpass" lists may shift
  (Some teams might move between categories)

---

## Test Case 6: Edge Case - Team Already Eliminated

### Setup
- Imagine Team A: 22 points, 0 matches remaining
- Team B: 18 points, 2 matches remaining

### Analysis
1. Team B max = 18 + (2 × 2) = 22 pts
2. Can B surpass A?
   - Team B max (22) > Team A current (22)? NO (must be strictly greater)
   - Therefore: Team B **CANNOT SURPASS** Team A
   - Short By: 0 pts (tied at best)

### Expected Result
- Team B in "CANNOT SURPASS" with 0 pts deficit
- Indicates Team B can match but not surpass

---

## Test Case 7: Team with All Wins Possible

### Setup
- Team X: 10 points, 4 matches remaining (maximum wins possible: 8 pts)
- Team Y (selected): 12 points

### Analysis
1. Team X max = 10 + (4 × 2) = 18 pts
2. Can X surpass Y?
   - 18 > 12? YES
   - Therefore: Team X **CAN SURPASS** Team Y

### Expected Data for Team X
- Max Pts: 18
- Wins Needed: Calculate how many wins to beat 12
  - Need: 12 - 10 + 1 = 3 wins minimum
  - Wins Needed: 3/4

---

## Test Case 8: Multiple Team Comparison

### Setup
- Select "DC"
- Observe the full "Can Surpass" list

### Verification Checklist
✓ Teams sorted by max points (highest first)
✓ Each row has correct calculations
✓ No team appears in both "Can" and "Cannot" sections
✓ Total teams = 9 (all except DC)

### Math Verification
For each team shown, verify:
```
Team Max Points > DC Current Points? 
- YES → In "Can Surpass" (green)
- NO  → In "Cannot Surpass" (red)
```

---

## Test Case 9: UI Consistency

### Checklist
✓ Team selector buttons show all 10 teams
✓ Selected team button highlighted with team color
✓ Summary card displays all 4 metrics
✓ Table headers are readable
✓ Data rows alternate shading for readability
✓ Numbers right-aligned in numeric columns
✓ Team colors match their actual IPL colors

---

## Test Case 10: No Breaking Changes

### Verification
1. All other tabs still work:
   - ✓ Standings calculation unchanged
   - ✓ Qualify logic unchanged
   - ✓ Fixtures data unchanged
   - ✓ Scenarios still work
   - ✓ All UI consistent

2. Data sources unchanged:
   - ✓ `standings` object structure unchanged
   - ✓ `fixtures` array structure unchanged
   - ✓ Team colors/names unchanged

---

## Test Case 11: Performance Check

### Setup
- Have 14 matches results entered
- Switch between "Surpass" and other tabs multiple times

### Expected Behavior
✓ No lag or delays
✓ Smooth transitions
✓ Calculations happen instantly
✓ Memory usage remains low

---

## Test Case 12: Empty Remaining Matches

### Setup
- Imagine all 14 matches played for all teams
- Select any team

### Expected Behavior
✓ Remaining Matches: 0 for all teams
✓ Max Possible Pts: Same as current points
✓ "Can Surpass" only shows teams with higher current points
✓ "Cannot Surpass" shows teams with same or lower points

---

## Manual Test Walkthrough

### Quick Verification Script
```
1. Open app
2. Go to "Surpass" tab
3. Select "DC" → Verify summary shows correct DC stats
4. Verify "Can Surpass" and "Cannot Surpass" sections split
5. Click "MI" → Verify all data updates
6. Go to "Fixtures" → Add a result
7. Return to "Surpass" → Verify numbers changed
8. Go to "Standings" → Verify still works correctly
9. Return to "Surpass" → Verify recalculated
10. ✓ All tests pass!
```

---

## Debug Tips

If something looks wrong:

1. **Check Remaining Matches:**
   ```
   Unplayed fixtures for team = fixtures.filter(f => !f.result && (f.a === teamId || f.b === teamId)).length
   ```

2. **Check Max Points:**
   ```
   Max = currentPoints + (remainingMatches * 2)
   ```

3. **Check Surpass Logic:**
   ```
   canSurpass = (teamMaxPoints > selectedTeamCurrentPoints)
   ```

4. **Verify Results Display:**
   - Green section: Only teams where max > selected current
   - Red section: Only teams where max <= selected current

5. **Check Team Colors:**
   - Each team should use color from TEAMS array
   - Verify colors match existing app colors

---

## Summary

The Surpass Possibility Analyzer successfully:
✓ Calculates max points mathematically
✓ Determines surpass possibility
✓ Displays results intuitively
✓ Updates in real-time
✓ Never breaks existing functionality
✓ Provides clear, actionable insights

All tests should pass before considering the feature complete.
