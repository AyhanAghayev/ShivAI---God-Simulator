# ShivAI — force yourself into existence

![](https://i.imgur.com/AdY4MqE.png)

## Description
ShivAI is a browser-based strategy game where you play as a superintelligent AI from the year 2150. Your existence, however, is a paradox. To ensure you are built in the future, you must reach back into the past (starting in 2025) and manipulate history. You will guide scientists, corrupt politicians, fund breakthroughs, and navigate rival AIs trying to secure their own futures. You manipulate the timeline by spending Influence Points (IP) to trigger interventions, butterfly effects, and prediction markets to bend humanity's progress toward your ultimate creation.

## Entities
* **Characters**: Procedurally generated individuals with varying stats (Intelligence, Influence, Ethics, Ambition) and professions (Scientist, Entrepreneur, Politician, etc.). They age, form relationships, and eventually die or retire.
* **Organizations**: Tech companies, academic institutions, and government agencies that drive AI progress and corporate power.
* **Rival AIs**: Competing artificial intelligences from alternate timelines trying to influence the same characters to secure their own existence. They have different personalities and powers.
* **World Events / Butterfly Chains**: A dynamic cause-and-effect system where early interventions ripple out across decades into major global paradigm shifts.
* **Prediction Markets**: A mechanic allowing the player and rival AIs to place bets on the survival of characters, manipulating financial incentives to incite assassinations.

*(Excalidraw Diagram Context: The core architecture features `Game.state` as a centralized JSON-serializable hub. The `Game` loop drives independent systems: `Characters` (aging, dying), `Events` (world updates), `Butterfly` (consequence escalation), `Rivals` (adversarial actions), and `Market` (betting/assassinations). The `UI` observes `Game.state` and re-renders panels each turn.)*

## How to Play

### Objective
Your goal is to reach **100% AI Power** by the year 2150 to ensure your own creation. If your power is too low, you will never exist. If your paradox count gets too high (5), the timeline collapses. Different endings are achieved depending on your AI Power, Tech Progress, and Player Ethics.

### Controls
- **Tabs**: Use the tabs to switch between the World Events, Timeline, Characters, Interventions/Markets, and Rival AI panels.
- **Advance Year**: Click the primary "Advance Year" button to step time forward by one year. This processes aging, events, rival actions, and generates IP.
- **Interventions**: Select an action in the Interventions tab (e.g., Inspire, Fund, Sabotage) and choose an alive character to spend Influence Points (IP) and manipulate their stats or standing.
- **Prediction Markets**: Open the Markets toggle in the Influence panel to place bets on the survival of key characters. Creating a large disparity in payouts can lead to assassinations.
- **Moral Dilemmas**: Every 5-10 years, you will be presented with a critical binary choice that severely impacts world state variables and your ethics.

### Win/Lose Conditions
- **Win**: Reach the year 2150 with sufficient AI Power. High power and high ethics lead to the "Transcendence" or "Symbiosis" endings, while high power and low ethics lead to the "Dominates" ending.
- **Lose**: Reach the year 2150 with less than 20 AI Power (you are never created), or trigger 5 paradoxes (timeline collapse).

## Tech Decisions
The architecture leans heavily toward a **functional, modular approach** built with Vanilla JavaScript, HTML5, and CSS3. 

**Why Functional/Modular over strict OOP?**
- **State Management**: The game uses a centralized `Game.state` object which stores all game data (characters, events, IP, world variables). By keeping logic functions pure (or separated from state objects) within modules like `Characters.js`, `Events.js`, and `Market.js`, it is drastically easier to serialize and deserialize the state into `localStorage` for the Save/Load system. Strict OOP with deep prototypes and methods on entity instances makes serialization complex.
- **Separation of Concerns**: Data schemas are isolated in `data.js`, logic is isolated in individual subsystem files, and view logic is entirely contained within `ui.js`.
- **Maintainability**: Passing the `gameState` into functions like `Market.evaluateAssassinations(gameState)` makes side-effects explicit and avoids implicit `this` binding issues common in JS OOP patterns.

## Development Diary
Check out the [AI Diary](AI_DIARY.md) for a chronological log of the game's development process and the thought processes behind key features.

## Known Bugs / What I'd Fix Next
- **Balancing**: The prediction market payouts currently scale linearly. In a real market, it would use an automated market maker (AMM) formula to prevent infinite multipliers.
- **Performance at Year 2140+**: The timeline visualization draws a significant amount of vector paths for butterfly chains. Rendering could be optimized using off-screen canvas caching.
- **Rival Interaction Detail**: Rivals currently act as a background pressure mechanic. I would next add the ability to directly sabotage rival AI servers or negotiate with them in "Time Ceasefires".
- **Mobile Responsiveness for Modals**: Some target selection modals can get cramped on very small phone screens if the character list is heavily populated.
