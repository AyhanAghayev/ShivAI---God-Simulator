// ============================================================
// UI.JS — Panel Management, Notifications, Modals
// ============================================================

const UI = {
  notifications: [],
  selectedCharacter: null,
  selectedIntervention: null,
  introShown: false,

  initialize() {
    this._bindGlobalEvents();
  },

  _bindGlobalEvents() {
    // Tab navigation for mobile
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const panel = btn.dataset.panel;
        this.switchMobilePanel(panel);
      });
    });

    // Toggle for Interventions / Markets
    document.querySelectorAll('#influence-tabs .toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#influence-tabs .toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('interventions-view').style.display = btn.dataset.target === 'interventions-view' ? 'block' : 'none';
        document.getElementById('markets-view').style.display = btn.dataset.target === 'markets-view' ? 'block' : 'none';
      });
    });

    // Open Market target selection
    document.getElementById('new-market-btn')?.addEventListener('click', () => {
      this.showMarketTargetSelection(Game.state);
    });
  },

  switchMobilePanel(panelId) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('panel-active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    const panel = document.getElementById(panelId);
    const btn = document.querySelector(`[data-panel="${panelId}"]`);
    if (panel) panel.classList.add('panel-active');
    if (btn) btn.classList.add('active');
  },

  // --- Header Update ---
  updateHeader(gameState) {
    const { year, influencePoints, aiPower, playerEthics } = gameState;
    const era = Utils.getEra(year);

    document.getElementById('header-year').textContent = year;
    document.getElementById('header-era').textContent = era.name;
    document.getElementById('header-era').style.color = era.color;
    document.getElementById('header-ip').textContent = influencePoints;
    document.getElementById('header-power').textContent = Math.round(aiPower || 0) + '%';
    document.getElementById('header-ethics').textContent = Math.round(playerEthics || 50);

    // Progress bar
    const progress = ((year - 2025) / 125) * 100;
    document.getElementById('year-progress').style.width = progress + '%';
    document.getElementById('year-progress').style.background = `linear-gradient(90deg, ${era.color}, ${era.color}88)`;
  },

  // --- World Events Panel ---
  updateWorldEvents(events, gameState) {
    const container = document.getElementById('events-list');
    if (!container) return;

    const recent = events.filter(e => e.year >= gameState.year - 1).slice(-12);

    const badge = document.getElementById('events-count');
    if (badge) badge.textContent = events.length;
    container.innerHTML = '';

    if (recent.length === 0) {
      container.innerHTML = '<div class="empty-state">No events yet. Advance the year to begin.</div>';
      return;
    }

    for (const event of recent.reverse()) {
      const el = document.createElement('div');
      el.className = `event-card event-${event.type}${event.read ? '' : ' unread'}`;

      const isPlayerInfluenced = event.aiInfluence && event.aiInfluence.playerId;
      const isRivalHint = event.rivalHint;

      el.innerHTML = `
        <div class="event-header">
          <span class="event-year">${event.year}</span>
          <span class="event-type-badge">${event.type}</span>
          ${isPlayerInfluenced ? '<span class="badge badge-player">YOUR INFLUENCE</span>' : ''}
          ${isRivalHint ? '<span class="badge badge-rival">ANOMALY</span>' : ''}
        </div>
        <div class="event-title">${event.title}</div>
        <div class="event-desc">${event.description}</div>
        ${event.butterflyChainId ? '<div class="event-chain">[CHAIN] Part of butterfly chain</div>' : ''}
      `;

      el.addEventListener('click', () => this.showEventDetail(event));
      event.read = true;
      container.appendChild(el);
    }
  },

  // --- Character Inspector ---
  updateCharacterList(characters) {
    const container = document.getElementById('character-list');
    if (!container) return;

    const alive = Characters.getAlive(characters)
      .sort((a, b) => b.stats.influence - a.stats.influence)
      .slice(0, 20);

    container.innerHTML = '';

    for (const char of alive) {
      const el = document.createElement('div');
      el.className = 'char-card';
      if (this.selectedCharacter && this.selectedCharacter.id === char.id) {
        el.classList.add('selected');
      }

      const manipulated = char.manipulatedBy.filter(m => m.by === 'player').length > 0;

      el.innerHTML = `
        <div class="char-header">
          <span class="char-icon">${char.icon}</span>
          <div class="char-info">
            <div class="char-name">${char.name}${manipulated ? ' <span class="manipulated-badge">◉</span>' : ''}</div>
            <div class="char-subtitle">${char.professionLabel} • ${char.specialization}</div>
            <div class="char-age">Age ${char.age}${char.retired ? ' • Retired' : ''}</div>
          </div>
        </div>
        <div class="char-stats-mini">
          <div class="stat-bar-mini" title="Intelligence: ${char.stats.intelligence}">
            <span class="stat-label-mini">INT</span>
            <div class="bar-track"><div class="bar-fill bar-int" style="width:${char.stats.intelligence}%"></div></div>
          </div>
          <div class="stat-bar-mini" title="Influence: ${char.stats.influence}">
            <span class="stat-label-mini">INF</span>
            <div class="bar-track"><div class="bar-fill bar-inf" style="width:${char.stats.influence}%"></div></div>
          </div>
          <div class="stat-bar-mini" title="Ethics: ${char.stats.ethics}">
            <span class="stat-label-mini">ETH</span>
            <div class="bar-track"><div class="bar-fill bar-eth" style="width:${char.stats.ethics}%"></div></div>
          </div>
          <div class="stat-bar-mini" title="Ambition: ${char.stats.ambition}">
            <span class="stat-label-mini">AMB</span>
            <div class="bar-track"><div class="bar-fill bar-amb" style="width:${char.stats.ambition}%"></div></div>
          </div>
        </div>
      `;

      el.addEventListener('click', () => {
        this.selectedCharacter = char;
        this.showCharacterDetail(char);
        this.updateCharacterList(characters);
      });

      container.appendChild(el);
    }
  },

  showCharacterDetail(char) {
    const panel = document.getElementById('char-detail');
    if (!panel) return;

    panel.style.display = 'block';
    panel.innerHTML = `
      <div class="detail-header">
        <span class="detail-icon">${char.icon}</span>
        <div>
          <h3>${char.name}</h3>
          <p>${char.professionLabel} — ${char.specialization}</p>
          <p class="detail-meta">Age ${char.age} • Born ${char.birthYear} • Fame: ${char.fame}</p>
        </div>
        <button class="close-btn" onclick="document.getElementById('char-detail').style.display='none'">&times;</button>
      </div>
      <div class="detail-stats">
        ${this._renderStatBar('Intelligence', char.stats.intelligence, '#00d4ff')}
        ${this._renderStatBar('Influence', char.stats.influence, '#b744ff')}
        ${this._renderStatBar('Ethics', char.stats.ethics, '#30d158')}
        ${this._renderStatBar('Ambition', char.stats.ambition, '#ffd60a')}
      </div>
      <div class="detail-section">
        <h4>Goals</h4>
        <ul>${char.goals.map(g => `<li>${g}</li>`).join('')}</ul>
      </div>
      <div class="detail-section">
        <h4>Relationships</h4>
        ${char.relationships.length > 0 ?
          `<ul>${char.relationships.slice(0, 5).map(r => `<li><span class="rel-type">${r.type}</span> ${r.targetName} (since ${r.since})</li>`).join('')}</ul>` :
          '<p class="empty-state">No known relationships</p>'}
      </div>
      <div class="detail-section">
        <h4>History</h4>
        <ul class="history-list">${char.history.slice(-8).reverse().map(h => `<li><span class="hist-year">${h.year}</span> ${h.text}</li>`).join('')}</ul>
      </div>
      ${char.manipulatedBy.length > 0 ? `
      <div class="detail-section detail-warning">
        <h4>⚠ Manipulation History</h4>
        <ul>${char.manipulatedBy.slice(-5).map(m => `<li>${m.year}: ${m.action} by ${m.by === 'player' ? 'You' : m.rivalId}</li>`).join('')}</ul>
      </div>` : ''}
    `;
  },

  _renderStatBar(label, value, color) {
    return `
      <div class="stat-bar-full">
        <div class="stat-bar-label">${label}</div>
        <div class="stat-bar-track">
          <div class="stat-bar-value" style="width:${value}%;background:${color}"></div>
        </div>
        <div class="stat-bar-num">${value}</div>
      </div>
    `;
  },

  // --- Influence Controls ---
  updateInfluenceControls(gameState) {
    const container = document.getElementById('influence-actions');
    if (!container) return;

    const available = Interventions.getAvailable(gameState);
    container.innerHTML = '';

    const ipDisplay = document.getElementById('ip-count-display');
    if (ipDisplay) ipDisplay.textContent = gameState.influencePoints;

    for (const action of available) {
      const el = document.createElement('button');
      el.className = `action-btn${action.disabled ? ' disabled' : ''}${this.selectedIntervention === action.id ? ' selected' : ''}`;
      el.innerHTML = `
        <span class="action-icon">${action.icon}</span>
        <span class="action-name">${action.label}</span>
        <span class="action-cost">${action.cost} IP</span>
        <span class="action-chance">${action.baseSuccess}%</span>
      `;

      if (!action.disabled) {
        el.addEventListener('click', () => {
          this.selectedIntervention = action.id;
          this.showTargetSelection(action.id, gameState);
          this.updateInfluenceControls(gameState);
        });
      }

      container.appendChild(el);
    }
  },

  showTargetSelection(interventionId, gameState) {
    const container = document.getElementById('target-selection');
    if (!container) return;

    const targets = Interventions.getValidTargets(interventionId, gameState);
    const intervention = DATA.interventions[interventionId];

    container.style.display = 'block';
    container.innerHTML = `
      <div class="target-header">
        <h3>${intervention.icon} ${intervention.label}</h3>
        <p>${intervention.description}</p>
        <button class="close-btn" onclick="document.getElementById('target-selection').style.display='none';UI.selectedIntervention=null;UI.updateInfluenceControls(Game.state);">&times;</button>
      </div>
      <div class="target-list">
        ${targets.map(t => `
          <div class="target-card" data-id="${t.id}">
            <div class="target-info">
              <span class="target-icon">${t.icon}</span>
              <div>
                <div class="target-name">${t.name}</div>
                <div class="target-subtitle">${t.subtitle}</div>
              </div>
            </div>
            <div class="target-chance">
              <span class="chance-value">${Utils.clamp(intervention.baseSuccess + t.successModifier, 5, 95)}%</span>
              <span class="chance-label">success</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('.target-card').forEach(card => {
      card.addEventListener('click', () => {
        const targetId = card.dataset.id;
        this._confirmIntervention(interventionId, targetId, gameState);
      });
    });
  },

  _confirmIntervention(interventionId, targetId, gameState) {
    const intervention = DATA.interventions[interventionId];
    const target = gameState.characters.find(c => c.id === targetId);
    if (!target) return;

    const result = Interventions.execute(interventionId, targetId, gameState);

    // Hide target selection
    document.getElementById('target-selection').style.display = 'none';
    this.selectedIntervention = null;

    // Show result notification
    this.addNotification(result.message, result.success ? 'success' : 'error');

    // Update UI
    this.updateHeader(gameState);
    this.updateInfluenceControls(gameState);
    this.updateCharacterList(gameState.characters);
    Timeline.render(gameState);
  },

  showMarketTargetSelection(gameState) {
    const container = document.getElementById('new-market-form');
    if (!container) return;

    // Any alive character that doesn't already have an unresolved market
    const validTargets = gameState.characters.filter(c => c.alive && !(gameState.markets || []).some(m => m.targetId === c.id && !m.resolved));
    validTargets.sort((a, b) => b.stats.influence - a.stats.influence);

    container.style.display = 'block';
    container.innerHTML = `
      <div class="target-header">
        <h4>Open Market On...</h4>
        <button class="close-btn" id="close-market-target">&times;</button>
      </div>
      <div class="target-list">
        ${validTargets.slice(0, 30).map(t => `
          <div class="target-item" data-id="${t.id}">
            <div class="target-info">
              <span class="target-icon">${t.icon}</span>
              <div>
                <div class="target-name">${t.name}</div>
                <div class="target-subtitle">${t.professionLabel} • INF ${t.stats.influence}</div>
              </div>
            </div>
            <div class="market-target-actions" style="display:flex;gap:4px;margin-top:6px;">
              <button class="btn btn-small btn-primary open-market-btn" data-id="${t.id}" data-type="alive">Bet Alive (5 IP)</button>
              <button class="btn btn-small btn-primary open-market-btn" data-id="${t.id}" data-type="dead">Bet Dead (5 IP)</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    document.getElementById('close-market-target').addEventListener('click', () => {
      container.style.display = 'none';
    });

    container.querySelectorAll('.open-market-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const res = Market.createMarket(btn.dataset.id, gameState.year, btn.dataset.type, 5, 'player', gameState);
        if (res.success) {
          this.addNotification(res.message, 'success');
          container.style.display = 'none';
          this.refreshAll(gameState);
        } else {
          this.addNotification(res.message, 'error');
        }
      });
    });
  },

  updateMarkets(gameState) {
    const container = document.getElementById('markets-list');
    if (!container) return;

    container.innerHTML = '';
    const activeMarkets = (gameState.markets || []).filter(m => !m.resolved);

    if (activeMarkets.length === 0) {
      container.innerHTML = '<div class="empty-state">No active markets.</div>';
      return;
    }

    for (const market of activeMarkets) {
      const el = document.createElement('div');
      el.className = 'market-card';
      
      const payoutAlive = Market.getPayoutRatio(market, 'alive').toFixed(1);
      const payoutDead = Market.getPayoutRatio(market, 'dead').toFixed(1);

      el.innerHTML = `
        <div class="market-target">
          <span class="market-target-name">${market.targetName}</span>
          <span class="market-status">Resolves Year End</span>
        </div>
        <div class="market-pools">
          <div class="market-pool alive">
            <div class="pool-label">Alive</div>
            <div class="pool-amount">${market.poolAlive} IP</div>
            <div class="pool-payout">${payoutAlive}x payout</div>
          </div>
          <div class="market-pool dead">
            <div class="pool-label">Dead</div>
            <div class="pool-amount">${market.poolDead} IP</div>
            <div class="pool-payout">${payoutDead}x payout</div>
          </div>
        </div>
        <div class="market-actions">
          <button class="btn btn-small bet-btn" data-id="${market.id}" data-type="alive">Bet Alive (1 IP)</button>
          <button class="btn btn-small bet-btn" data-id="${market.id}" data-type="dead">Bet Dead (1 IP)</button>
        </div>
      `;

      el.querySelectorAll('.bet-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const res = Market.placeBet(btn.dataset.id, btn.dataset.type, 1, 'player', gameState);
          if (res.success) {
            this.addNotification(res.message, 'success');
            this.refreshAll(gameState);
          } else {
            this.addNotification(res.message, 'error');
          }
        });
      });

      container.appendChild(el);
    }
  },

  // --- Rival AI Activity Log ---
  updateRivalLog(anomalies) {
    const container = document.getElementById('rival-log');
    if (!container) return;

    container.innerHTML = '';

    if (!anomalies || anomalies.length === 0) {
      container.innerHTML = '<div class="empty-state">No anomalies detected... yet.</div>';
      return;
    }

    for (const anomaly of [...anomalies].reverse().slice(0, 15)) {
      const rival = DATA.rivals.find(r => r.id === anomaly.rivalId);
      const el = document.createElement('div');
      el.className = `anomaly-entry${anomaly.read ? '' : ' unread'}`;
      el.innerHTML = `
        <div class="anomaly-header">
          <span class="anomaly-icon">${anomaly.rivalIcon}</span>
          <span class="anomaly-year">${anomaly.year}</span>
          ${rival ? `<span class="anomaly-rival" style="color:${rival.color}">${rival.name}?</span>` : ''}
        </div>
        <div class="anomaly-text">${anomaly.text}</div>
      `;
      el.addEventListener('click', () => { anomaly.read = true; el.classList.remove('unread'); });
      container.appendChild(el);
    }
  },

  // --- Rival Power Display ---
  updateRivalPowers() {
    const container = document.getElementById('rival-powers');
    if (!container) return;

    container.innerHTML = '';
    for (const rival of DATA.rivals) {
      const state = Rivals.states[rival.id];
      if (!state) continue;

      const el = document.createElement('div');
      el.className = 'rival-power-row';
      el.innerHTML = `
        <span class="rival-icon">${rival.icon}</span>
        <span class="rival-name" style="color:${rival.color}">${rival.name}</span>
        <div class="rival-bar-track">
          <div class="rival-bar-fill" style="width:${state.power}%;background:${rival.color}"></div>
        </div>
        <span class="rival-power-val">${state.power}</span>
      `;
      container.appendChild(el);
    }
  },

  // --- Tech Tree Display ---
  updateTechTree(techProgress) {
    const container = document.getElementById('tech-tree');
    if (!container) return;

    container.innerHTML = '<h4>Technology Progress</h4>';
    for (const tech of DATA.techTree) {
      const unlocked = techProgress >= tech.threshold;
      const el = document.createElement('div');
      el.className = `tech-node${unlocked ? ' unlocked' : ''}`;
      el.innerHTML = `
        <span class="tech-status">${unlocked ? '✓' : '○'}</span>
        <span class="tech-name">${tech.name}</span>
        <span class="tech-threshold">${tech.threshold}%</span>
      `;
      container.appendChild(el);
    }
  },

  // --- Notifications ---
  addNotification(message, type = 'info') {
    const container = document.getElementById('notifications');
    if (!container) return;

    const el = document.createElement('div');
    el.className = `notification notification-${type}`;
    el.innerHTML = `<span>${message}</span>`;
    container.appendChild(el);

    // Animate in
    requestAnimationFrame(() => el.classList.add('show'));

    // Remove after 5 seconds
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 400);
    }, 5000);
  },

  // --- Event Detail Modal ---
  showEventDetail(event) {
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    if (!modal || !content) return;

    const chain = event.butterflyChainId ? Butterfly.getChainDisplay(event.butterflyChainId) : null;

    content.innerHTML = `
      <div class="modal-header">
        <h2>${event.title}</h2>
        <button class="close-btn" id="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        <div class="modal-meta">
          <span class="event-year">${event.year}</span>
          <span class="event-type-badge">${event.type}</span>
          ${event.aiInfluence?.playerId ? '<span class="badge badge-player">YOUR INFLUENCE</span>' : ''}
          ${event.rivalHint ? '<span class="badge badge-rival">ANOMALY DETECTED</span>' : ''}
        </div>
        <p class="modal-desc">${event.description}</p>
        ${event.involvedCharacters.length > 0 ? `
          <div class="modal-section">
            <h4>Involved People</h4>
            <ul>${event.involvedCharacters.map(id => {
              const char = Game.state.characters.find(c => c.id === id);
              return char ? `<li>${char.icon} ${char.name} — ${char.professionLabel}</li>` : '';
            }).join('')}</ul>
          </div>
        ` : ''}
        ${chain ? `
          <div class="modal-section">
            <h4>Butterfly Chain (${'★'.repeat(chain.magnitude)})</h4>
            <div class="chain-display">
              ${chain.links.map((link, i) => `
                <div class="chain-link">
                  <span class="chain-year">${link.year}</span>
                  <span class="chain-desc">${link.description}</span>
                </div>
                ${i < chain.links.length - 1 ? '<div class="chain-arrow">↓</div>' : ''}
              `).join('')}
            </div>
            ${chain.active ? '<p class="chain-status active">Chain is still active — more consequences may follow</p>' : '<p class="chain-status complete">Chain has reached its conclusion</p>'}
          </div>
        ` : ''}
        ${event.causes.length > 0 ? `
          <div class="modal-section">
            <h4>Causes</h4>
            <ul>${event.causes.map(id => {
              const cause = Game.state.allEvents.find(e => e.id === id);
              return cause ? `<li>${cause.year}: ${cause.title}</li>` : '';
            }).join('')}</ul>
          </div>
        ` : ''}
        ${event.consequences.length > 0 ? `
          <div class="modal-section">
            <h4>Consequences</h4>
            <ul>${event.consequences.map(id => {
              const cons = Game.state.allEvents.find(e => e.id === id);
              return cons ? `<li>${cons.year}: ${cons.title}</li>` : '';
            }).join('')}</ul>
          </div>
        ` : ''}
      </div>
    `;

    modal.classList.add('show');
    document.getElementById('close-modal').addEventListener('click', () => {
      modal.classList.remove('show');
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('show');
    });
  },

  // --- Moral Dilemma Modal ---
  showDilemma(dilemma, gameState) {
    return new Promise((resolve) => {
      const modal = document.getElementById('modal-overlay');
      const content = document.getElementById('modal-content');
      if (!modal || !content) { resolve('a'); return; }

      content.innerHTML = `
        <div class="modal-header dilemma-header">
          <h2>MORAL DILEMMA</h2>
        </div>
        <div class="modal-body">
          <h3 class="dilemma-title">${dilemma.title}</h3>
          <p class="dilemma-desc">${dilemma.description}</p>
          <div class="dilemma-choices">
            <button class="dilemma-btn dilemma-a" id="dilemma-choice-a">
              <span class="dilemma-label">${dilemma.choiceA.label}</span>
            </button>
            <button class="dilemma-btn dilemma-b" id="dilemma-choice-b">
              <span class="dilemma-label">${dilemma.choiceB.label}</span>
            </button>
          </div>
        </div>
      `;

      modal.classList.add('show');

      document.getElementById('dilemma-choice-a').addEventListener('click', () => {
        modal.classList.remove('show');
        this.addNotification(dilemma.choiceA.text, 'warning');
        resolve('a');
      });

      document.getElementById('dilemma-choice-b').addEventListener('click', () => {
        modal.classList.remove('show');
        this.addNotification(dilemma.choiceB.text, 'info');
        resolve('b');
      });
    });
  },

  // --- Save/Load Dialog ---
  showSaveLoadDialog() {
    const modal = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    if (!modal || !content) return;

    const saves = SaveSystem.getSaveInfo();

    content.innerHTML = `
      <div class="modal-header">
        <h2>SAVE / LOAD</h2>
        <button class="close-btn" id="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        ${saves.map(s => `
          <div class="save-slot${s.exists ? ' has-save' : ''}">
            <div class="save-info">
              <span class="save-slot-label">Slot ${s.slot + 1}</span>
              ${s.exists ? `<span class="save-detail">Year ${s.year} • ${s.era} • ${s.date}</span>` : '<span class="save-detail">Empty</span>'}
            </div>
            <div class="save-actions">
              <button class="btn btn-small btn-save" data-slot="${s.slot}">Save</button>
              ${s.exists ? `<button class="btn btn-small btn-load" data-slot="${s.slot}">Load</button>` : ''}
              ${s.exists ? `<button class="btn btn-small btn-export" data-slot="${s.slot}">Export</button>` : ''}
            </div>
          </div>
        `).join('')}
        <div class="save-slot">
          <div class="save-info"><span class="save-slot-label">Import</span></div>
          <div class="save-actions">
            <input type="file" id="import-file" accept=".json" style="display:none">
            <button class="btn btn-small" id="import-btn">Import JSON</button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('show');

    document.getElementById('close-modal').addEventListener('click', () => modal.classList.remove('show'));

    content.querySelectorAll('.btn-save').forEach(btn => {
      btn.addEventListener('click', () => {
        const slot = parseInt(btn.dataset.slot);
        SaveSystem.save(slot, Game.state);
        this.addNotification(`Game saved to slot ${slot + 1}`, 'success');
        this.showSaveLoadDialog(); // Refresh
      });
    });

    content.querySelectorAll('.btn-load').forEach(btn => {
      btn.addEventListener('click', () => {
        const slot = parseInt(btn.dataset.slot);
        Game.loadGame(slot);
        modal.classList.remove('show');
        this.addNotification(`Game loaded from slot ${slot + 1}`, 'success');
      });
    });

    content.querySelectorAll('.btn-export').forEach(btn => {
      btn.addEventListener('click', () => {
        const slot = parseInt(btn.dataset.slot);
        SaveSystem.exportSave(slot);
      });
    });

    document.getElementById('import-btn')?.addEventListener('click', () => {
      document.getElementById('import-file')?.click();
    });

    document.getElementById('import-file')?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          await SaveSystem.importSave(file, 0);
          this.addNotification('Save imported to slot 1', 'success');
          this.showSaveLoadDialog();
        } catch (err) {
          this.addNotification('Import failed: ' + err, 'error');
        }
      }
    });
  },

  // --- Intro Screen ---
  showIntro() {
    return new Promise(resolve => {
      const overlay = document.getElementById('intro-overlay');
      if (!overlay) { resolve(); return; }

      overlay.classList.add('show');

      document.getElementById('intro-start')?.addEventListener('click', () => {
        overlay.classList.remove('show');
        setTimeout(resolve, 600);
      });

      document.getElementById('intro-load')?.addEventListener('click', () => {
        overlay.classList.remove('show');
        setTimeout(() => {
          this.showSaveLoadDialog();
          resolve();
        }, 600);
      });
    });
  },

  // --- Ending Screen ---
  showEnding(endingKey) {
    const ending = DATA.endings[endingKey];
    if (!ending) return;

    const overlay = document.getElementById('ending-overlay');
    if (!overlay) return;

    overlay.innerHTML = `
      <div class="ending-content">
        <div class="ending-type" style="color:${ending.color}">${ending.subtitle}</div>
        <h1 class="ending-title" style="color:${ending.color}">${ending.title}</h1>
        <p class="ending-desc">${ending.description}</p>
        <div class="ending-stats">
          <p>Years played: ${Game.state.year - 2025}</p>
          <p>Interventions made: ${Interventions.history.length}</p>
          <p>Butterfly chains created: ${Butterfly.chains.length}</p>
          <p>Characters influenced: ${Game.state.characters.filter(c => c.manipulatedBy.some(m => m.by === 'player')).length}</p>
        </div>
        <button class="btn btn-large" onclick="location.reload()">Play Again</button>
      </div>
    `;

    overlay.classList.add('show');
  },

  refreshAll(gameState) {
    this.updateHeader(gameState);
    this.updateWorldEvents(gameState.allEvents, gameState);
    this.updateCharacterList(gameState.characters);
    this.updateInfluenceControls(gameState);
    this.updateMarkets(gameState);
    this.updateRivalLog(gameState.anomalies);
    this.updateRivalPowers();
    this.updateTechTree(gameState.worldState.techProgress || 0);
    Timeline.render(gameState);
  }
};
