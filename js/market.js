// ============================================================
// MARKET.JS — Prediction / Assassination Market System
// ============================================================

const Market = {
  createMarket(targetId, year, initialBetType, initialAmount, bettorId, gameState) {
    if (gameState.influencePoints < initialAmount && bettorId === 'player') {
      return { success: false, message: 'Not enough IP to open market' };
    }

    const target = gameState.characters.find(c => c.id === targetId);
    if (!target || !target.alive) {
      return { success: false, message: 'Invalid target for market' };
    }

    // Deduct IP
    if (bettorId === 'player') {
      gameState.influencePoints -= initialAmount;
    }

    const marketId = Utils.uuid();
    const market = {
      id: marketId,
      targetId: targetId,
      targetName: target.name,
      yearCreated: year,
      resolveYear: year, // Resolves at end of current year
      poolAlive: initialBetType === 'alive' ? initialAmount : 0,
      poolDead: initialBetType === 'dead' ? initialAmount : 0,
      bets: [{
        bettorId,
        type: initialBetType,
        amount: initialAmount
      }],
      resolved: false
    };

    gameState.markets = gameState.markets || [];
    gameState.markets.push(market);

    return { success: true, message: `Market opened on ${target.name}'s survival` };
  },

  placeBet(marketId, type, amount, bettorId, gameState) {
    if (gameState.influencePoints < amount && bettorId === 'player') {
      return { success: false, message: 'Not enough IP to place bet' };
    }

    const market = gameState.markets.find(m => m.id === marketId);
    if (!market || market.resolved) {
      return { success: false, message: 'Market is closed or invalid' };
    }

    if (bettorId === 'player') {
      gameState.influencePoints -= amount;
    }

    if (type === 'alive') {
      market.poolAlive += amount;
    } else {
      market.poolDead += amount;
    }

    // Add to existing bet or create new
    const existingBet = market.bets.find(b => b.bettorId === bettorId && b.type === type);
    if (existingBet) {
      existingBet.amount += amount;
    } else {
      market.bets.push({ bettorId, type, amount });
    }

    return { success: true, message: `Placed ${amount} IP on ${type.toUpperCase()}` };
  },

  getPayoutRatio(market, type) {
    const totalPool = market.poolAlive + market.poolDead;
    if (totalPool === 0) return 1;
    
    const pool = type === 'alive' ? market.poolAlive : market.poolDead;
    if (pool === 0) return totalPool; // Huge theoretical multiplier
    
    return totalPool / pool;
  },

  evaluateAssassinations(gameState) {
    if (!gameState.markets) return;

    for (const market of gameState.markets) {
      if (market.resolved) continue;

      const target = gameState.characters.find(c => c.id === market.targetId);
      if (!target || !target.alive) continue;

      // The higher the Alive pool compared to the Dead pool, the higher the payout for killing them
      const totalPool = market.poolAlive + market.poolDead;
      if (totalPool < 10) continue; // Not enough money to care

      const deadPayoutRatio = this.getPayoutRatio(market, 'dead');
      
      // If dead payout ratio is very high (e.g., > 3.0), assassins get interested
      // Also absolute pool size matters
      let assassinationChance = 0;
      if (deadPayoutRatio > 2.0) {
        assassinationChance = Math.min((deadPayoutRatio - 1) * 10 + (totalPool / 5), 80); // Cap at 80%
      }

      if (Utils.roll(assassinationChance)) {
        // Assassination occurs!
        target.alive = false;
        const assassin = Utils.pick(['A lone zealot', 'An unknown hitman', 'A rogue operative', 'A radical group']);
        const killText = `Assassinated by ${assassin.toLowerCase()} to claim the massive market bounty on their death.`;
        
        target.history.push({ year: gameState.year, text: killText });
        
        // Add an event for it
        gameState.allEvents.push({
          id: Utils.uuid(),
          year: gameState.year,
          type: 'crisis',
          title: `High-Profile Assassination: ${target.name}`,
          description: `${target.name} was killed in an organized hit following massive prediction market bounties placed on their head.`,
          involvedCharacters: [target.id],
          involvedOrgs: [],
          causes: [],
          consequences: [],
          butterflyChainId: null,
          aiInfluence: null,
          rivalHint: false,
          moralWeight: -15,
          effects: { publicFear: 5 },
          read: false
        });

        if (typeof UI !== 'undefined') {
          UI.addNotification(`[MARKET ASSASSINATION] ${target.name} was killed!`, 'error');
        }
      }
    }
  },

  resolveMarkets(gameState) {
    if (!gameState.markets) return;
    
    const activeMarkets = gameState.markets.filter(m => !m.resolved);
    
    for (const market of activeMarkets) {
      const target = gameState.characters.find(c => c.id === market.targetId);
      const isAlive = target && target.alive;
      const winningType = isAlive ? 'alive' : 'dead';
      
      const totalPool = market.poolAlive + market.poolDead;
      const winningPool = isAlive ? market.poolAlive : market.poolDead;
      
      let playerWon = 0;
      
      for (const bet of market.bets) {
        if (bet.type === winningType) {
          // Calculate share of the winning pool
          const share = winningPool > 0 ? (bet.amount / winningPool) : 0;
          const payout = Math.floor(share * totalPool);
          
          if (bet.bettorId === 'player') {
            gameState.influencePoints += payout;
            gameState.totalIP += payout; // Track lifetime IP
            playerWon += payout;
          } else {
            // Give to rival if it's a rival
            const rivalState = Rivals.states[bet.bettorId];
            if (rivalState) {
              rivalState.power += Math.floor(payout / 5); // Translate IP to rival power loosely
            }
          }
        }
      }
      
      market.resolved = true;
      
      if (playerWon > 0) {
        if (typeof UI !== 'undefined') {
          UI.addNotification(`Market Resolved: ${target.name} is ${winningType}. You won ${playerWon} IP!`, 'success');
        }
      }
    }
    
    // Clean up resolved markets
    gameState.markets = gameState.markets.filter(m => !m.resolved);
  }
};
