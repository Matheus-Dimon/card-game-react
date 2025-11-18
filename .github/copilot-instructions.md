<!-- Auto-generated guidance for AI coding agents working on this repo. -->
# Copilot instructions for this repository

This repository currently contains a single-file React game at `cardgame.jsx`. The file implements the entire game (state, reducer, AI, UI) in one place. Use these notes to be immediately productive when making changes.

1. Big-picture architecture
- Single-file React app: `cardgame.jsx` exports a default `App` component. The game uses `useReducer` for all game state.
- Central reducer: `gameReducer(state, action)` holds the canonical state shape and all action types. Treat this reducer as the single source of truth for game rules and transitions.
- Game phases: `gamePhase` values are `SETUP`, `HERO_SETUP`, `PLAYING`, `GAME_OVER`. Many UI branches depend on this.
- Players: state keys are `player1` and `player2`. Each player object has `{ hp, mana, maxMana, hand, field: { melee, ranged }, deck, heroPowers, hasUsedHeroPower }`.
- Lanes: each player's `field` contains `melee` and `ranged` arrays. `MAX_LANE_SIZE` governs limits.

2. Important action names & payload shapes (use these exactly)
- `PLAY_CARD` payload: `{ card, playerKey }` — card object from hand.
- `SELECT_ATTACKER` payload: `{ cardId }` — toggles selection.
- `INITIATE_ANIMATION` payload: `{ attackerCard, startRect, endRect, actionType, callbackAction }` — used for visual animation; `callbackAction` is dispatched after animation completes.
- `APPLY_ATTACK_DAMAGE` payload: `{ attackerId, targetId, isHeroTarget, actionType, playerKey }` — resolves damage/healing on reducer side.
- `END_TURN` no payload — advances turn and handles draw/fatigue logic.
- `SET_AI_PROCESSING` payload: `boolean` — toggles `isAITurnProcessing` to block player input while AI runs.

3. UI & DOM conventions (important for automation/tests)
- Cards rendered include `data-card-id` attributes (e.g., `<div data-card-id="${card.id}">`). The AI and animation code query the DOM via `document.querySelector(`[data-card-id="..."]`)` and reads `getBoundingClientRect()` for animations.
- Hero components are referenced via `hero1Ref` and `hero2Ref` and target IDs for heroes are string constants `'player1_hero'` and `'player2_hero'`.
- Animations rely on `ANIMATION_DURATION` and dispatch the `callbackAction` after timeout. If testing logic-only paths, you can bypass animation by directly dispatching `APPLY_ATTACK_DAMAGE`.

4. Game data & conventions
- Unit types are defined in `UNIT_TYPES` and referenced by identity (e.g. `card.type === UNIT_TYPES.CLERIC`). Code relies on these being the same object references.
- Card IDs are created during setup by appending timestamps/random to base ids (see `START_HERO_SETUP`). Expect unpredictable IDs in tests; use pattern matching or stable mocks.
- Targetability rules live in `getTargetability(...)` and are central to valid actions. They enforce: Cleric = only heal allies; Warrior = melee-only against enemy melee lane; Archer = ranged target-anything including hero.
- State log: `state.log` stores recent messages with newest entries at the front (index 0).

5. AI behavior and constraints
- AI logic is in `runAITurn(stateSnapshot, dispatch, hero1Ref)`. It:
  - filters playable cards by current mana and plays the highest-cost ones into their correct lane,
  - then attempts attacks/heals using simple heuristics (target weakest, heal most-damaged ally or hero),
  - uses DOM queries and animation dispatches — so headless unit tests must mock `document.querySelector` and `getBoundingClientRect` or run under jsdom with simulated layout.

6. Testing and debugging tips
- Unit tests should focus on reducer logic by calling `gameReducer(initialState, action)` with crafted actions — this avoids DOM/animation dependencies.
- To test AI logic without DOM: call `runAITurn` with a fake `dispatch` and mock `document.querySelector` and refs. Alternatively, directly assert reducer changes after the AI sequence by simulating `PLAY_CARD` and `APPLY_ATTACK_DAMAGE` actions.
- For quick manual runs, import `App` into a React app (Create React App or Vite) and ensure tailwind-like classes are available or replace with CSS — the project uses Tailwind-style class names but no build tooling exists in this repository.

7. Priority patterns for code changes
- Modifying game rules: update `gameReducer` action handlers and mirror changes in `getTargetability` and AI heuristics.
- Visual/animation changes: adjust `AnimationLayer` and `INITIATE_ANIMATION` payload handling — keep `callbackAction` structure intact so game effects remain reducer-driven.
- New components: keep UI purely presentational; side-effects (state changes) should go through `dispatch` actions handled by `gameReducer`.

8. Files to look at when editing
- `cardgame.jsx` — everything is here; open top-to-bottom to see constants, reducer, AI, and UI.

If you want, I can: (a) split `cardgame.jsx` into smaller modules (state, ai, components), (b) scaffold a minimal `package.json` + Vite/CRA wrapper to run the app, or (c) add unit tests for the reducer and AI. Which would you prefer? Please indicate any unclear areas to iterate.
