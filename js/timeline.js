// ============================================================
// TIMELINE.JS — Timeline Visualization & Interaction
// ============================================================

const Timeline = {
  container: null,
  canvas: null,
  ctx: null,
  scrollOffset: 0,
  zoom: 1,
  hoveredNode: null,
  selectedNode: null,
  nodes: [],
  yearWidth: 80,
  isDragging: false,
  dragStartX: 0,
  dragStartOffset: 0,

  initialize(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.canvas = document.createElement('canvas');
    this.canvas.id = 'timeline-canvas';
    this.container.appendChild(this.canvas);

    this.resize();
    this._bindEvents();
  },

  resize() {
    if (!this.canvas || !this.container) return;
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;
    this.ctx = this.canvas.getContext('2d');
  },

  _bindEvents() {
    this.canvas.addEventListener('mousedown', (e) => this._onMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this._onMouseMove(e));
    this.canvas.addEventListener('mouseup', () => this._onMouseUp());
    this.canvas.addEventListener('mouseleave', () => this._onMouseUp());
    this.canvas.addEventListener('wheel', (e) => this._onWheel(e));
    this.canvas.addEventListener('click', (e) => this._onClick(e));

    // Touch support
    this.canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      this._onMouseDown({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} });
    });
    this.canvas.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      this._onMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
      e.preventDefault();
    });
    this.canvas.addEventListener('touchend', () => this._onMouseUp());

    window.addEventListener('resize', () => this.resize());
  },

  _onMouseDown(e) {
    this.isDragging = true;
    const rect = this.canvas.getBoundingClientRect();
    this.dragStartX = e.clientX - rect.left;
    this.dragStartOffset = this.scrollOffset;
  },

  _onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.isDragging) {
      const dx = x - this.dragStartX;
      this.scrollOffset = this.dragStartOffset + dx;
      this.render(this._lastState);
    }

    // Check hover
    this.hoveredNode = null;
    for (const node of this.nodes) {
      const dx = x - node.x;
      const dy = y - node.y;
      if (dx * dx + dy * dy < (node.radius + 4) * (node.radius + 4)) {
        this.hoveredNode = node;
        this.canvas.style.cursor = 'pointer';
        break;
      }
    }

    if (!this.hoveredNode) {
      this.canvas.style.cursor = this.isDragging ? 'grabbing' : 'grab';
    }

    if (!this.isDragging) {
      this.render(this._lastState);
    }
  },

  _onMouseUp() {
    this.isDragging = false;
  },

  _onWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    this.zoom = Utils.clamp(this.zoom + delta, 0.3, 3);
    this.render(this._lastState);
  },

  _onClick(e) {
    if (this.hoveredNode && this.hoveredNode.event) {
      this.selectedNode = this.hoveredNode;
      if (typeof UI !== 'undefined' && UI.showEventDetail) {
        UI.showEventDetail(this.hoveredNode.event);
      }
    }
  },

  scrollToYear(year) {
    if (!this.canvas) return;
    const targetX = (year - 2025) * this.yearWidth * this.zoom;
    this.scrollOffset = this.canvas.width / 2 - targetX;
  },

  render(gameState) {
    if (!this.ctx || !gameState) return;
    this._lastState = gameState;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const { year, allEvents } = gameState;

    // Clear
    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, w, h);

    // Draw subtle grid
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, h);
      ctx.stroke();
    }

    const yw = this.yearWidth * this.zoom;
    const centerY = h / 2;
    this.nodes = [];

    // Draw era backgrounds
    for (const era of DATA.eras) {
      const x1 = (era.range[0] - 2025) * yw + this.scrollOffset;
      const x2 = (era.range[1] - 2025) * yw + this.scrollOffset;

      if (x2 < 0 || x1 > w) continue;

      ctx.fillStyle = era.color + '08';
      ctx.fillRect(x1, 0, x2 - x1, h);

      // Era label
      const labelX = Math.max(x1 + 10, 10);
      if (labelX < w - 100) {
        ctx.fillStyle = era.color + '60';
        ctx.font = `${11 * this.zoom}px Inter, sans-serif`;
        ctx.fillText(era.name.toUpperCase(), labelX, 20);
      }
    }

    // Draw main timeline line
    const lineY = centerY;
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, lineY);
    ctx.lineTo(w, lineY);
    ctx.stroke();

    // Draw year markers
    for (let y = 2025; y <= 2150; y += 5) {
      const x = (y - 2025) * yw + this.scrollOffset;
      if (x < -50 || x > w + 50) continue;

      ctx.strokeStyle = 'rgba(0, 212, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, lineY - 8);
      ctx.lineTo(x, lineY + 8);
      ctx.stroke();

      ctx.fillStyle = 'rgba(0, 212, 255, 0.4)';
      ctx.font = `${10 * Math.min(this.zoom, 1.5)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(y.toString(), x, lineY + 22);
    }

    // Draw current year indicator
    const currentX = (year - 2025) * yw + this.scrollOffset;
    const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;

    ctx.strokeStyle = `rgba(0, 212, 255, ${pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(currentX, 0);
    ctx.lineTo(currentX, h);
    ctx.stroke();

    ctx.fillStyle = '#00d4ff';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`▼ ${year}`, currentX, lineY - 20);

    // Draw butterfly chains (connecting lines)
    const chainColors = ['#ff6b35', '#b744ff', '#30d158', '#ffd60a', '#ff2d55'];
    const chains = Butterfly.chains || [];

    for (let ci = 0; ci < chains.length; ci++) {
      const chain = chains[ci];
      if (chain.links.length < 2) continue;

      const color = chainColors[ci % chainColors.length];
      ctx.strokeStyle = color + '50';
      ctx.lineWidth = chain.magnitude;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();

      for (let li = 0; li < chain.links.length; li++) {
        const link = chain.links[li];
        const lx = (link.year - 2025) * yw + this.scrollOffset;
        const ly = lineY + (ci % 2 === 0 ? -30 - ci * 8 : 30 + ci * 8);

        if (li === 0) ctx.moveTo(lx, ly);
        else ctx.lineTo(lx, ly);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Group events by year for positioning
    const eventsByYear = {};
    for (const event of allEvents) {
      if (!eventsByYear[event.year]) eventsByYear[event.year] = [];
      eventsByYear[event.year].push(event);
    }

    // Draw event nodes
    const typeColors = {
      breakthrough: '#00d4ff',
      political: '#b744ff',
      corporate: '#ffd60a',
      social: '#30d158',
      crisis: '#ff2d55',
      discovery: '#64d2ff',
      rivalry: '#ff6b35',
      moral: '#bf5af2',
      intervention: '#00ffaa'
    };

    for (const [eventYear, events] of Object.entries(eventsByYear)) {
      const x = (parseInt(eventYear) - 2025) * yw + this.scrollOffset;
      if (x < -30 || x > w + 30) continue;

      for (let i = 0; i < Math.min(events.length, 6); i++) {
        const event = events[i];
        const yOffset = (i % 2 === 0 ? -1 : 1) * (35 + Math.floor(i / 2) * 25);
        const nodeY = lineY + yOffset;
        const radius = event.aiInfluence ? 6 : 4;
        const color = typeColors[event.type] || '#00d4ff';

        // Node glow for player-influenced events
        if (event.aiInfluence && event.aiInfluence.playerId) {
          ctx.shadowColor = '#00ffaa';
          ctx.shadowBlur = 10;
        } else if (event.rivalHint) {
          ctx.shadowColor = '#ff2d55';
          ctx.shadowBlur = 8;
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, nodeY, radius * this.zoom, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        // Store node for hit detection
        this.nodes.push({
          x,
          y: nodeY,
          radius: radius * this.zoom,
          event
        });

        // Draw connector line to timeline
        ctx.strokeStyle = color + '30';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, lineY);
        ctx.lineTo(x, nodeY);
        ctx.stroke();
      }
    }

    // Draw hovered node tooltip
    if (this.hoveredNode) {
      const node = this.hoveredNode;
      const event = node.event;

      // Highlight
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + 4, 0, Math.PI * 2);
      ctx.stroke();

      // Tooltip
      const tooltipW = 250;
      const tooltipH = 50;
      let tx = node.x - tooltipW / 2;
      let ty = node.y < centerY ? node.y - tooltipH - 15 : node.y + 15;

      tx = Utils.clamp(tx, 5, w - tooltipW - 5);
      ty = Utils.clamp(ty, 5, h - tooltipH - 5);

      ctx.fillStyle = 'rgba(10, 14, 23, 0.95)';
      ctx.strokeStyle = typeColors[event.type] || '#00d4ff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(tx, ty, tooltipW, tooltipH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#e6edf3';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'left';

      const titleText = event.title.length > 38 ? event.title.substring(0, 35) + '...' : event.title;
      ctx.fillText(titleText, tx + 8, ty + 18);

      ctx.fillStyle = '#8b949e';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(`${event.year} • ${event.type} • Click to inspect`, tx + 8, ty + 36);
    }

    // Request animation frame for pulse effect
    if (!this._animating) {
      this._animating = true;
      const animate = () => {
        this.render(this._lastState);
        if (this._animating) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  },

  stopAnimation() {
    this._animating = false;
  },

  destroy() {
    this.stopAnimation();
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
};
