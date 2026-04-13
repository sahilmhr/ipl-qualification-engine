# IPL 2026 - Refactored Project Structure

## Overview

The original monolithic `App.jsx` has been refactored into a modular, production-ready structure following React best practices.

## Folder Structure

```
src/
├── components/
│   ├── common/              # Reusable UI components
│   │   ├── LastResultsBadge.jsx
│   │   ├── StreakBadge.jsx
│   │   ├── PointsChart.jsx
│   │   ├── QualRace.jsx
│   │   └── index.js         # Barrel export
│   ├── shared/              # Shared modal components
│   │   ├── MatchModal.jsx
│   │   └── index.js
│   └── features/            # Feature-specific components
│       ├── Standings.jsx
│       ├── Fixtures.jsx
│       ├── Qualify.jsx
│       ├── Race.jsx
│       ├── Simulator.jsx
│       ├── H2H.jsx
│       ├── Timelapse.jsx
│       ├── HeaderSection.jsx
│       ├── TabNavigation.jsx
│       └── index.js
├── constants/
│   └── index.js            # Teams, fixtures, UI constants
├── utils/
│   ├── storage.js          # localStorage utilities
│   ├── math.js             # All algorithms & computations
│   ├── helpers.js          # Formatting & utility functions
│   └── index.js            # Barrel export
├── hooks/
│   └── index.js            # Custom React hooks
├── App_new.jsx             # Main refactored App (ready to use)
├── App.jsx                 # Original monolithic version (kept for reference)
└── main.jsx
```

## File Descriptions

### Constants (`src/constants/index.js`)

- **TEAMS**: All 10 IPL team details (name, color, ID)
- **RAW**: 70-match fixture schedule
- **teamMap**: Quick lookup object for teams
- **TABS**: Available navigation tabs
- **COLORS**: Color palette for unique references
- **LS_KEY**: LocalStorage key for persistence

### Utils

#### `storage.js`

- `buildFixtures()`: Create fresh fixture list
- `loadFixtures()`: Load from localStorage, merge with schedule
- `saveFixtures()`: Persist to browser storage

#### `math.js`

- `parseOvers()`: Parse cricket overs format
- `computeStandings()`: Calculate current standings
- `computePointsProgression()`: Track points over time
- `maxFlowEK()`: Edmonds-Karp max-flow algorithm
- `combinations()`: Generate k-combinations
- `canFourTeamsExceed()`: Max-flow qualification check
- `computeQualification()`: Determine team qualification status
- `findCriticalMatches()`: Identify pivotal matches

#### `helpers.js`

- `fmtNRR()`: Format net run rate
- `fmtScore()`: Format match scores
- `applyScenario()`: Apply hypothetical results
- `buildBestScenario()`: Auto-fill best case scenario
- `exportStandingsText()`: Export standings as text

### Hooks (`src/hooks/index.js`)

- `useFixtures()`: Manage fixtures with auto-save
- `useStandings()`: Memoized standings computation
- `useRankedTeams()`: Sorted team rankings
- `usePointsProgression()`: Points history
- `useAllQualification()`: All teams' qualification status
- `useH2HStats()`: Head-to-head statistics

### Components

#### Common (`src/components/common/`)

Presentational components used across features:

- `LastResultsBadge`: Shows last 4 match results
- `StreakBadge`: Displays current streak
- `PointsChart`: SVG line chart for points progression
- `QualRace`: Qualification race visualization

#### Shared (`src/components/shared/`)

- `MatchModal`: Enter/edit match results

#### Features (`src/components/features/`)

Tab-specific components:

- `Standings`: Current standings table + points chart
- `Fixtures`: Browse and edit all matches
- `Qualify`: Calculate team qualification scenarios
- `Race`: Overall qualification race for all teams
- `Simulator`: What-if scenario simulator
- `H2H`: Head-to-head comparison
- `Timelapse`: Standings progression over time
- `HeaderSection`: App title, export buttons
- `TabNavigation`: Tab switcher

### Main App (`App_new.jsx`)

Entry point that:

- Manages global state (fixtures, selected team, etc.)
- Orchestrates all hooks and computations
- Routes to feature components based on active tab
- Handles import/export and data persistence

## Key Improvements

✅ **Modularity**: Each feature is self-contained
✅ **Reusability**: Common components can be used anywhere
✅ **Maintainability**: Logic separated from UI
✅ **Testability**: Functions are pure and isolated
✅ **Performance**: Memoized computations reduce rerenders
✅ **Scalability**: Easy to add new features
✅ **Code Organization**: Clear responsibility boundaries

## Usage

1. **Replace App.jsx**:

   ```bash
   mv src/App.jsx src/App_original.jsx
   mv src/App_new.jsx src/App.jsx
   ```

2. **All logic is preserved**: No functional changes, only structural reorganization.

3. **Import patterns**:

   ```javascript
   // Direct imports
   import { PointsChart } from "./components/common";

   // From utils
   import { fmtNRR, fmtScore } from "./utils/helpers";

   // From hooks
   import { useFixtures, useStandings } from "./hooks";

   // From constants
   import { TEAMS, COLORS } from "./constants";
   ```

## Migration Checklist

- [x] Extract constants
- [x] Extract storage utilities
- [x] Extract math algorithms
- [x] Extract helper functions
- [x] Create custom hooks
- [x] Create common components
- [x] Create feature components
- [x] Create layout components
- [x] Assemble main App
- [x] Verify all logic intact

## Next Steps

### To activate the refactored version:

1. Replace Old `App.jsx` with `App_new.jsx`
2. Update `main.jsx` to import correct App
3. Test all tabs and features

### Possible Future Enhancements:

- Add TypeScript for type safety
- Add unit tests for isolated functions
- Extract theme to CSS variables file
- Add component unit tests
- Add E2E tests
- Implement context API for global state
- Add error boundaries
