// ============================================================
// INTERVENTIONS.JS — Player Action System
// ============================================================

const Interventions = {
  history: [],

  getAvailable(gameState) {
    const { influencePoints } = gameState;
    const available = [];

    for (const [key, intervention] of Object.entries(DATA.interventions)) {
      available.push({
        ...intervention,
        affordable: influencePoints >= intervention.cost,
        disabled: influencePoints < intervention.cost
      });
    }

    return available;
  },

  getValidTargets(interventionId, gameState) {
    const intervention = DATA.interventions[interventionId];
    if (!intervention) return [];

    const { characters, organizations } = gameState;
    const targets = [];

    // Character targets
    const validProfessions = intervention.targets.filter(t =>
      Object.keys(DATA.professions).includes(t)
    );

    for (const char of Characters.getAlive(characters)) {
      if (validProfessions.includes(char.profession)) {
        targets.push({
          id: char.id,
          name: char.name,
          type: 'character',
          icon: char.icon,
          subtitle: `${char.professionLabel} • ${char.specialization}`,
          stats: char.stats,
          successModifier: this._calculateSuccessModifier(intervention, char)
        });
      }
    }

    // Sort by influence descending
    targets.sort((a, b) => b.stats.influence - a.stats.influence);
    return targets;
  },

  _calculateSuccessModifier(intervention, target) {
    let modifier = 0;

    // High intelligence makes targets harder to manipulate
    if (target.stats.intelligence > 70) modifier -= 10;
    if (target.stats.intelligence > 90) modifier -= 10;

    // High ethics makes certain actions harder
    if (['sabotage', 'leak'].includes(intervention.id) && target.stats.ethics > 60) {
      modifier -= 15;
    }

    // High ambition makes inspire/fund easier
    if (['inspire', 'fund'].includes(intervention.id) && target.stats.ambition > 60) {
      modifier += 10;
    }

    // Already manipulated = harder
    if (target.manipulatedBy && target.manipulatedBy.length > 0) {
      modifier -= target.manipulatedBy.length * 5;
    }

    return modifier;
  },

  execute(interventionId, targetId, gameState) {
    const intervention = DATA.interventions[interventionId];
    if (!intervention) return { success: false, message: 'Unknown intervention' };

    if (gameState.influencePoints < intervention.cost) {
      return { success: false, message: 'Not enough Influence Points' };
    }

    const target = gameState.characters.find(c => c.id === targetId);
    if (!target || !target.alive) {
      return { success: false, message: 'Invalid target' };
    }

    // Deduct cost
    gameState.influencePoints -= intervention.cost;

    // Calculate success
    const modifier = this._calculateSuccessModifier(intervention, target);
    const finalChance = Utils.clamp(intervention.baseSuccess + modifier, 5, 95);
    const succeeded = Utils.roll(finalChance);

    const result = {
      success: succeeded,
      interventionId,
      interventionLabel: intervention.label,
      targetId,
      targetName: target.name,
      cost: intervention.cost,
      chance: finalChance,
      year: gameState.year,
      sideEffect: null,
      butterflyChain: null,
      message: ''
    };

    if (succeeded) {
      // Apply effects
      for (const [stat, val] of Object.entries(intervention.effects)) {
        Characters.applyStatChange(target, stat, val);
      }

      target.manipulatedBy.push({
        action: interventionId,
        year: gameState.year,
        by: 'player'
      });

      target.contributions += Math.abs(intervention.effects.intelligence || 0) +
                              Math.abs(intervention.effects.influence || 0);
      target.history.push({
        year: gameState.year,
        text: `Was ${intervention.label.toLowerCase()}d by an unknown force`
      });

      result.message = `✓ Successfully used ${intervention.label} on ${target.name}`;

      // Create butterfly chain seed
      const seedEvent = {
        id: Utils.uuid(),
        year: gameState.year,
        type: 'intervention',
        title: `${intervention.label}: ${target.name}`,
        description: `You used ${intervention.label} on ${target.name}. The consequences will ripple through time.`,
        involvedCharacters: [target.id],
        involvedOrgs: [],
        causes: [],
        consequences: [],
        butterflyChainId: null,
        aiInfluence: { playerId: 'shiva' },
        rivalHint: false,
        moralWeight: interventionId === 'sabotage' || interventionId === 'leak' ? -10 : 0,
        effects: {},
        read: true
      };

      gameState.allEvents.push(seedEvent);
      const chain = Butterfly.createSeed(seedEvent, interventionId, gameState.year);
      result.butterflyChain = chain.id;

      // Update tech progress for relevant actions
      if (['inspire', 'fund', 'dream'].includes(interventionId) && target.profession === 'scientist') {
        gameState.worldState.techProgress = (gameState.worldState.techProgress || 0) + 2;
      }
    } else {
      result.message = `✗ ${intervention.label} on ${target.name} failed (${finalChance}% chance)`;
    }

    // Check for side effects (regardless of success)
    for (const sideEffect of intervention.sideEffects) {
      if (Utils.roll(sideEffect.chance)) {
        result.sideEffect = sideEffect;
        result.message += `\n⚠ Unintended: ${sideEffect.desc}`;

        for (const [stat, val] of Object.entries(sideEffect.effect)) {
          Characters.applyStatChange(target, stat, val);
        }

        // Special: Dream Message revealing AI existence
        if (interventionId === 'dream' && sideEffect.desc.includes('reveals existence')) {
          gameState.worldState.publicFear = (gameState.worldState.publicFear || 0) + 15;
          gameState.paradoxCount = (gameState.paradoxCount || 0) + 1;
        }

        break; // Only one side effect per action
      }
    }

    this.history.push(result);
    return result;
  },

  getHistory() {
    return this.history;
  },

  serialize() {
    return JSON.parse(JSON.stringify(this.history));
  },

  deserialize(data) {
    this.history = data || [];
  }
};
