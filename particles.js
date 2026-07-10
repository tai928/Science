'use strict';

const canvas = document.querySelector('#particle-canvas');

if (canvas instanceof HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  const temperatureControl = document.querySelector('#temperature');
  const trailToggle = document.querySelector('#trail-toggle');
  const pauseToggle = document.querySelector('#pause-toggle');
  const resetButton = document.querySelector('#reset-particles');
  const stateButtons = document.querySelectorAll('[data-state]');
  const outputs = {
    temperature: document.querySelector('#temperature-output'),
    temperatureDisplay: document.querySelector('#temperature-display'),
    stateStatus: document.querySelector('#state-status'),
    stateDisplay: document.querySelector('#state-display'),
    stateDescription: document.querySelector('#state-description'),
    motion: document.querySelector('#motion-display'),
    motionFill: document.querySelector('#motion-meter-fill'),
    spacing: document.querySelector('#spacing-display'),
    observation: document.querySelector('#observation-text')
  };

  const stateInfo = {
    solid: {
      label: '固体',
      description: '粒子は規則正しく並び、決まった位置のまわりで振動する',
      spacing: 'とても小さい',
      observation: '固体では粒子が規則正しく並び、それぞれが決まった位置のまわりで小さく振動します。'
    },
    liquid: {
      label: '液体',
      description: '粒子同士は近いまま、位置を変えて動く',
      spacing: '小さい',
      observation: '液体では粒子同士の間隔は小さいままですが、粒子は互いの位置を変えながら動きます。'
    },
    gas: {
      label: '気体',
      description: '粒子は大きく離れ、容器全体を自由に動く',
      spacing: 'とても大きい',
      observation: '気体では粒子同士が大きく離れ、容器の壁に衝突しながら自由に飛び回ります。'
    }
  };

  let currentState = 'liquid';
  let particles = [];
  let width = 0;
  let height = 0;
  let lastTime = performance.now();
  let animationFrame = 0;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(rect.width, 320);
    height = Math.max(rect.height, 360);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createParticles();
  }

  function createParticles() {
    const count = currentState === 'gas' ? 24 : 36;
    const padding = 32;
    particles = [];

    if (currentState === 'solid') {
      const columns = 6;
      const rows = 6;
      const gapX = Math.min((width - padding * 2) / (columns - 1), 58);
      const gapY = Math.min((height * 0.52) / (rows - 1), 50);
      const startX = width / 2 - gapX * (columns - 1) / 2;
      const startY = height * 0.35;
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < columns; col += 1) {
          const x = startX + col * gapX;
          const y = startY + row * gapY;
          particles.push({ x, y, homeX: x, homeY: y, vx: 0, vy: 0, radius: 10, phase: random(0, Math.PI * 2) });
        }
      }
      return;
    }

    for (let i = 0; i < count; i += 1) {
      const liquid = currentState === 'liquid';
      particles.push({
        x: random(padding, width - padding),
        y: liquid ? random(height * 0.42, height - padding) : random(padding, height - padding),
        vx: random(-1, 1),
        vy: random(-1, 1),
        radius: liquid ? 11 : 9,
        phase: random(0, Math.PI * 2)
      });
    }
  }

  function temperatureRatio() {
    return (Number(temperatureControl.value) + 20) / 140;
  }

  function speedForState() {
    const ratio = temperatureRatio();
    if (currentState === 'solid') return 0.6 + ratio * 2.3;
    if (currentState === 'liquid') return 0.45 + ratio * 1.9;
    return 0.8 + ratio * 3.3;
  }

  function updateOutputs() {
    const temperature = Number(temperatureControl.value);
    const info = stateInfo[currentState];
    const speed = speedForState();
    let motion = '小さい';
    if (speed > 1.6) motion = '中程度';
    if (speed > 2.7) motion = '大きい';

    outputs.temperature.value = `${temperature} ℃`;
    outputs.temperatureDisplay.textContent = `${temperature} ℃`;
    outputs.stateStatus.textContent = info.label;
    outputs.stateDisplay.textContent = info.label;
    outputs.stateDescription.textContent = info.description;
    outputs.motion.textContent = motion;
    outputs.spacing.textContent = info.spacing;
    outputs.observation.textContent = `${info.observation}${temperature >= 80 ? ' 温度が高いため、粒子の運動は特に激しくなっています。' : temperature <= 0 ? ' 温度が低いため、粒子の運動は小さくなっています。' : ''}`;
    outputs.motionFill.style.width = `${clamp(temperatureRatio() * 100, 5, 100)}%`;
    outputs.stateStatus.dataset.state = currentState;
  }

  function drawContainer() {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(18, 42, 62, 0.98)');
    gradient.addColorStop(1, 'rgba(7, 19, 31, 0.98)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(161, 221, 232, 0.28)';
    ctx.lineWidth = 2;
    ctx.strokeRect(18, 18, width - 36, height - 36);

    for (let y = 48; y < height; y += 48) {
      ctx.beginPath();
      ctx.moveTo(18, y);
      ctx.lineTo(width - 18, y);
      ctx.strokeStyle = 'rgba(161, 221, 232, 0.04)';
      ctx.stroke();
    }
  }

  function resolveCollisions() {
    if (currentState === 'gas') return;
    const minimumDistance = currentState === 'liquid' ? 20 : 18;
    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i];
        const b = particles[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.hypot(dx, dy) || 1;
        if (distance < minimumDistance) {
          const overlap = (minimumDistance - distance) / 2;
          const nx = dx / distance;
          const ny = dy / distance;
          a.x -= nx * overlap;
          a.y -= ny * overlap;
          b.x += nx * overlap;
          b.y += ny * overlap;
        }
      }
    }
  }

  function updateParticles(delta, time) {
    if (pauseToggle.checked) return;
    const speed = speedForState();
    const padding = 30;

    particles.forEach((particle) => {
      if (currentState === 'solid') {
        const amplitude = 1.5 + speed * 1.8;
        particle.x = particle.homeX + Math.sin(time * 0.005 * speed + particle.phase) * amplitude;
        particle.y = particle.homeY + Math.cos(time * 0.0045 * speed + particle.phase) * amplitude;
        return;
      }

      const liquid = currentState === 'liquid';
      const acceleration = liquid ? 0.012 : 0.005;
      particle.vx += random(-acceleration, acceleration) * speed;
      particle.vy += random(-acceleration, acceleration) * speed;
      const velocity = Math.hypot(particle.vx, particle.vy) || 1;
      const targetSpeed = speed * (liquid ? 0.55 : 0.95);
      particle.vx = particle.vx / velocity * targetSpeed;
      particle.vy = particle.vy / velocity * targetSpeed;
      particle.x += particle.vx * delta * 0.06;
      particle.y += particle.vy * delta * 0.06;

      const topLimit = liquid ? height * 0.38 : padding;
      if (particle.x < padding || particle.x > width - padding) {
        particle.vx *= -1;
        particle.x = clamp(particle.x, padding, width - padding);
      }
      if (particle.y < topLimit || particle.y > height - padding) {
        particle.vy *= -1;
        particle.y = clamp(particle.y, topLimit, height - padding);
      }
    });
    resolveCollisions();
  }

  function particleColor() {
    const ratio = temperatureRatio();
    const start = [74, 188, 255];
    const end = [255, 112, 88];
    const rgb = start.map((value, index) => Math.round(value + (end[index] - value) * ratio));
    return `rgb(${rgb.join(',')})`;
  }

  function drawParticles() {
    const color = particleColor();
    particles.forEach((particle) => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(particle.x - particle.radius * 0.28, particle.y - particle.radius * 0.28, particle.radius * 0.24, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.58)';
      ctx.fill();
    });
  }

  function animate(time) {
    const delta = Math.min(time - lastTime, 32);
    lastTime = time;

    if (trailToggle.checked) {
      ctx.fillStyle = 'rgba(7, 19, 31, 0.16)';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(161, 221, 232, 0.22)';
      ctx.strokeRect(18, 18, width - 36, height - 36);
    } else {
      drawContainer();
    }

    updateParticles(delta, time);
    drawParticles();
    animationFrame = requestAnimationFrame(animate);
  }

  function setState(state) {
    currentState = state;
    stateButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.state === state);
      button.setAttribute('aria-pressed', String(button.dataset.state === state));
    });
    createParticles();
    updateOutputs();
  }

  stateButtons.forEach((button) => {
    button.addEventListener('click', () => setState(button.dataset.state));
  });
  temperatureControl.addEventListener('input', updateOutputs);
  trailToggle.addEventListener('change', () => {
    if (!trailToggle.checked) drawContainer();
  });
  resetButton.addEventListener('click', () => {
    temperatureControl.value = '20';
    trailToggle.checked = false;
    pauseToggle.checked = false;
    setState('liquid');
  });

  const resizeObserver = new ResizeObserver(resizeCanvas);
  resizeObserver.observe(canvas);
  setState('liquid');
  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(animate);
}
