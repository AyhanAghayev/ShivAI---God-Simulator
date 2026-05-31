// ============================================================
// EVENTS.JS — Procedural World Event Generation
// ============================================================

const Events = {
  generateYearEvents(gameState) {
    const { year, characters, organizations, techProgress, worldState } = gameState;
    const era = Utils.getEra(year);
    const events = [];

    // Number of events scales with era
    const baseCount = 3 + era.id;
    const count = baseCount + Utils.randomInt(0, 2);

    const aliveChars = Characters.getAlive(characters);
    const templates = DATA.eventTemplates.filter(t =>
      t.era.includes(era.id) && (worldState.techProgress || 0) >= (t.minTech || 0)
    );

    for (let i = 0; i < count; i++) {
      const template = Utils.pick(templates);
      if (!template) continue;

      const person = Utils.pick(aliveChars);
      const org = Utils.pick(organizations.filter(o => o.active));
      const field = Utils.pick(DATA.fields);
      const country = Utils.pick(DATA.countries);

      const title = Utils.interpolate(template.title, {
        person: person ? person.name : 'A researcher',
        org: org ? org.name : 'A tech company',
        field,
        country
      });

      const event = {
        id: Utils.uuid(),
        year,
        type: template.type,
        title,
        description: this._generateDescription(template, person, org, field, country),
        involvedCharacters: person ? [person.id] : [],
        involvedOrgs: org ? [org.id] : [],
        causes: [],
        consequences: [],
        butterflyChainId: null,
        aiInfluence: null,
        rivalHint: template.rivalHint || false,
        moralWeight: 0,
        effects: { ...template.effects },
        read: false
      };

      // Apply event effects to world state
      if (template.effects) {
        for (const [key, val] of Object.entries(template.effects)) {
          if (typeof gameState.worldState[key] === 'number') {
            gameState.worldState[key] += val;
          }
        }
      }

      // Stat boost for involved character
      if (person && template.type === 'breakthrough') {
        Characters.applyStatChange(person, 'intelligence', 3);
        Characters.applyStatChange(person, 'influence', 5);
        person.contributions += 5;
        person.fame = Utils.clamp(person.fame + 5, 0, 100);
        person.history.push({ year, text: title });
      }

      if (person && template.type === 'political') {
        Characters.applyStatChange(person, 'influence', 8);
        person.history.push({ year, text: title });
      }

      events.push(event);
    }

    return events;
  },

  _generateDescription(template, person, org, field, country) {
    const descriptions = {
      breakthrough: [
        `A stunning advancement in ${field} has been achieved${person ? ` by ${person.name}` : ''}. Experts believe this could accelerate AI development by years.`,
        `${person ? person.name : 'Researchers'} announced a paradigm-shifting discovery in ${field} that could reshape the future of artificial intelligence.`,
        `The scientific community is buzzing after ${person ? person.name + '\'s' : 'a'} major breakthrough in ${field}. Implications are still being assessed.`
      ],
      political: [
        `Political maneuvering in ${country} is reshaping the landscape of AI policy. ${person ? person.name + ' is at the center of these changes.' : ''}`,
        `New legislation in ${country} could dramatically alter the trajectory of AI development. ${person ? person.name + ' leads the charge.' : ''}`,
        `${country}'s approach to AI governance takes a sharp turn. ${person ? person.name + ' emerges as a key figure.' : ''}`
      ],
      corporate: [
        `${org ? org.name : 'A major tech company'} makes a bold strategic move that sends shockwaves through the industry.`,
        `Corporate power shifts as ${org ? org.name : 'a leading AI firm'} consolidates its position in the market.`,
        `Industry analysts are watching ${org ? org.name : 'the AI sector'} closely after a major announcement.`
      ],
      social: [
        `Public sentiment toward AI is shifting. ${person ? person.name + ' captures the moment.' : 'Grassroots movements are gaining traction.'}`,
        `Society grapples with the implications of advancing AI. ${country} becomes a focal point of debate.`,
        `The relationship between humanity and AI enters a new chapter. Voices on both sides grow louder.`
      ],
      crisis: [
        `A crisis erupts in ${country}, raising serious questions about AI safety and oversight.`,
        `${country} faces an unprecedented challenge that could set AI development back—or push it forward at any cost.`,
        `Alarm bells ring across the globe as ${country} deals with the fallout of unchecked technological advancement.`
      ],
      discovery: [
        `A major scientific publication from ${person ? person.name : 'anonymous researchers'} opens new frontiers in ${field}.`,
        `${person ? person.name + ' reveals' : 'New research reveals'} a previously unknown aspect of ${field} that could be the key to next-generation AI.`
      ],
      rivalry: [
        `Something unusual is happening in ${field}. Progress is moving faster than anyone can explain.`,
        `Analysts are puzzled by anomalous patterns in ${org ? org.name + '\'s' : 'the'} development trajectory. Some suspect hidden forces at work.`,
        `${country}'s sudden policy shift defies conventional political analysis. What—or who—is behind this?`
      ],
      moral: [
        `An ethical crisis forces the AI community to confront uncomfortable truths. ${person ? person.name + ' stands at the crossroads.' : ''}`,
        `The line between progress and moral compromise blurs. ${person ? person.name + ' must choose.' : 'Difficult decisions lie ahead.'}`
      ]
    };

    const pool = descriptions[template.type] || descriptions.breakthrough;
    return Utils.pick(pool);
  },

  generateOrganizations(count) {
    const orgs = [];
    const orgKeys = Object.keys(DATA.orgTypes);

    for (let i = 0; i < count; i++) {
      const typeKey = Utils.pick(orgKeys);
      const type = DATA.orgTypes[typeKey];
      const name = Utils.pick(type.templates);

      orgs.push({
        id: Utils.uuid(),
        name,
        type: typeKey,
        typeLabel: type.label,
        icon: type.icon,
        power: Utils.randomInt(20, 60),
        funding: Utils.randomInt(30, 70),
        aiProgress: Utils.randomInt(5, 25),
        active: true,
        founded: 2025,
        employees: Utils.randomInt(100, 10000),
        history: [],
        backedBy: null // rival AI id
      });
    }

    return orgs;
  },

  updateOrganizations(organizations, year, worldState) {
    for (const org of organizations) {
      if (!org.active) continue;

      // Random growth/decline
      org.power += Utils.randomInt(-3, 5);
      org.funding += Utils.randomInt(-5, 5);
      org.aiProgress += Utils.randomInt(0, 3);

      // Clamp values
      org.power = Utils.clamp(org.power, 0, 100);
      org.funding = Utils.clamp(org.funding, 0, 100);
      org.aiProgress = Utils.clamp(org.aiProgress, 0, 100);

      // Collapse check
      if (org.power < 10 && org.funding < 10 && Utils.roll(25)) {
        org.active = false;
        org.history.push({ year, text: 'Organization collapsed' });
      }

      // Employee growth
      if (org.funding > 50) {
        org.employees = Math.floor(org.employees * (1 + Utils.random() * 0.1));
      }
    }
  }
};
