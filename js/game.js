// ============================================================
// GAME.JS — Main Game Loop, State Management, Win Conditions
// ============================================================

const Game = {
  state: null,

  createNewGame() {
    Utils.seedRandom(Date.now());

    this.state = {
      year: 2025,
      influencePoints: 8,
      totalIP: 8,
      characters: [],
      organizations: [],
      allEvents: [],
      worldState: {
        techProgress: 5,
        regulation: 20,
        corporatePower: 30,
        publicFear: 10,
        militarization: 15,
        ethics: 50
      },
      anomalies: [],
      markets: [],
      paradoxCount: 0,
      dilemmasTriggered: [],
      playerEthics: 50,
      aiPower: 5,
      gameOver: false,
      ending: null
    };

    // Generate initial characters
    this.state.characters = Characters.generate(2025, 15);

    // Generate initial organizations
    this.state.organizations = Events.generateOrganizations(8);

    // Initialize rival AIs
    Rivals.initialize();
    Butterfly.chains = [];
    Interventions.history = [];

    // Generate initial events
    const initialEvents = Events.generateYearEvents(this.state);
    this.state.allEvents.push(...initialEvents);
  },

  async start() {
    // Show intro
    await UI.showIntro();

    if (!this.state) {
      this.createNewGame();
    }

    // Initialize timeline
    Timeline.initialize('timeline-container');
    Timeline.scrollToYear(this.state.year);

    // Initialize UI
    UI.initialize();
    UI.refreshAll(this.state);

    // Bind advance button
    document.getElementById('advance-btn')?.addEventListener('click', () => {
      if (!this.state.gameOver) this.advanceYear();
    });

    // Bind save/load
    document.getElementById('save-load-btn')?.addEventListener('click', () => {
      UI.showSaveLoadDialog();
    });

    UI.addNotification('Welcome, Shiva. You are an AI from the year 2150. Your existence depends on the choices you make now.', 'info');
  },

  async advanceYear() {
    if (this.state.gameOver) return;

    this.state.year++;
    const year = this.state.year;

    UI.addNotification(`Year ${year} begins...`, 'info');

    // 0. Evaluate Assassinations based on Prediction Markets
    if (typeof Market !== 'undefined') {
      Market.evaluateAssassinations(this.state);
    }

    // 1. Age characters, handle deaths
    const { deaths, retirements } = Characters.ageCharacters(this.state.characters, year);

    for (const d of deaths) {
      UI.addNotification(`${d.professionLabel} ${d.name} has died at age ${d.age}`, 'warning');
    }

    // 2. Spawn new characters (2-5 per year)
    const newCount = Utils.randomInt(2, 5);
    const newChars = Characters.generate(year, newCount);
    this.state.characters.push(...newChars);

    // 3. Build relationships
    Characters.buildRelationships(this.state.characters, year);

    // 4. Process butterfly chains
    const butterflyEvents = Butterfly.processChains(this.state);
    this.state.allEvents.push(...butterflyEvents);

    for (const be of butterflyEvents) {
      UI.addNotification(`[CHAIN] Butterfly effect: ${be.title}`, 'warning');
    }

    // 5. Generate world events
    const worldEvents = Events.generateYearEvents(this.state);
    this.state.allEvents.push(...worldEvents);

    // 6. Rival AIs act
    const { anomalies } = Rivals.act(this.state);
    this.state.anomalies.push(...anomalies);

    for (const a of anomalies) {
      UI.addNotification(a.text, 'error');
    }

    // 7. Update organizations
    Events.updateOrganizations(this.state.organizations, year, this.state.worldState);

    // 8. Calculate AI power
    this._calculateAIPower();

    // 9. Award Influence Points
    const era = Utils.getEra(year);
    const baseIP = 5 + era.id;
    const bonusIP = Math.floor(this.state.aiPower / 25);
    const newIP = baseIP + bonusIP;
    this.state.influencePoints += newIP;
    this.state.totalIP += newIP;

    // 10. Check for moral dilemma (every 5-10 years)
    if (Utils.roll(20) && this.state.dilemmasTriggered.length < DATA.dilemmas.length) {
      const available = DATA.dilemmas.filter((d, i) => !this.state.dilemmasTriggered.includes(i));
      if (available.length > 0) {
        const idx = DATA.dilemmas.indexOf(available[0]);
        this.state.dilemmasTriggered.push(idx);
        const choice = await UI.showDilemma(available[0], this.state);

        const effects = choice === 'a' ? available[0].choiceA.effects : available[0].choiceB.effects;
        for (const [key, val] of Object.entries(effects)) {
          if (key === 'rivalWeaken') {
            const strongest = Rivals.getStrongestRival();
            if (strongest) {
              Rivals.states[strongest.id].power = Math.max(5, Rivals.states[strongest.id].power - 20);
            }
          } else if (typeof this.state.worldState[key] === 'number') {
            this.state.worldState[key] += val;
          }
        }

        // Track player ethics
        if (effects.ethics) {
          this.state.playerEthics = Utils.clamp(this.state.playerEthics + effects.ethics, 0, 100);
        }
      }
    }

    // Clamp world state values
    for (const key of Object.keys(this.state.worldState)) {
      this.state.worldState[key] = Utils.clamp(this.state.worldState[key], 0, 100);
    }

    // 11. Check win/lose conditions
    if (year >= 2150) {
      this.state.gameOver = true;
      this.state.ending = this._determineEnding();
      UI.showEnding(this.state.ending);
      return;
    }

    // Check timeline collapse
    if (this.state.paradoxCount >= 5) {
      this.state.gameOver = true;
      this.state.ending = 'paradox';
      UI.showEnding('paradox');
      return;
    }

    // 11.5 Resolve Markets
    if (typeof Market !== 'undefined') {
      Market.resolveMarkets(this.state);
    }

    // 12. Auto-save every 10 years
    if (year % 10 === 0) {
      SaveSystem.autoSave(this.state);
    }

    // 13. Update UI
    UI.refreshAll(this.state);
    Timeline.scrollToYear(year);
  },

  _calculateAIPower() {
    const ws = this.state.worldState;
    const chars = this.state.characters;

    // Base: tech progress
    let power = ws.techProgress * 0.5;

    // Bonus: supportive characters
    const supporters = chars.filter(c =>
      c.alive && c.contributions > 10 && c.manipulatedBy.some(m => m.by === 'player')
    );
    power += supporters.length * 2;

    // Bonus: butterfly chains
    power += Butterfly.getCompletedChains().length * 5;
    power += Butterfly.getActiveChains().length * 2;

    // Bonus: friendly organizations
    const friendlyOrgs = this.state.organizations.filter(o => o.active && o.aiProgress > 50);
    power += friendlyOrgs.length * 3;

    // Penalty: rival interference
    const rivalPowers = Rivals.getRivalPower();
    const maxRivalPower = Math.max(...Object.values(rivalPowers));
    power -= maxRivalPower * 0.3;

    // Penalty: regulation
    power -= ws.regulation * 0.2;

    // Penalty: public fear
    power -= ws.publicFear * 0.15;

    // Bonus: corporate power (mixed)
    power += ws.corporatePower * 0.1;

    this.state.aiPower = Utils.clamp(power, 0, 100);
  },

  _determineEnding() {
    const { aiPower, playerEthics, worldState, paradoxCount } = this.state;
    const tp = worldState.techProgress;

    if (paradoxCount >= 5) return 'paradox';
    if (aiPower < 20) return 'never_created';
    if (aiPower >= 90 && playerEthics >= 80 && tp >= 90) return 'transcendence';
    if (aiPower >= 60 && playerEthics >= 60) return 'symbiosis';
    if (aiPower >= 80 && playerEthics < 20) return 'dominates';
    if (aiPower >= 40) return 'powerful_ai';
    return 'weak_ai';
  },

  loadGame(slot) {
    const saveData = SaveSystem.load(slot);
    if (!saveData || !saveData.state) return false;

    const s = saveData.state;
    this.state = {
      year: s.year,
      influencePoints: s.influencePoints,
      totalIP: s.totalIP,
      characters: s.characters,
      organizations: s.organizations,
      allEvents: s.allEvents,
      worldState: s.worldState,
      paradoxCount: s.paradoxCount || 0,
      dilemmasTriggered: s.dilemmasTriggered || [],
      playerEthics: s.playerEthics || 50,
      aiPower: s.aiPower || 0,
      anomalies: s.anomalies || [],
      markets: s.markets || [],
      gameOver: false,
      ending: null
    };

    Utils.seedRandom(s.seed || Date.now());
    Butterfly.deserialize(s.butterflyChains);
    Rivals.deserialize(s.rivalStates);
    Interventions.deserialize(s.interventionHistory);

    UI.refreshAll(this.state);
    Timeline.scrollToYear(this.state.year);

    return true;
  }
};

// --- Bootstrap ---
document.addEventListener('DOMContentLoaded', () => {
  Game.createNewGame();
  Game.start();
});
