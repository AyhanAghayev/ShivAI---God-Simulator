// ============================================================
// SAVE.JS — localStorage Save/Load System
// ============================================================

const SaveSystem = {
  SAVE_PREFIX: 'shivai_save_',
  MAX_SLOTS: 3,

  save(slot, gameState) {
    if (slot < 0 || slot >= this.MAX_SLOTS) return false;

    const saveData = {
      version: 1,
      timestamp: Date.now(),
      dateString: new Date().toLocaleString(),
      year: gameState.year,
      era: Utils.getEra(gameState.year).name,
      state: {
        year: gameState.year,
        influencePoints: gameState.influencePoints,
        totalIP: gameState.totalIP,
        characters: gameState.characters,
        organizations: gameState.organizations,
        allEvents: gameState.allEvents,
        worldState: gameState.worldState,
        paradoxCount: gameState.paradoxCount,
        dilemmasTriggered: gameState.dilemmasTriggered,
        playerEthics: gameState.playerEthics,
        aiPower: gameState.aiPower,
        seed: Utils._seed,
        butterflyChains: Butterfly.serialize(),
        rivalStates: Rivals.serialize(),
        interventionHistory: Interventions.serialize(),
        anomalies: gameState.anomalies || [],
        markets: gameState.markets || [],
        notifications: []
      }
    };

    try {
      const json = JSON.stringify(saveData);
      localStorage.setItem(this.SAVE_PREFIX + slot, json);
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  },

  load(slot) {
    if (slot < 0 || slot >= this.MAX_SLOTS) return null;

    try {
      const json = localStorage.getItem(this.SAVE_PREFIX + slot);
      if (!json) return null;
      return JSON.parse(json);
    } catch (e) {
      console.error('Load failed:', e);
      return null;
    }
  },

  getSaveInfo() {
    const saves = [];
    for (let i = 0; i < this.MAX_SLOTS; i++) {
      const data = this.load(i);
      if (data) {
        saves.push({
          slot: i,
          exists: true,
          year: data.year,
          era: data.era,
          date: data.dateString,
          timestamp: data.timestamp
        });
      } else {
        saves.push({ slot: i, exists: false });
      }
    }
    return saves;
  },

  deleteSave(slot) {
    localStorage.removeItem(this.SAVE_PREFIX + slot);
  },

  exportSave(slot) {
    const data = this.load(slot);
    if (!data) return null;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shivai_save_slot${slot}_${data.year}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  },

  importSave(file, slot) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (!data.version || !data.state) {
            reject('Invalid save file');
            return;
          }
          localStorage.setItem(this.SAVE_PREFIX + slot, JSON.stringify(data));
          resolve(data);
        } catch (err) {
          reject('Failed to parse save file');
        }
      };
      reader.readAsText(file);
    });
  },

  autoSave(gameState) {
    // Auto-save to a special slot
    const saveData = {
      version: 1,
      timestamp: Date.now(),
      dateString: new Date().toLocaleString(),
      year: gameState.year,
      era: Utils.getEra(gameState.year).name,
      state: {
        year: gameState.year,
        influencePoints: gameState.influencePoints,
        totalIP: gameState.totalIP,
        characters: gameState.characters,
        organizations: gameState.organizations,
        allEvents: gameState.allEvents,
        worldState: gameState.worldState,
        paradoxCount: gameState.paradoxCount,
        dilemmasTriggered: gameState.dilemmasTriggered,
        playerEthics: gameState.playerEthics,
        aiPower: gameState.aiPower,
        seed: Utils._seed,
        butterflyChains: Butterfly.serialize(),
        rivalStates: Rivals.serialize(),
        interventionHistory: Interventions.serialize(),
        anomalies: gameState.anomalies || [],
        markets: gameState.markets || [],
        notifications: []
      }
    };

    try {
      localStorage.setItem(this.SAVE_PREFIX + 'auto', JSON.stringify(saveData));
    } catch (e) {
      console.error('Auto-save failed:', e);
    }
  }
};
