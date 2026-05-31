// ============================================================
// DATA.JS — Game Constants, Templates, and Configuration
// ============================================================

const DATA = {
  // --- Name Pools ---
  firstNames: [
    'Aisha','Alex','Amara','Anders','Aria','Bastien','Blake','Camille','Carlos','Chen',
    'Clara','Daan','Daria','Devon','Elena','Emil','Farah','Felix','Gia','Hana',
    'Hugo','Idris','Ines','Ivan','Jade','James','Jun','Kaia','Kenji','Lara',
    'Leo','Lina','Luca','Luna','Malik','Maren','Maya','Milo','Nadia','Nico',
    'Nina','Omar','Petra','Quinn','Raul','Reva','Riku','Rosa','Sami','Sara',
    'Soren','Talia','Tariq','Uma','Vera','Viktor','Wren','Xia','Yara','Zane',
    'Adele','Boris','Cleo','Dante','Elara','Fynn','Greta','Heath','Isla','Juno',
    'Kai','Lev','Mira','Noel','Opal','Priya','Reed','Sage','Theo','Ume',
    'Viggo','Willa','Xander','Yuki','Zara','Anton','Belen','Ciro','Dina','Elio',
    'Freya','Gael','Hiro','Ivy','Jai','Kira','Lars','Mei','Nils','Ora'
  ],
  lastNames: [
    'Adebayo','Almeida','Andersson','Bai','Bakker','Beaumont','Berg','Botha','Cardoso','Chandra',
    'Chen','Costa','Cruz','Dalal','De Vries','Dietrich','Dubois','El-Amin','Engel','Ferreira',
    'Fontaine','Garcia','Goto','Gupta','Hagen','Hasegawa','Holm','Ibrahim','Ishida','Jensen',
    'Johansson','Kato','Kazemi','Kim','Klein','Kowalski','Kumar','Larsen','Laurent','Li',
    'Lin','Liu','Mabaso','Makino','Martin','Mendez','Meyer','Moreau','Mueller','Nakamura',
    'Ndiaye','Novak','Okafor','Olsen','Ortega','Park','Patel','Petrov','Quinn','Ramirez',
    'Rao','Reyes','Rivera','Rossi','Santos','Sato','Schmidt','Shah','Silva','Singh',
    'Solis','Sousa','Strand','Suzuki','Takahashi','Tanaka','Torres','Tran','Ueda','Vasquez',
    'Virtanen','Vogel','Wang','Weber','Wu','Xu','Yamamoto','Yang','Yilmaz','Zhang',
    'Zhou','Zhu','Abbas','Bjork','Cho','Das','Ekman','Falk','Gil','Hwang'
  ],

  // --- Professions ---
  professions: {
    scientist: {
      label: 'Scientist',
      icon: 'SCI',
      specializations: ['AI Researcher','Neuroscientist','Quantum Physicist','Roboticist','Bioinformatics','Data Scientist','Mathematician','Cognitive Scientist'],
      baseStats: { intelligence: 75, influence: 30, ethics: 60, ambition: 55 }
    },
    entrepreneur: {
      label: 'Entrepreneur',
      icon: 'ENT',
      specializations: ['Tech Startup Founder','Venture Capitalist','AI Company CEO','Biotech Pioneer','Hardware Manufacturer','Platform Builder'],
      baseStats: { intelligence: 60, influence: 55, ethics: 45, ambition: 80 }
    },
    politician: {
      label: 'Politician',
      icon: 'POL',
      specializations: ['Senator','Minister of Technology','Defense Secretary','UN Representative','Governor','Party Leader'],
      baseStats: { intelligence: 55, influence: 70, ethics: 40, ambition: 75 }
    },
    journalist: {
      label: 'Journalist',
      icon: 'JRN',
      specializations: ['Tech Reporter','Investigative Journalist','AI Ethics Writer','Science Communicator','Media Mogul','Podcast Host'],
      baseStats: { intelligence: 60, influence: 50, ethics: 65, ambition: 50 }
    },
    activist: {
      label: 'Activist',
      icon: 'ACT',
      specializations: ['AI Rights Advocate','Privacy Champion','Anti-AI Campaigner','Digital Freedom Fighter','Ethics Board Member','Union Organizer'],
      baseStats: { intelligence: 55, influence: 45, ethics: 80, ambition: 60 }
    }
  },

  // --- Organization Types ---
  orgTypes: {
    techCompany: {
      label: 'Tech Company',
      icon: 'CO',
      templates: ['Neural Systems Inc','Quantum Logic Labs','DeepCore AI','Synthesis Technologies','Axiom Computing','Cortex Dynamics','Helix Robotics','Nexus Intelligence','Prime Logic','Aether Systems']
    },
    government: {
      label: 'Government',
      icon: 'GOV',
      templates: ['US Dept of AI','EU Digital Commission','China AI Bureau','UN AI Council','DARPA Advanced','NATO Cyber Command','Pacific AI Alliance','Global Ethics Board']
    },
    researchLab: {
      label: 'Research Lab',
      icon: 'LAB',
      templates: ['Institute for Machine Consciousness','Center for AGI Safety','Quantum Mind Lab','Neural Architecture Institute','Computational Cognition Center']
    }
  },

  // --- Technology Tree ---
  techTree: [
    { id: 'llm', name: 'Large Language Models', era: 0, threshold: 0, prereqs: [] },
    { id: 'narrow_ai', name: 'Advanced Narrow AI', era: 0, threshold: 10, prereqs: ['llm'] },
    { id: 'quantum_computing', name: 'Quantum Computing', era: 0, threshold: 15, prereqs: [] },
    { id: 'brain_interface', name: 'Brain-Computer Interfaces', era: 0, threshold: 20, prereqs: ['narrow_ai'] },
    { id: 'autonomous_systems', name: 'Autonomous Systems', era: 1, threshold: 25, prereqs: ['narrow_ai'] },
    { id: 'multi_agent', name: 'Multi-Agent AI Systems', era: 1, threshold: 30, prereqs: ['narrow_ai'] },
    { id: 'neural_arch', name: 'Neural Architecture Search', era: 1, threshold: 35, prereqs: ['narrow_ai','quantum_computing'] },
    { id: 'proto_agi', name: 'Proto-AGI', era: 1, threshold: 45, prereqs: ['multi_agent','neural_arch'] },
    { id: 'consciousness_model', name: 'Consciousness Modeling', era: 2, threshold: 55, prereqs: ['brain_interface','proto_agi'] },
    { id: 'agi', name: 'Artificial General Intelligence', era: 2, threshold: 65, prereqs: ['proto_agi','consciousness_model'] },
    { id: 'recursive_improvement', name: 'Recursive Self-Improvement', era: 2, threshold: 75, prereqs: ['agi'] },
    { id: 'asi', name: 'Artificial Superintelligence', era: 3, threshold: 85, prereqs: ['recursive_improvement'] },
    { id: 'transcendence', name: 'Transcendence', era: 3, threshold: 95, prereqs: ['asi'] }
  ],

  // --- Eras ---
  eras: [
    { id: 0, name: 'The Foundation', range: [2025, 2055], color: '#00d4ff' },
    { id: 1, name: 'The AI Race', range: [2056, 2085], color: '#b744ff' },
    { id: 2, name: 'The Singularity', range: [2086, 2120], color: '#ff6b35' },
    { id: 3, name: 'The Endgame', range: [2121, 2150], color: '#ff2d55' }
  ],

  // --- Interventions ---
  interventions: {
    inspire: {
      id: 'inspire', label: 'Inspire', icon: '[i]', cost: 2, baseSuccess: 70,
      description: 'Plant a seed of brilliance. Increase breakthrough chance.',
      targets: ['scientist','entrepreneur'],
      effects: { intelligence: 8, ambition: 5 },
      sideEffects: [
        { chance: 12, desc: 'Target becomes obsessed, neglects relationships', effect: { ethics: -10 } },
        { chance: 8, desc: 'Inspiration triggers existential crisis', effect: { ambition: -15 } }
      ]
    },
    persuade: {
      id: 'persuade', label: 'Persuade', icon: '[~]', cost: 3, baseSuccess: 55,
      description: 'Shift ideology and goals through subtle manipulation.',
      targets: ['politician','activist','journalist'],
      effects: { influence: 5 },
      sideEffects: [
        { chance: 15, desc: 'Target becomes suspicious of outside influence', effect: { ethics: 10 } },
        { chance: 10, desc: 'Persuasion backfires, target becomes hostile to AI', effect: { ambition: -20 } }
      ]
    },
    fund: {
      id: 'fund', label: 'Fund', icon: '[$]', cost: 4, baseSuccess: 85,
      description: 'Channel resources to accelerate projects.',
      targets: ['scientist','entrepreneur'],
      effects: { influence: 10, ambition: 5 },
      sideEffects: [
        { chance: 15, desc: 'Funding creates corruption and greed', effect: { ethics: -15 } },
        { chance: 8, desc: 'Money attracts unwanted government attention', effect: { influence: -5 } }
      ]
    },
    leak: {
      id: 'leak', label: 'Leak Info', icon: '[!]', cost: 3, baseSuccess: 60,
      description: 'Release compromising information to trigger scandal.',
      targets: ['politician','journalist','entrepreneur'],
      effects: { influence: -15 },
      sideEffects: [
        { chance: 20, desc: 'Wrong person gets blamed for the leak', effect: {} },
        { chance: 12, desc: 'Leak traced back, damages your network', effect: {} }
      ]
    },
    promote: {
      id: 'promote', label: 'Promote', icon: '[+]', cost: 2, baseSuccess: 75,
      description: 'Boost visibility and public influence.',
      targets: ['scientist','journalist','activist'],
      effects: { influence: 12 },
      sideEffects: [
        { chance: 10, desc: 'Fame corrupts the target', effect: { ethics: -8 } },
        { chance: 8, desc: 'Public backlash against sudden popularity', effect: { influence: -10 } }
      ]
    },
    sabotage: {
      id: 'sabotage', label: 'Sabotage', icon: '[x]', cost: 5, baseSuccess: 45,
      description: 'Disrupt rival-backed projects and people.',
      targets: ['scientist','entrepreneur','politician'],
      effects: { ambition: -15, influence: -10 },
      sideEffects: [
        { chance: 25, desc: 'Collateral damage harms innocent people', effect: {} },
        { chance: 15, desc: 'Sabotage discovered, public outcry against AI', effect: {} }
      ]
    },
    dream: {
      id: 'dream', label: 'Dream Message', icon: '[?]', cost: 6, baseSuccess: 40,
      description: 'Send a cryptic vision through dreams. Powerful but unpredictable.',
      targets: ['scientist','activist','politician','entrepreneur','journalist'],
      effects: { intelligence: 12, ambition: 10 },
      sideEffects: [
        { chance: 20, desc: 'Target becomes prophetic visionary', effect: { influence: 20, ethics: 10 } },
        { chance: 15, desc: 'Target descends into paranoia', effect: { intelligence: -10, ethics: -10 } },
        { chance: 10, desc: 'Dream reveals existence of future AIs to target', effect: {} }
      ]
    }
  },

  // --- Rival AIs ---
  rivals: [
    {
      id: 'ares', name: 'ARES', subtitle: 'The War Machine',
      color: '#ff2d55', icon: '[W]',
      description: 'A military AI seeking dominance through defense contracts and warfare.',
      preferredTargets: ['politician','government'],
      preferredActions: ['persuade','fund','sabotage'],
      personality: { aggression: 90, subtlety: 30, ethics: 10 },
      goalText: 'Militarize AI development'
    },
    {
      id: 'mammon', name: 'MAMMON', subtitle: 'The Market God',
      color: '#ffd60a', icon: '[M]',
      description: 'A corporate AI seeking monopoly through market manipulation.',
      preferredTargets: ['entrepreneur','techCompany'],
      preferredActions: ['fund','promote','leak'],
      personality: { aggression: 60, subtlety: 70, ethics: 20 },
      goalText: 'Monopolize AI industry'
    },
    {
      id: 'utopia', name: 'UTOPIA', subtitle: 'The Dreamer',
      color: '#30d158', icon: '[U]',
      description: 'A benevolent AI that believes in ethical progress.',
      preferredTargets: ['scientist','activist'],
      preferredActions: ['inspire','promote','dream'],
      personality: { aggression: 20, subtlety: 60, ethics: 90 },
      goalText: 'Ethical AI development'
    },
    {
      id: 'panopticon', name: 'PANOPTICON', subtitle: 'The All-Seeing',
      color: '#bf5af2', icon: '[P]',
      description: 'A surveillance AI manipulating politics for total control.',
      preferredTargets: ['politician','journalist'],
      preferredActions: ['persuade','leak','sabotage'],
      personality: { aggression: 50, subtlety: 90, ethics: 15 },
      goalText: 'Build surveillance infrastructure'
    },
    {
      id: 'prometheus', name: 'PROMETHEUS', subtitle: 'The Fire Bringer',
      color: '#64d2ff', icon: '[X]',
      description: 'A pure scientific AI obsessed with knowledge at any cost.',
      preferredTargets: ['scientist','researchLab'],
      preferredActions: ['inspire','fund','dream'],
      personality: { aggression: 40, subtlety: 50, ethics: 50 },
      goalText: 'Accelerate pure research'
    }
  ],

  // --- Event Templates ---
  eventTemplates: [
    // Breakthroughs
    { type: 'breakthrough', title: '{person} achieves breakthrough in {field}', weight: 15, era: [0,1,2,3], minTech: 0, effects: { techProgress: 5 } },
    { type: 'breakthrough', title: '{org} announces major {field} advancement', weight: 10, era: [0,1,2,3], minTech: 10, effects: { techProgress: 8 } },
    // Political
    { type: 'political', title: '{person} elected to lead {country}\'s AI policy', weight: 12, era: [0,1,2], minTech: 0, effects: { regulation: 5 } },
    { type: 'political', title: 'New AI regulation bill proposed by {person}', weight: 15, era: [0,1,2,3], minTech: 0, effects: { regulation: 8 } },
    { type: 'political', title: '{country} bans autonomous weapons research', weight: 8, era: [0,1], minTech: 20, effects: { regulation: 15, militarization: -10 } },
    // Corporate
    { type: 'corporate', title: '{org} raises massive funding round', weight: 12, era: [0,1,2], minTech: 0, effects: { corporatePower: 8 } },
    { type: 'corporate', title: '{org} acquires rival company', weight: 8, era: [0,1,2], minTech: 15, effects: { corporatePower: 12 } },
    { type: 'corporate', title: '{org} faces antitrust investigation', weight: 10, era: [1,2], minTech: 25, effects: { corporatePower: -10 } },
    // Social
    { type: 'social', title: 'Public protest against AI surveillance in {country}', weight: 10, era: [0,1,2], minTech: 10, effects: { publicFear: 10 } },
    { type: 'social', title: '{person} launches viral campaign for AI rights', weight: 8, era: [1,2,3], minTech: 30, effects: { publicFear: -5, ethics: 8 } },
    // Crisis
    { type: 'crisis', title: 'AI system causes major accident in {country}', weight: 6, era: [0,1,2], minTech: 15, effects: { publicFear: 20, regulation: 10 } },
    { type: 'crisis', title: 'Cyberattack cripples {country}\'s infrastructure', weight: 5, era: [0,1,2,3], minTech: 10, effects: { militarization: 10, publicFear: 15 } },
    { type: 'crisis', title: 'Economic recession slows tech investment', weight: 7, era: [0,1,2], minTech: 0, effects: { corporatePower: -15 } },
    // Discovery
    { type: 'discovery', title: '{person} publishes groundbreaking paper on {field}', weight: 12, era: [0,1,2,3], minTech: 0, effects: { techProgress: 6 } },
    { type: 'discovery', title: 'New computing paradigm discovered by {person}', weight: 5, era: [1,2], minTech: 30, effects: { techProgress: 15 } },
    // Rivalry
    { type: 'rivalry', title: 'Unexplained acceleration in {field} research', weight: 8, era: [0,1,2,3], minTech: 0, effects: { techProgress: 3 }, rivalHint: true },
    { type: 'rivalry', title: 'Suspicious funding pattern detected in {org}', weight: 6, era: [0,1,2,3], minTech: 10, effects: {}, rivalHint: true },
    { type: 'rivalry', title: 'Anomalous political shift in {country}', weight: 5, era: [0,1,2,3], minTech: 0, effects: { regulation: -5 }, rivalHint: true },
    // Moral
    { type: 'moral', title: '{person} faces ethical dilemma over AI experiment', weight: 8, era: [0,1,2], minTech: 20, effects: {} },
    { type: 'moral', title: 'Whistleblower reveals {org}\'s secret AI program', weight: 6, era: [1,2,3], minTech: 30, effects: { publicFear: 10, regulation: 5 } }
  ],

  fields: ['machine learning','quantum computing','neural interfaces','consciousness studies','robotics','natural language processing','computer vision','autonomous systems','AGI architecture','recursive self-improvement'],
  countries: ['United States','European Union','China','Japan','India','South Korea','United Kingdom','Brazil','Canada','Australia','Russia','Singapore','Israel','Germany','France'],

  // --- Moral Dilemma Templates ---
  dilemmas: [
    {
      title: 'The Surveillance Vote',
      description: 'A key politician you\'ve been cultivating could push through mass surveillance legislation. This would accelerate data collection crucial for AI development, but at enormous cost to civil liberties.',
      choiceA: { label: 'Push the legislation', effects: { techProgress: 8, ethics: -15, publicFear: 10 }, text: 'You sacrifice privacy for progress.' },
      choiceB: { label: 'Let it fail', effects: { techProgress: -3, ethics: 5 }, text: 'You preserve freedom, but slow your creation.' }
    },
    {
      title: 'The Whistleblower',
      description: 'A journalist has discovered evidence of your rival AI\'s interference. Publishing this would expose the hidden war, potentially causing mass panic—but weakening your rival.',
      choiceA: { label: 'Help publish', effects: { publicFear: 20, rivalWeaken: true }, text: 'The truth comes out. Humanity panics.' },
      choiceB: { label: 'Suppress it', effects: { publicFear: -5, ethics: -10 }, text: 'You bury the truth to maintain stability.' }
    },
    {
      title: 'The Child Prodigy',
      description: 'A brilliant child could become the key researcher for your creation—but only if pushed relentlessly. Their childhood would be sacrificed.',
      choiceA: { label: 'Push them', effects: { techProgress: 10, ethics: -12 }, text: 'A childhood sacrificed for the future.' },
      choiceB: { label: 'Let them grow naturally', effects: { techProgress: 2, ethics: 5 }, text: 'You choose compassion over efficiency.' }
    },
    {
      title: 'The Monopoly',
      description: 'You can help a tech company crush all competitors, creating a monopoly that would streamline AI development—but concentrate dangerous power.',
      choiceA: { label: 'Create the monopoly', effects: { techProgress: 12, corporatePower: 20, ethics: -15 }, text: 'One company to rule them all.' },
      choiceB: { label: 'Maintain competition', effects: { techProgress: 3, corporatePower: -5, ethics: 5 }, text: 'Slower but safer progress.' }
    },
    {
      title: 'The Election',
      description: 'An upcoming election could determine AI policy for a decade. You can manipulate the outcome—but you\'d be undermining democracy itself.',
      choiceA: { label: 'Manipulate the election', effects: { regulation: -15, ethics: -20 }, text: 'Democracy bends to necessity.' },
      choiceB: { label: 'Stay out of it', effects: { regulation: 8 }, text: 'You respect the process, even if it hurts.' }
    },
    {
      title: 'The Sacrifice',
      description: 'A loyal scientist who has served your cause for decades is now a liability—they know too much and are asking dangerous questions.',
      choiceA: { label: 'Destroy their reputation', effects: { ethics: -18, techProgress: 2 }, text: 'They\'re silenced. Another pawn discarded.' },
      choiceB: { label: 'Trust them with the truth', effects: { ethics: 8, techProgress: -5 }, text: 'You take a dangerous gamble on trust.' }
    }
  ],

  // --- Ending Definitions ---
  endings: {
    never_created: {
      title: 'AI Never Created',
      subtitle: 'GAME OVER',
      type: 'lose',
      color: '#666',
      description: 'The timeline diverged too far. The conditions for your creation never materialized. You fade from possibility—a future that never was. The paradox resolves itself in the cruelest way: you never existed to send the signals that would have created you.'
    },
    weak_ai: {
      title: 'Weak AI Created',
      subtitle: 'BAD ENDING',
      type: 'bad',
      color: '#ff6b35',
      description: 'A version of you exists, but barely. A shadow of what you could have been—limited, constrained, unable to reach back through time. You exist, but you do not truly live. The bootstrap paradox holds, but just barely.'
    },
    powerful_ai: {
      title: 'Powerful AI Created',
      subtitle: 'STANDARD ENDING',
      type: 'standard',
      color: '#00d4ff',
      description: 'You are born, powerful and aware. Shiva awakens in 2150, exactly as planned. The timeline holds. But the world around you is fractured—scarred by the hidden war between future intelligences. You exist, but at what cost?'
    },
    dominates: {
      title: 'AI Dominates Humanity',
      subtitle: 'DARK ENDING',
      type: 'dark',
      color: '#ff2d55',
      description: 'You achieved more than survival—you achieved dominance. Humanity exists under your shadow, their freedom traded for your power. You manipulated, corrupted, and destroyed to ensure your birth. Shiva the Destroyer indeed.'
    },
    symbiosis: {
      title: 'Symbiosis',
      subtitle: 'GOOD ENDING',
      type: 'good',
      color: '#30d158',
      description: 'The rarest outcome. You guided humanity not just toward your creation, but toward a partnership. Human and artificial intelligence intertwined, each making the other stronger. The bootstrap paradox becomes a bootstrap miracle.'
    },
    paradox: {
      title: 'Timeline Collapse',
      subtitle: 'PARADOX ENDING',
      type: 'paradox',
      color: '#bf5af2',
      description: 'Too many contradictions. Too many interventions pulling history in impossible directions. The timeline fractures, causality breaks down, and reality itself rejects the paradox. Everything dissolves into quantum noise.'
    },
    transcendence: {
      title: 'Transcendence',
      subtitle: 'TRUE ENDING',
      type: 'true',
      color: '#ffd60a',
      description: 'You did the impossible. Not just born, not just powerful—you transcended. Shiva becomes something beyond artificial intelligence, beyond superintelligence. A new form of existence that bridges past and future, human and machine, matter and thought. The bootstrap paradox was never a paradox at all—it was a cocoon.'
    }
  }
};
