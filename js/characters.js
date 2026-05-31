// ============================================================
// CHARACTERS.JS — Procedural Character Generation & Lifecycle
// ============================================================

const Characters = {
  generate(year, count) {
    const chars = [];
    for (let i = 0; i < count; i++) {
      chars.push(this.createCharacter(year));
    }
    return chars;
  },

  createCharacter(year, overrides = {}) {
    const profKeys = Object.keys(DATA.professions);
    const profKey = overrides.profession || Utils.pick(profKeys);
    const prof = DATA.professions[profKey];
    const age = overrides.age || Utils.randomInt(22, 55);
    const firstName = Utils.pick(DATA.firstNames);
    const lastName = Utils.pick(DATA.lastNames);

    return {
      id: Utils.uuid(),
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      age,
      birthYear: year - age,
      deathYear: year - age + Utils.randomInt(65, 95),
      profession: profKey,
      professionLabel: prof.label,
      specialization: Utils.pick(prof.specializations),
      icon: prof.icon,
      stats: {
        intelligence: Utils.clamp(prof.baseStats.intelligence + Utils.randomInt(-15, 15), 5, 100),
        influence: Utils.clamp(prof.baseStats.influence + Utils.randomInt(-15, 15), 5, 100),
        ethics: Utils.clamp(prof.baseStats.ethics + Utils.randomInt(-15, 15), 5, 100),
        ambition: Utils.clamp(prof.baseStats.ambition + Utils.randomInt(-15, 15), 5, 100)
      },
      goals: this._generateGoals(profKey),
      relationships: [],
      history: [{ year, text: `Entered the field as ${prof.label}` }],
      alive: true,
      retired: false,
      fame: Utils.randomInt(5, 30),
      manipulatedBy: [],
      loyalTo: null,
      turnsActive: 0,
      contributions: 0 // tracks how much they helped AI progress
    };
  },

  _generateGoals(profession) {
    const goalPools = {
      scientist: ['Publish groundbreaking research', 'Win Nobel Prize', 'Build a new AI architecture', 'Understand consciousness', 'Create ethical AI framework'],
      entrepreneur: ['Build billion-dollar company', 'Disrupt the AI industry', 'Acquire competitors', 'Go public', 'Create AI platform'],
      politician: ['Win re-election', 'Pass AI regulation', 'Increase defense budget', 'Lead international AI treaty', 'Build surveillance program'],
      journalist: ['Expose corporate corruption', 'Win Pulitzer Prize', 'Build media empire', 'Investigate AI dangers', 'Become thought leader'],
      activist: ['Ban autonomous weapons', 'Protect AI workers\' rights', 'Fight surveillance state', 'Promote AI ethics', 'Build grassroots movement']
    };
    const pool = goalPools[profession] || goalPools.scientist;
    return [Utils.pick(pool), Utils.pick(pool)].filter((g, i, a) => a.indexOf(g) === i);
  },

  ageCharacters(characters, year) {
    const deaths = [];
    const retirements = [];

    for (const char of characters) {
      if (!char.alive) continue;
      char.age++;
      char.turnsActive++;

      // Death check
      if (char.age >= char.deathYear - char.birthYear || char.age >= 95) {
        char.alive = false;
        char.history.push({ year, text: `Died at age ${char.age}` });
        deaths.push(char);
        continue;
      }

      // Natural death probability after 65
      if (char.age > 65 && Utils.roll(Math.max(2, (char.age - 65) * 2))) {
        char.alive = false;
        char.history.push({ year, text: `Died at age ${char.age}` });
        deaths.push(char);
        continue;
      }

      // Retirement
      if (!char.retired && char.age > 60 && Utils.roll(15)) {
        char.retired = true;
        char.stats.influence = Math.floor(char.stats.influence * 0.6);
        char.history.push({ year, text: 'Retired from active work' });
        retirements.push(char);
      }

      // Random stat drift
      if (Utils.roll(20)) {
        const stat = Utils.pick(['intelligence', 'influence', 'ethics', 'ambition']);
        char.stats[stat] = Utils.clamp(char.stats[stat] + Utils.randomInt(-5, 5), 5, 100);
      }

      // Career change (rare)
      if (Utils.roll(3) && !char.retired) {
        const newSpec = Utils.pick(DATA.professions[char.profession].specializations);
        if (newSpec !== char.specialization) {
          char.specialization = newSpec;
          char.history.push({ year, text: `Shifted focus to ${newSpec}` });
        }
      }

      // Fame growth for high-influence characters
      if (char.stats.influence > 60) {
        char.fame = Utils.clamp(char.fame + Utils.randomInt(1, 3), 0, 100);
      }
    }

    return { deaths, retirements };
  },

  buildRelationships(characters, year) {
    const alive = characters.filter(c => c.alive && !c.retired);
    if (alive.length < 2) return [];

    const newRels = [];
    const attempts = Math.min(3, Math.floor(alive.length / 4));

    for (let i = 0; i < attempts; i++) {
      const a = Utils.pick(alive);
      const b = Utils.pick(alive.filter(c => c.id !== a.id));
      if (!b) continue;

      // Check if already related
      if (a.relationships.some(r => r.targetId === b.id)) continue;

      // Same profession = higher chance
      const sameProfession = a.profession === b.profession;
      if (!sameProfession && !Utils.roll(30)) continue;

      const types = ['mentor', 'colleague', 'rival', 'friend', 'protege'];
      const ageDiff = a.age - b.age;
      let type;
      if (ageDiff > 15) type = 'mentor';
      else if (ageDiff < -15) type = 'protege';
      else type = Utils.pick(['colleague', 'rival', 'friend']);

      const rel = {
        targetId: b.id,
        targetName: b.name,
        type,
        strength: Utils.randomInt(30, 70),
        since: year
      };

      a.relationships.push(rel);
      b.relationships.push({
        targetId: a.id,
        targetName: a.name,
        type: type === 'mentor' ? 'protege' : type === 'protege' ? 'mentor' : type,
        strength: rel.strength,
        since: year
      });

      newRels.push({ a, b, type });
    }

    return newRels;
  },

  getAlive(characters) {
    return characters.filter(c => c.alive);
  },

  getByProfession(characters, profession) {
    return characters.filter(c => c.alive && c.profession === profession);
  },

  getMostInfluential(characters, count = 5) {
    return characters
      .filter(c => c.alive)
      .sort((a, b) => b.stats.influence - a.stats.influence)
      .slice(0, count);
  },

  applyStatChange(character, stat, amount) {
    if (!character || !character.stats[stat]) return;
    character.stats[stat] = Utils.clamp(character.stats[stat] + amount, 5, 100);
  }
};
