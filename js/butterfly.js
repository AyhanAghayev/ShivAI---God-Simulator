// ============================================================
// BUTTERFLY.JS — Consequence Chain Engine
// ============================================================

const Butterfly = {
  chains: [],

  createSeed(event, sourceAction, year) {
    const chain = {
      id: Utils.uuid(),
      seedEvent: event.id,
      seedYear: year,
      sourceAction,
      links: [{
        eventId: event.id,
        year,
        magnitude: 1,
        description: event.title
      }],
      magnitude: 1, // 1=tiny, 2=small, 3=medium, 4=large, 5=world-changing
      active: true,
      finalOutcome: null
    };

    event.butterflyChainId = chain.id;
    this.chains.push(chain);
    return chain;
  },

  processChains(gameState) {
    const { year, characters, organizations } = gameState;
    const newEvents = [];

    for (const chain of this.chains) {
      if (!chain.active) continue;

      const age = year - chain.seedYear;
      let progressChance;

      if (age <= 5) progressChance = 20;
      else if (age <= 15) progressChance = 40;
      else progressChance = 60;

      // Boost if magnitude is already high
      progressChance += chain.magnitude * 5;

      if (!Utils.roll(progressChance)) continue;

      // Chain progresses!
      chain.magnitude = Math.min(chain.magnitude + 1, 5);

      const consequence = this._generateConsequence(chain, gameState);
      if (!consequence) continue;

      const event = {
        id: Utils.uuid(),
        year,
        type: consequence.type,
        title: consequence.title,
        description: consequence.description,
        involvedCharacters: consequence.involvedCharacters || [],
        involvedOrgs: consequence.involvedOrgs || [],
        causes: [chain.links[chain.links.length - 1].eventId],
        consequences: [],
        butterflyChainId: chain.id,
        aiInfluence: null,
        rivalHint: false,
        moralWeight: 0,
        effects: consequence.effects || {},
        read: false
      };

      // Link previous event to this consequence
      const prevLink = chain.links[chain.links.length - 1];
      const prevEvent = gameState.allEvents.find(e => e.id === prevLink.eventId);
      if (prevEvent) {
        prevEvent.consequences.push(event.id);
      }

      chain.links.push({
        eventId: event.id,
        year,
        magnitude: chain.magnitude,
        description: event.title
      });

      // Apply effects
      if (consequence.effects) {
        for (const [key, val] of Object.entries(consequence.effects)) {
          if (typeof gameState.worldState[key] === 'number') {
            gameState.worldState[key] += val;
          }
        }
      }

      newEvents.push(event);

      // Check if chain reached max magnitude
      if (chain.magnitude >= 5) {
        chain.active = false;
        chain.finalOutcome = event.title;
      }
    }

    return newEvents;
  },

  _generateConsequence(chain, gameState) {
    const { characters, organizations, year } = gameState;
    const aliveChars = Characters.getAlive(characters);
    const person = Utils.pick(aliveChars);
    const org = Utils.pick(organizations.filter(o => o.active));

    const magnitudeTemplates = {
      2: [
        { type: 'discovery', title: `${person ? person.name : 'A researcher'} builds on earlier work, gaining recognition`, effects: { techProgress: 3 } },
        { type: 'corporate', title: `${org ? org.name : 'A company'} notices emerging trend, shifts strategy`, effects: { corporatePower: 3 } },
        { type: 'social', title: `Academic community takes interest in related developments`, effects: { techProgress: 2 } }
      ],
      3: [
        { type: 'breakthrough', title: `${person ? person.name : 'Researchers'} achieve significant results, attracting global attention`, effects: { techProgress: 8 } },
        { type: 'corporate', title: `${org ? org.name : 'Major corporation'} pivots entire division based on new discoveries`, effects: { corporatePower: 8 } },
        { type: 'political', title: `Government launches major initiative inspired by recent breakthroughs`, effects: { regulation: -5, techProgress: 6 } }
      ],
      4: [
        { type: 'breakthrough', title: `Paradigm shift: ${person ? person.name + '\'s' : ''} work revolutionizes the field`, effects: { techProgress: 15 } },
        { type: 'corporate', title: `${org ? org.name : 'Tech giant'} becomes industry leader through accumulated advantages`, effects: { corporatePower: 15 } },
        { type: 'political', title: `International AI treaty signed, reshaping global development`, effects: { regulation: 10, techProgress: 8 } }
      ],
      5: [
        { type: 'breakthrough', title: `Historic moment: the chain of events culminates in an AI milestone`, effects: { techProgress: 25 } },
        { type: 'corporate', title: `${org ? org.name : 'The dominant AI company'} achieves monopoly-level control`, effects: { corporatePower: 25, techProgress: 10 } },
        { type: 'crisis', title: `The accumulated consequences trigger a global crisis`, effects: { publicFear: 20, regulation: 15 } }
      ]
    };

    const templates = magnitudeTemplates[chain.magnitude] || magnitudeTemplates[2];
    const template = Utils.pick(templates);

    if (person) {
      template.involvedCharacters = [person.id];
      if (chain.magnitude >= 3) {
        person.contributions += chain.magnitude * 3;
        person.fame = Utils.clamp(person.fame + chain.magnitude * 5, 0, 100);
        person.history.push({ year, text: template.title });
      }
    }
    if (org) {
      template.involvedOrgs = [org.id];
    }

    template.description = this._generateChainDescription(chain, template);
    return template;
  },

  _generateChainDescription(chain, template) {
    const links = chain.links;
    if (links.length <= 1) return template.title;

    const origin = links[0].description;
    return `This event traces back to ${links[0].year}: "${origin}". Through ${links.length} connected events over ${chain.links[chain.links.length-1].year - chain.seedYear} years, small actions have cascaded into major consequences. [Magnitude: ${'★'.repeat(chain.magnitude)}]`;
  },

  getChainById(id) {
    return this.chains.find(c => c.id === id);
  },

  getActiveChains() {
    return this.chains.filter(c => c.active);
  },

  getCompletedChains() {
    return this.chains.filter(c => !c.active && c.finalOutcome);
  },

  getChainDisplay(chainId) {
    const chain = this.getChainById(chainId);
    if (!chain) return null;

    return {
      id: chain.id,
      seedYear: chain.seedYear,
      magnitude: chain.magnitude,
      active: chain.active,
      links: chain.links.map(l => ({
        year: l.year,
        description: l.description,
        magnitude: l.magnitude
      })),
      finalOutcome: chain.finalOutcome
    };
  },

  serialize() {
    return JSON.parse(JSON.stringify(this.chains));
  },

  deserialize(data) {
    this.chains = data || [];
  }
};
