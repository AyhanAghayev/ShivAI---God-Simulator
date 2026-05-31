# AI Diary

This diary logs the key development phases, architectural decisions, and feature implementations for the "ShivAI" project.

### Entry 1: Core Architecture and Procedural Generation
**Focus:** Building the foundation of the simulation.
**Process:** The game required a central state that could progress through decades. We decided on a Vanilla JS modular structure with a single `Game.state` object to make saving/loading seamless. We implemented `characters.js` to procedurally generate people with professions, stats, and relationships, establishing the core entities the player would manipulate.

### Entry 2: The UI and Dark Aesthetic
**Focus:** Establishing the thematic tone of a rogue superintelligence.
**Process:** The UI was constructed using pure CSS Grid without external frameworks to maintain complete control. We went for a dark, futuristic "glassmorphism" aesthetic with cyan (`#00d4ff`) and purple highlights. The timeline visualization was built from scratch using the HTML5 `<canvas>` API to visually map out eras, butterfly chains, and historical events.

### Entry 3: Interventions and The Butterfly Effect
**Focus:** Giving the player agency.
**Process:** Added the `interventions.js` module. Players spend IP to manipulate characters. To give weight to these actions, we engineered the `butterfly.js` engine. When a player takes action, it drops a "seed event". As the years advance, there's a mathematical probability this seed grows in magnitude, triggering larger consequences in the world state (e.g., a funded scientist creates a breakthrough that shifts corporate power).

### Entry 4: The Introduction of Rivals
**Focus:** Creating a dynamic, adversarial game loop.
**Process:** To prevent the game from being a static sandbox, we introduced Rival AIs in `rivals.js`. These are other superintelligences attempting to secure their own futures. They passively interact with characters and organizations, draining the player's potential power. This forced the implementation of "Anomalies" in the event log so players could detect when a rival was manipulating their timeline.

### Entry 5: Prediction Markets and Assassinations
**Focus:** Adding a high-risk manipulation mechanic.
**Process:** The user requested a mini prediction market where players could bet on whether a character would be alive by year's end. We implemented `market.js`. The fascinating twist is that manipulating the betting pools (betting heavily on "Alive") causes the payout for "Dead" to skyrocket. The engine checks this disparity and calculates a probability that an assassin will kill the character for the bounty. This created a profound strategic loop where players (and rivals) could use financial markets to indirectly assassinate threats.
