// ============================================================
// RIVALS.JS — Rival AI Behaviors & Detection
// ============================================================

const Rivals = {
  states: {},

  initialize() {
    this.states = {};
    for (const rival of DATA.rivals) {
      this.states[rival.id] = {
        id: rival.id,
        power: Utils.randomInt(10, 25),
        influence: 0,
        detectedActions: 0,
        totalActions: 0,
        active: true,
        targetedCharacters: [],
        targetedOrgs: [],
        history: []
      };
    }
  },

  act(gameState) {
    const { year, characters, organizations } = gameState;
    const era = Utils.getEra(year);
    const actions = [];
    const anomalies = [];

    for (const rival of DATA.rivals) {
      const state = this.states[rival.id];
      if (!state || !state.active) continue;

      // IP scales with era
      const ip = 3 + era.id * 2 + Math.floor(state.power / 20);
      
      // Maybe interact with prediction markets
      if (typeof Market !== 'undefined' && Utils.roll(30)) {
        const playerSupporters = characters.filter(c => c.alive && c.manipulatedBy.some(m => m.by === 'player'));
        if (playerSupporters.length > 0) {
          const target = Utils.pick(playerSupporters);
          let market = gameState.markets ? gameState.markets.find(m => m.targetId === target.id && !m.resolved) : null;
          const betAmount = Utils.randomInt(5, 15);
          
          if (!market) {
             Market.createMarket(target.id, year, 'alive', betAmount, rival.id, gameState);
             anomalies.push({
               id: Utils.uuid(), year, rivalId: rival.id, rivalName: rival.name,
               rivalIcon: DATA.rivals.find(r => r.id === rival.id)?.icon || '[?]',
               text: `[!] Suspicious market activity detected on ${target.name}'s survival`,
               targetName: target.name, actionType: 'market_open', read: false
             });
          } else {
             Market.placeBet(market.id, 'alive', betAmount, rival.id, gameState);
          }
        }
      }

      const numActions = Utils.randomInt(1, Math.min(3, Math.floor(ip / 2)));

      for (let i = 0; i < numActions; i++) {
        const action = this._chooseAction(rival, state, gameState);
        if (!action) continue;

        state.totalActions++;
        state.history.push({ year, action: action.description });

        // Apply effects
        if (action.target) {
          if (action.targetType === 'character') {
            const char = characters.find(c => c.id === action.target);
            if (char && char.alive) {
              for (const [stat, val] of Object.entries(action.effects)) {
                Characters.applyStatChange(char, stat, val);
              }
              char.manipulatedBy.push({ rivalId: rival.id, year, action: action.type });
              state.targetedCharacters.push(char.id);
            }
          } else if (action.targetType === 'org') {
            const org = organizations.find(o => o.id === action.target);
            if (org && org.active) {
              org.backedBy = rival.id;
              org.power += 5;
              org.aiProgress += 3;
              state.targetedOrgs.push(org.id);
            }
          }
        }

        // Update rival power
        state.power = Utils.clamp(state.power + Utils.randomInt(1, 3), 0, 100);
        state.influence += Utils.randomInt(1, 5);

        // Apply world state effects based on rival personality
        if (rival.personality.aggression > 60) {
          gameState.worldState.militarization = (gameState.worldState.militarization || 0) + 1;
        }
        if (rival.personality.ethics < 30) {
          gameState.worldState.ethics = (gameState.worldState.ethics || 50) - 1;
        }

        actions.push(action);

        // Detection chance - player may notice
        const detectChance = 100 - rival.personality.subtlety + (state.totalActions * 0.5);
        if (Utils.roll(Math.min(detectChance, 40))) {
          state.detectedActions++;
          const anomaly = this._generateAnomaly(rival, action, year);
          anomalies.push(anomaly);
        }
      }
    }

    return { actions, anomalies };
  },

  _chooseAction(rival, state, gameState) {
    const { characters, organizations } = gameState;
    const aliveChars = Characters.getAlive(characters);
    const activeOrgs = organizations.filter(o => o.active);

    // Choose target type based on preferences
    const targetType = Utils.roll(60) ? 'character' : 'org';
    let target = null;
    let targetId = null;

    if (targetType === 'character') {
      // Prefer targets matching rival's preferred professions
      const preferred = aliveChars.filter(c =>
        rival.preferredTargets.includes(c.profession)
      );
      target = preferred.length > 0 ? Utils.pick(preferred) : Utils.pick(aliveChars);
      if (!target) return null;
      targetId = target.id;
    } else {
      const preferred = activeOrgs.filter(o =>
        rival.preferredTargets.includes(o.type)
      );
      target = preferred.length > 0 ? Utils.pick(preferred) : Utils.pick(activeOrgs);
      if (!target) return null;
      targetId = target.id;
    }

    const actionType = Utils.pick(rival.preferredActions);
    const intervention = DATA.interventions[actionType];
    if (!intervention) return null;

    return {
      rivalId: rival.id,
      rivalName: rival.name,
      type: actionType,
      target: targetId,
      targetType,
      targetName: target.name,
      effects: intervention.effects || {},
      description: `${rival.name} used ${intervention.label} on ${target.name}`
    };
  },

  _generateAnomaly(rival, action, year) {
    const templates = [
      `[!] Anomaly detected: ${action.targetName} shows signs of external influence`,
      `[!] Unusual pattern: ${action.targetName}'s behavior doesn't match predictions`,
      `[!] Signal detected: Someone else is manipulating ${action.targetName}`,
      `[!] Warning: Unexplained changes in ${action.targetName}'s trajectory`,
      `[!] ${rival.name}? Interference pattern matches a rival intelligence`
    ];

    return {
      id: Utils.uuid(),
      year,
      rivalId: rival.id,
      rivalName: rival.name,
      rivalIcon: DATA.rivals.find(r => r.id === rival.id)?.icon || '[?]',
      text: Utils.pick(templates),
      targetName: action.targetName,
      actionType: action.type,
      read: false
    };
  },

  getRivalPower() {
    const powers = {};
    for (const rival of DATA.rivals) {
      const state = this.states[rival.id];
      powers[rival.id] = state ? state.power : 0;
    }
    return powers;
  },

  getStrongestRival() {
    let strongest = null;
    let maxPower = 0;
    for (const rival of DATA.rivals) {
      const state = this.states[rival.id];
      if (state && state.power > maxPower) {
        maxPower = state.power;
        strongest = rival;
      }
    }
    return strongest;
  },

  serialize() {
    return JSON.parse(JSON.stringify(this.states));
  },

  deserialize(data) {
    this.states = data || {};
  }
};
