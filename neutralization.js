'use strict';

const canvas = document.querySelector('#neutralization-canvas');

if (canvas instanceof HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  const controls = {
    acidVolume: document.querySelector('#acid-volume'),
    acidConcentration: document.querySelector('#acid-concentration'),
    baseVolume: document.querySelector('#base-volume'),
    baseConcentration: document.querySelector('#base-concentration')
  };

  const outputs = {
    acidVolume: document.querySelector('#acid-volume-output'),
    acidConcentration: document.querySelector('#acid-concentration-output'),
    baseVolume: document.querySelector('#base-volume-output'),
    baseConcentration: document.querySelector('#base-concentration-output'),
    ph: document.querySelector('#ph-display'),
    property: document.querySelector('#property-display'),
    indicator: document.querySelector('#indicator-display'),
    water: document.querySelector('#water-display'),
    hIon: document.querySelector('#h-ion-display'),
    ohIon: document.querySelector('#oh-ion-display'),
    spectator: document.querySelector('#spectator-display'),
    totalVolume: document.querySelector('#total-volume-display'),
    status: document.querySelector('#solution-status'),
    phMarker: document.querySelector('#ph-marker')
  };

  const resetButton = document.querySelector('#reset-neutralization');
  const presetButtons = document.querySelectorAll('[data-preset]');
  const particles = [];
  let model = null;
  let width = 0;
  let height = 0;
  let animationFrame = 0;

  const palette = {
    acid: '#ff6b77',
    base: '#5d8dff',
    water: '#55d6c2',
    sodium: '#ffbf47',
    chloride: '#b58cff'
  };

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function calculateModel() {
    const acidVolumeMl = Number(controls.acidVolume.value);
    const acidConcentration = Number(controls.acidConcentration.value);
    const baseVolumeMl = Number(controls.baseVolume.value);
    const baseConcentration = Number(controls.baseConcentration.value);

    const acidMoles = acidConcentration * acidVolumeMl / 1000;
    const baseMoles = baseConcentration * baseVolumeMl / 1000;
    const totalVolumeL = Math.max((acidVolumeMl + baseVolumeMl) / 1000, 0.001);
    const reactedMoles = Math.min(acidMoles, baseMoles);
    const excessH = Math.max(acidMoles - baseMoles, 0);
    const excessOH = Math.max(baseMoles - acidMoles, 0);

    let ph = 7;
    if (excessH > 1e-12) {
      ph = -Math.log10(excessH / totalVolumeL);
    } else if (excessOH > 1e-12) {
      const poh = -Math.log10(excessOH / totalVolumeL);
      ph = 14 - poh;
    }
    ph = clamp(ph, 0, 14);

    let property = '中性';
    let indicator = '緑色';
    if (ph < 6.0) {
      property = '酸性';
      indicator = ph < 4 ? '黄色' : '黄緑色';
    } else if (ph > 7.6) {
      property = 'アルカリ性';
      indicator = ph > 10 ? '青色' : '青緑色';
    }

    return {
      acidVolumeMl,
      acidConcentration,
      baseVolumeMl,
      baseConcentration,
      acidMoles,
      baseMoles,
      reactedMoles,
      excessH,
      excessOH,
      totalVolumeMl: acidVolumeMl + baseVolumeMl,
      ph,
      property,
      indicator
    };
  }

  function indicatorColor(ph) {
    const stops = [
      { ph: 0, rgb: [238, 196, 65] },
      { ph: 5.8, rgb: [238, 218, 69] },
      { ph: 7.0, rgb: [64, 190, 116] },
      { ph: 7.6, rgb: [48, 172, 161] },
      { ph: 14, rgb: [52, 105, 207] }
    ];

    const upperIndex = stops.findIndex((stop) => ph <= stop.ph);
    if (upperIndex <= 0) return `rgb(${stops[0].rgb.join(',')})`;
    const lower = stops[upperIndex - 1];
    const upper = stops[upperIndex];
    const ratio = (ph - lower.ph) / (upper.ph - lower.ph);
    const rgb = lower.rgb.map((value, index) => Math.round(value + (upper.rgb[index] - value) * ratio));
    return `rgb(${rgb.join(',')})`;
  }

  function formatMmol(moles) {
    return `${(moles * 1000).toFixed(1)} mmol`;
  }

  function updateOutputs() {
    model = calculateModel();
    outputs.acidVolume.value = `${model.acidVolumeMl} mL`;
    outputs.acidConcentration.value = `${model.acidConcentration.toFixed(2)} mol/L`;
    outputs.baseVolume.value = `${model.baseVolumeMl} mL`;
    outputs.baseConcentration.value = `${model.baseConcentration.toFixed(2)} mol/L`;
    outputs.ph.textContent = model.ph.toFixed(1);
    outputs.property.textContent = model.property;
    outputs.indicator.textContent = `BTB：${model.indicator}`;
    outputs.water.textContent = formatMmol(model.reactedMoles);
    outputs.hIon.textContent = formatMmol(model.excessH);
    outputs.ohIon.textContent = formatMmol(model.excessOH);
    outputs.spectator.textContent = `${(model.baseMoles * 1000).toFixed(1)} / ${(model.acidMoles * 1000).toFixed(1)} mmol`;
    outputs.totalVolume.textContent = `${model.totalVolumeMl} mL`;
    outputs.status.textContent = model.property;
    outputs.status.dataset.state = model.property;
    outputs.phMarker.style.left = `${model.ph / 14 * 100}%`;

    rebuildParticles();
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(rect.width, 320);
    height = Math.max(rect.height, 360);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    rebuildParticles();
  }

  function seededRandom(seed) {
    const x = Math.sin(seed * 999) * 43758.5453;
    return x - Math.floor(x);
  }

  function addParticles(type, amount, maxAmount, offset) {
    const count = Math.round(clamp(amount / Math.max(maxAmount, 0.00001), 0, 1) * 18);
    for (let i = 0; i < count; i += 1) {
      const seed = i + offset;
      particles.push({
        type,
        x: width * (0.22 + seededRandom(seed) * 0.56),
        y: height * (0.42 + seededRandom(seed + 31) * 0.40),
        vx: (seededRandom(seed + 62) - 0.5) * 0.45,
        vy: (seededRandom(seed + 93) - 0.5) * 0.45,
        phase: seededRandom(seed + 124) * Math.PI * 2
      });
    }
  }

  function rebuildParticles() {
    if (!model || width === 0) return;
    particles.length = 0;
    const maxMoles = Math.max(model.acidMoles, model.baseMoles, 0.001);
    addParticles('h', model.excessH, maxMoles, 10);
    addParticles('oh', model.excessOH, maxMoles, 100);
    addParticles('water', model.reactedMoles, maxMoles, 200);
    addParticles('na', model.baseMoles, maxMoles, 300);
    addParticles('cl', model.acidMoles, maxMoles, 400);
  }

  function roundedRect(x, y, w, h, radius) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
  }

  function drawBeaker() {
    const beakerX = width * 0.16;
    const beakerY = height * 0.17;
    const beakerW = width * 0.68;
    const beakerH = height * 0.70;
    const liquidTop = beakerY + beakerH * 0.23;

    ctx.clearRect(0, 0, width, height);
    const bg = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width * 0.65);
    bg.addColorStop(0, 'rgba(92, 231, 211, 0.10)');
    bg.addColorStop(1, 'rgba(6, 18, 30, 0)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    roundedRect(beakerX, liquidTop, beakerW, beakerY + beakerH - liquidTop, 22);
    ctx.clip();
    const liquid = ctx.createLinearGradient(0, liquidTop, 0, beakerY + beakerH);
    liquid.addColorStop(0, indicatorColor(model.ph).replace('rgb', 'rgba').replace(')', ',0.58)'));
    liquid.addColorStop(1, indicatorColor(model.ph).replace('rgb', 'rgba').replace(')', ',0.88)'));
    ctx.fillStyle = liquid;
    ctx.fillRect(beakerX, liquidTop, beakerW, beakerH);
    ctx.restore();

    ctx.strokeStyle = 'rgba(222, 245, 250, 0.75)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(beakerX, beakerY);
    ctx.lineTo(beakerX + beakerW * 0.08, beakerY + beakerH);
    ctx.quadraticCurveTo(beakerX + beakerW * 0.10, beakerY + beakerH + 10, beakerX + beakerW * 0.18, beakerY + beakerH + 10);
    ctx.lineTo(beakerX + beakerW * 0.82, beakerY + beakerH + 10);
    ctx.quadraticCurveTo(beakerX + beakerW * 0.90, beakerY + beakerH + 10, beakerX + beakerW * 0.92, beakerY + beakerH);
    ctx.lineTo(beakerX + beakerW, beakerY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(beakerX - 8, beakerY);
    ctx.lineTo(beakerX + beakerW + 8, beakerY);
    ctx.stroke();
  }

  function particleStyle(type) {
    const styles = {
      h: { color: palette.acid, label: 'H⁺', radius: 15 },
      oh: { color: palette.base, label: 'OH⁻', radius: 18 },
      water: { color: palette.water, label: 'H₂O', radius: 17 },
      na: { color: palette.sodium, label: 'Na⁺', radius: 15 },
      cl: { color: palette.chloride, label: 'Cl⁻', radius: 15 }
    };
    return styles[type];
  }

  function drawParticles(time) {
    const left = width * 0.19;
    const right = width * 0.81;
    const top = height * 0.41;
    const bottom = height * 0.84;

    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.x < left || particle.x > right) particle.vx *= -1;
      if (particle.y < top || particle.y > bottom) particle.vy *= -1;

      const style = particleStyle(particle.type);
      const pulse = 1 + Math.sin(time * 0.002 + particle.phase) * 0.05;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, style.radius * pulse, 0, Math.PI * 2);
      ctx.fillStyle = style.color;
      ctx.shadowColor = style.color;
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#08131c';
      ctx.font = `700 ${particle.type === 'water' ? 10 : 11}px system-ui`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(style.label, particle.x, particle.y + 0.5);
    });
  }

  function animate(time) {
    drawBeaker();
    drawParticles(time);
    animationFrame = requestAnimationFrame(animate);
  }

  function setValues(values) {
    Object.entries(values).forEach(([key, value]) => {
      controls[key].value = String(value);
    });
    updateOutputs();
  }

  Object.values(controls).forEach((control) => {
    control.addEventListener('input', updateOutputs);
  });

  presetButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const preset = button.dataset.preset;
      if (preset === 'acidic') setValues({ acidVolume: 70, acidConcentration: 0.10, baseVolume: 30, baseConcentration: 0.10 });
      if (preset === 'neutral') setValues({ acidVolume: 50, acidConcentration: 0.10, baseVolume: 50, baseConcentration: 0.10 });
      if (preset === 'basic') setValues({ acidVolume: 30, acidConcentration: 0.10, baseVolume: 70, baseConcentration: 0.10 });
    });
  });

  resetButton.addEventListener('click', () => {
    setValues({ acidVolume: 50, acidConcentration: 0.10, baseVolume: 50, baseConcentration: 0.10 });
  });

  const resizeObserver = new ResizeObserver(resizeCanvas);
  resizeObserver.observe(canvas);
  updateOutputs();
  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(animate);
}
