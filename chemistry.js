'use strict';

const topics = [
  { id: 'density', grade: 1, name: '密度と物質の区別', description: '質量と体積を変え、密度から物質の種類を比べます。' },
  { id: 'gas', grade: 1, name: '気体の性質', description: '気体の集め方、空気との重さ、水への溶けやすさを比較します。' },
  { id: 'solubility', grade: 1, name: '溶解度と結晶', description: '温度と水の量を変え、溶ける量と結晶量を調べます。' },
  { id: 'particles', grade: 1, name: '粒子運動・状態変化', description: '固体・液体・気体で、粒子の並び方と動きを比較します。' },
  { id: 'mass', grade: 2, name: '質量保存の法則', description: '密閉容器と開放容器で、反応前後の質量を比較します。' },
  { id: 'oxidation', grade: 2, name: '酸化と還元', description: '酸素と結びつく変化と、酸素を取り除く変化を確かめます。' },
  { id: 'precipitation', grade: 3, name: 'イオンと沈殿', description: '水溶液の組み合わせによる沈殿の生成を調べます。' },
  { id: 'electrolysis', grade: 3, name: '電気分解', description: '電流と時間を変え、電極で起こる変化を観察します。' },
  { id: 'battery', grade: 3, name: '化学電池', description: '金属と電解質の組み合わせで電圧を比較します。' },
  { id: 'neutralization', grade: 3, name: '酸・アルカリと中和', description: '酸とアルカリの量を変え、pHと残るイオンを調べます。' }
];

const $ = (selector) => document.querySelector(selector);
const gradeTabs = $('#grade-tabs');
const unitList = $('#unit-list');
const content = $('#simulation-content');
let currentTopic = 'density';
let currentGrade = 1;
let animationTimer = null;

function clearAnimation() {
  if (animationTimer) window.clearInterval(animationTimer);
  animationTimer = null;
}

function range(id, label, min, max, step, value, unit = '') {
  return `<div class="control-row"><label for="${id}"><span>${label}</span><output id="${id}-out">${value}${unit}</output></label><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></div>`;
}

function results(rows, note = '') {
  return `<div class="sim-card"><h3>結果</h3><div class="result-list">${rows.map(([label, value, id]) => `<div><span>${label}</span><strong${id ? ` id="${id}"` : ''}>${value}</strong></div>`).join('')}</div>${note ? `<div class="note-box" id="topic-note">${note}</div>` : ''}</div>`;
}

function bindRange(id, unit, update) {
  const input = $(`#${id}`);
  const output = $(`#${id}-out`);
  input.addEventListener('input', () => {
    output.value = `${input.value}${unit}`;
    update();
  });
}

function renderNavigation() {
  gradeTabs.innerHTML = [1, 2, 3].map((grade) => `<button class="grade-tab${grade === currentGrade ? ' is-active' : ''}" type="button" data-grade="${grade}">中${grade}</button>`).join('');
  const gradeTopics = topics.filter((topic) => topic.grade === currentGrade);
  unitList.innerHTML = gradeTopics.map((topic, index) => `<button class="unit-button${topic.id === currentTopic ? ' is-active' : ''}" type="button" data-topic="${topic.id}"><span class="unit-number">${String(index + 1).padStart(2, '0')}</span><span class="unit-name">${topic.name}</span></button>`).join('');
}

function openTopic(id, updateHash = true) {
  const topic = topics.find((item) => item.id === id) || topics[0];
  clearAnimation();
  currentTopic = topic.id;
  currentGrade = topic.grade;
  $('#topic-grade').textContent = `中学${topic.grade}年 化学`;
  $('#topic-title').textContent = topic.name;
  $('#topic-description').textContent = topic.description;
  renderNavigation();
  renderers[topic.id]();
  if (updateHash) history.replaceState(null, '', `#${topic.id}`);
}

function renderDensity() {
  content.innerHTML = `<div class="sim-grid"><div class="sim-card"><h3>密度の比較</h3><div class="bar-chart"><div class="bar-item"><div id="mass-bar" class="bar"></div><small>質量</small></div><div class="bar-item"><div id="volume-bar" class="bar"></div><small>体積</small></div><div class="bar-item"><div id="density-bar" class="bar"></div><small>密度</small></div></div></div><div><div class="sim-card"><h3>条件</h3>${range('mass-input', '質量', 10, 500, 1, 100, ' g')}${range('volume-input', '体積', 10, 250, 1, 50, ' cm³')}</div>${results([['密度', '2.00 g/cm³', 'density-result'], ['近い物質', 'アルミニウム', 'material-result']], '密度 = 質量 ÷ 体積')}</div></div>`;
  const update = () => {
    const mass = +$('#mass-input').value;
    const volume = +$('#volume-input').value;
    const density = mass / volume;
    const refs = [['水', 1], ['アルミニウム', 2.7], ['鉄', 7.87], ['銅', 8.96]];
    refs.sort((a, b) => Math.abs(a[1] - density) - Math.abs(b[1] - density));
    $('#density-result').textContent = `${density.toFixed(2)} g/cm³`;
    $('#material-result').textContent = refs[0][0];
    $('#mass-bar').style.height = `${Math.min(210, mass / 2.4)}px`;
    $('#volume-bar').style.height = `${Math.min(210, volume * 0.84)}px`;
    $('#density-bar').style.height = `${Math.min(210, density * 22)}px`;
  };
  bindRange('mass-input', ' g', update);
  bindRange('volume-input', ' cm³', update);
  update();
}

function renderGas() {
  const gases = {
    oxygen: ['酸素', '水上置換', '空気より少し重い', '溶けにくい'],
    hydrogen: ['水素', '水上置換', '空気より非常に軽い', '溶けにくい'],
    carbon: ['二酸化炭素', '下方置換', '空気より重い', '少し溶ける'],
    ammonia: ['アンモニア', '上方置換', '空気より軽い', '非常によく溶ける']
  };
  content.innerHTML = `<div class="sim-grid"><div class="sim-card"><h3>気体モデル</h3><div id="gas-box" class="visual-box"></div></div><div><div class="sim-card"><h3>条件</h3><div class="control-row"><label for="gas-select">気体</label><select id="gas-select">${Object.entries(gases).map(([key, value]) => `<option value="${key}">${value[0]}</option>`).join('')}</select></div>${range('gas-count', '表示する粒子数', 8, 45, 1, 24, ' 個')}</div>${results([['適した集め方', '水上置換', 'gas-method'], ['空気との比較', '少し重い', 'gas-density'], ['水への溶けやすさ', '溶けにくい', 'gas-water']])}</div></div>`;
  const update = () => {
    const gas = gases[$('#gas-select').value];
    const count = +$('#gas-count').value;
    $('#gas-method').textContent = gas[1];
    $('#gas-density').textContent = gas[2];
    $('#gas-water').textContent = gas[3];
    $('#gas-box').innerHTML = Array.from({ length: count }, (_, index) => `<span class="gas-particle" style="left:${7 + (index * 37) % 88}%;top:${8 + (index * 53) % 82}%"></span>`).join('');
  };
  $('#gas-select').addEventListener('change', update);
  bindRange('gas-count', ' 個', update);
  update();
}

function renderSolubility() {
  const functions = { salt: (t) => 35.7 + 0.035 * (t - 20), nitrate: (t) => 13.3 + 0.75 * t, sugar: (t) => 180 + 2.1 * t };
  content.innerHTML = `<div class="sim-grid"><div class="sim-card"><h3>水溶液と結晶</h3><div class="visual-box"><div class="solution-cup"><div class="solution-liquid"></div><div id="crystals"></div></div></div></div><div><div class="sim-card"><h3>条件</h3><div class="control-row"><label for="solute-select">物質</label><select id="solute-select"><option value="salt">食塩</option><option value="nitrate">硝酸カリウム</option><option value="sugar">砂糖</option></select></div>${range('hot-temp', '溶かす温度', 20, 80, 1, 60, ' ℃')}${range('cold-temp', '冷やした温度', 0, 50, 1, 20, ' ℃')}${range('water-mass', '水の質量', 20, 200, 5, 100, ' g')}</div>${results([['高温で溶ける量', '0 g', 'hot-sol'], ['冷却後に溶ける量', '0 g', 'cold-sol'], ['出てくる結晶', '0 g', 'crystal-result']])}</div></div>`;
  const update = () => {
    const fn = functions[$('#solute-select').value];
    const water = +$('#water-mass').value;
    const hot = fn(+$('#hot-temp').value) * water / 100;
    const cold = fn(+$('#cold-temp').value) * water / 100;
    const crystal = Math.max(0, hot - cold);
    $('#hot-sol').textContent = `${hot.toFixed(1)} g`;
    $('#cold-sol').textContent = `${cold.toFixed(1)} g`;
    $('#crystal-result').textContent = `${crystal.toFixed(1)} g`;
    $('#crystals').innerHTML = Array.from({ length: Math.min(24, Math.round(crystal / 3)) }, (_, index) => `<span class="crystal" style="left:${10 + (index * 31) % 78}%;bottom:${8 + (index % 4) * 18}px"></span>`).join('');
  };
  $('#solute-select').addEventListener('change', update);
  bindRange('hot-temp', ' ℃', update);
  bindRange('cold-temp', ' ℃', update);
  bindRange('water-mass', ' g', update);
  update();
}

function renderParticles() {
  content.innerHTML = `<div class="sim-grid"><div class="sim-card"><h3>粒子モデル</h3><div id="particle-box" class="visual-box"></div></div><div><div class="sim-card"><h3>条件</h3><div class="choice-row" id="state-buttons"><button class="choice-button" data-state="solid">固体</button><button class="choice-button is-active" data-state="liquid">液体</button><button class="choice-button" data-state="gas">気体</button></div>${range('particle-temp', '温度', -20, 120, 1, 20, ' ℃')}</div>${results([['状態', '液体', 'particle-state'], ['粒子間隔', '小さい', 'particle-spacing'], ['運動', '位置を変えながら動く', 'particle-motion']])}</div></div>`;
  let state = 'liquid';
  const descriptions = { solid: ['固体', '小さい', '決まった位置で振動'], liquid: ['液体', '小さい', '位置を変えながら動く'], gas: ['気体', '大きい', '容器全体を飛び回る'] };
  const draw = () => {
    const box = $('#particle-box');
    const count = state === 'gas' ? 18 : 28;
    const dots = [];
    for (let index = 0; index < count; index += 1) {
      let left;
      let top;
      if (state === 'solid') {
        left = 16 + (index % 7) * 11;
        top = 18 + Math.floor(index / 7) * 18;
      } else if (state === 'liquid') {
        left = 10 + (index * 29) % 80;
        top = 42 + (index * 43) % 48;
      } else {
        left = 6 + (index * 37) % 88;
        top = 7 + (index * 53) % 84;
      }
      dots.push(`<span class="particle-dot" style="left:${left}%;top:${top}%"></span>`);
    }
    box.innerHTML = dots.join('');
    const [name, spacing, motion] = descriptions[state];
    $('#particle-state').textContent = name;
    $('#particle-spacing').textContent = spacing;
    $('#particle-motion').textContent = motion;
  };
  $('#state-buttons').addEventListener('click', (event) => {
    const button = event.target.closest('[data-state]');
    if (!button) return;
    state = button.dataset.state;
    document.querySelectorAll('[data-state]').forEach((item) => item.classList.toggle('is-active', item === button));
    draw();
  });
  bindRange('particle-temp', ' ℃', draw);
  draw();
  animationTimer = window.setInterval(() => {
    if (state === 'solid') return;
    document.querySelectorAll('.particle-dot').forEach((dot, index) => {
      const amount = state === 'gas' ? 7 : 3;
      dot.style.transform = `translate(${Math.sin(Date.now() / 350 + index) * amount}px,${Math.cos(Date.now() / 420 + index) * amount}px)`;
    });
  }, 120);
}

function renderMass() {
  content.innerHTML = `<div class="sim-grid"><div class="sim-card"><h3>反応前後の質量</h3><div class="mass-balance"><div class="mass-pan"><span>反応前</span><strong id="before-pan">150.0 g</strong></div><span>→</span><div class="mass-pan"><span>反応後</span><strong id="after-pan">150.0 g</strong></div></div></div><div><div class="sim-card"><h3>条件</h3><div class="control-row"><label for="container-type">容器</label><select id="container-type"><option value="closed">密閉容器</option><option value="open">開放容器</option></select></div>${range('reactant-mass', '反応物の合計質量', 50, 300, 1, 150, ' g')}${range('gas-produced', '発生する気体', 0, 50, 1, 20, ' g')}</div>${results([['反応前', '150.0 g', 'before-result'], ['測定される反応後', '150.0 g', 'after-result'], ['系全体の質量', '150.0 g', 'total-result']], '密閉した系全体では質量は変わりません。')}</div></div>`;
  const update = () => {
    const mass = +$('#reactant-mass').value;
    const gas = +$('#gas-produced').value;
    const open = $('#container-type').value === 'open';
    const after = open ? mass - gas : mass;
    ['before-pan', 'before-result', 'total-result'].forEach((id) => $(`#${id}`).textContent = `${mass.toFixed(1)} g`);
    ['after-pan', 'after-result'].forEach((id) => $(`#${id}`).textContent = `${after.toFixed(1)} g`);
    $('#topic-note').textContent = open ? '気体が外へ出るため、容器だけを量ると軽く見えます。' : '発生した気体も容器内にあるため、全体の質量は変わりません。';
  };
  $('#container-type').addEventListener('change', update);
  bindRange('reactant-mass', ' g', update);
  bindRange('gas-produced', ' g', update);
  update();
}

function renderOxidation() {
  content.innerHTML = `<div class="sim-grid"><div class="sim-card"><h3>金属の変化</h3><div class="visual-box metal-demo"><div id="metal-piece" class="metal-piece"></div></div></div><div><div class="sim-card"><h3>条件</h3><div class="control-row"><label for="reaction-mode">変化</label><select id="reaction-mode"><option value="oxidation">酸化</option><option value="reduction">還元</option></select></div>${range('reaction-progress', '反応の進み方', 0, 100, 1, 50, ' %')}</div>${results([['変化', '金属が酸素と結びつく', 'change-result'], ['質量の変化', '増える', 'mass-change'], ['粒子の見方', '金属 + 酸素 → 金属酸化物', 'particle-result']])}</div></div>`;
  const update = () => {
    const reduction = $('#reaction-mode').value === 'reduction';
    const progress = +$('#reaction-progress').value;
    $('#metal-piece').classList.toggle('oxidized', reduction ? progress < 50 : progress > 50);
    $('#change-result').textContent = reduction ? '酸化物から酸素を取り除く' : '金属が酸素と結びつく';
    $('#mass-change').textContent = reduction ? '減る' : '増える';
    $('#particle-result').textContent = reduction ? '金属酸化物 → 金属 + 酸素' : '金属 + 酸素 → 金属酸化物';
  };
  $('#reaction-mode').addEventListener('change', update);
  bindRange('reaction-progress', ' %', update);
  update();
}

function renderPrecipitation() {
  const pairs = {
    silver: ['塩化銀', '白色', 'Ag⁺ + Cl⁻'],
    barium: ['硫酸バリウム', '白色', 'Ba²⁺ + SO₄²⁻'],
    copper: ['水酸化銅', '青白色', 'Cu²⁺ + 2OH⁻'],
    none: ['沈殿なし', '変化なし', '反応なし']
  };
  content.innerHTML = `<div class="sim-grid"><div class="sim-card"><h3>混合後のようす</h3><div class="visual-box"><div class="solution-cup"><div class="solution-liquid"></div><div id="precipitate" class="precipitate"></div></div></div></div><div><div class="sim-card"><h3>条件</h3><div class="control-row"><label for="pair-select">水溶液の組み合わせ</label><select id="pair-select"><option value="silver">硝酸銀 + 塩化ナトリウム</option><option value="barium">塩化バリウム + 硫酸ナトリウム</option><option value="copper">硫酸銅 + 水酸化ナトリウム</option><option value="none">塩化ナトリウム + 硝酸カリウム</option></select></div>${range('mix-volume', '混ぜる量', 10, 100, 5, 50, ' mL')}</div>${results([['生成物', '塩化銀', 'precipitate-name'], ['見た目', '白色の沈殿', 'precipitate-color'], ['反応するイオン', 'Ag⁺ + Cl⁻', 'ion-equation']])}</div></div>`;
  const update = () => {
    const key = $('#pair-select').value;
    const [name, color, equation] = pairs[key];
    const amount = +$('#mix-volume').value;
    $('#precipitate-name').textContent = name;
    $('#precipitate-color').textContent = key === 'none' ? color : `${color}の沈殿`;
    $('#ion-equation').textContent = equation;
    $('#precipitate').style.height = key === 'none' ? '0' : `${Math.min(90, amount * 0.8)}px`;
    $('#precipitate').style.background = key === 'copper' ? '#9fd3df' : '#f2f0df';
  };
  $('#pair-select').addEventListener('change', update);
  bindRange('mix-volume', ' mL', update);
  update();
}

function renderElectrolysis() {
  content.innerHTML = `<div class="sim-grid"><div class="sim-card"><h3>電極付近の変化</h3><div class="visual-box electrode-box"><div class="electrode" id="left-electrode"></div><div class="electrode" id="right-electrode"></div></div></div><div><div class="sim-card"><h3>条件</h3><div class="control-row"><label for="electrolyte-select">物質</label><select id="electrolyte-select"><option value="water">水</option><option value="copper">塩化銅水溶液</option></select></div>${range('current-input', '電流', 0.1, 2, 0.1, 1, ' A')}${range('time-input', '時間', 10, 180, 10, 60, ' s')}</div>${results([['陰極', '水素', 'cathode-result'], ['陽極', '酸素', 'anode-result'], ['変化の大きさ', '60.0 単位', 'amount-result']])}</div></div>`;
  const update = () => {
    const copper = $('#electrolyte-select').value === 'copper';
    const amount = +$('#current-input').value * +$('#time-input').value;
    $('#cathode-result').textContent = copper ? '銅が付着' : '水素';
    $('#anode-result').textContent = copper ? '塩素' : '酸素';
    $('#amount-result').textContent = `${amount.toFixed(1)} 単位`;
    const bubbles = Array.from({ length: Math.min(20, Math.round(amount / 6)) }, (_, index) => `<span class="bubble-dot" style="left:${(index % 3) * 10 - 10}px;bottom:${index * 7}px"></span>`).join('');
    $('#left-electrode').innerHTML = copper ? '' : bubbles;
    $('#right-electrode').innerHTML = bubbles;
  };
  $('#electrolyte-select').addEventListener('change', update);
  bindRange('current-input', ' A', update);
  bindRange('time-input', ' s', update);
  update();
}

function renderBattery() {
  const potential = { mg: -2.37, zn: -0.76, fe: -0.44, cu: 0.34 };
  const names = { mg: 'マグネシウム', zn: '亜鉛', fe: '鉄', cu: '銅' };
  const colors = { mg: '#c8ced1', zn: '#aab5ba', fe: '#777f83', cu: '#b87333' };
  content.innerHTML = `<div class="sim-grid"><div class="sim-card"><h3>化学電池</h3><div class="visual-box battery-box"><div id="metal-a-view" class="battery-metal"></div><div id="metal-b-view" class="battery-metal"></div><div class="battery-wire"></div><div id="lamp" class="lamp"></div></div></div><div><div class="sim-card"><h3>条件</h3><div class="control-row"><label for="metal-a">金属A</label><select id="metal-a"><option value="zn">亜鉛</option><option value="mg">マグネシウム</option><option value="fe">鉄</option><option value="cu">銅</option></select></div><div class="control-row"><label for="metal-b">金属B</label><select id="metal-b"><option value="cu">銅</option><option value="fe">鉄</option><option value="zn">亜鉛</option><option value="mg">マグネシウム</option></select></div><div class="control-row"><label for="battery-liquid">液体</label><select id="battery-liquid"><option value="1">電解質水溶液</option><option value="0">純水</option></select></div></div>${results([['電圧の目安', '1.10 V', 'voltage-result'], ['電子を出しやすい金属', '亜鉛', 'negative-result'], ['電流', '流れる', 'current-result']])}</div></div>`;
  const update = () => {
    const a = $('#metal-a').value;
    const b = $('#metal-b').value;
    const electrolyte = +$('#battery-liquid').value;
    const voltage = electrolyte * Math.abs(potential[a] - potential[b]);
    const on = voltage > 0.05;
    $('#voltage-result').textContent = `${voltage.toFixed(2)} V`;
    $('#negative-result').textContent = potential[a] < potential[b] ? names[a] : potential[b] < potential[a] ? names[b] : '同じ金属';
    $('#current-result').textContent = on ? '流れる' : '流れない';
    $('#lamp').classList.toggle('on', on);
    $('#metal-a-view').style.background = colors[a];
    $('#metal-b-view').style.background = colors[b];
  };
  ['metal-a', 'metal-b', 'battery-liquid'].forEach((id) => $(`#${id}`).addEventListener('change', update));
  update();
}

function renderNeutralization() {
  content.innerHTML = `<div class="sim-grid"><div class="sim-card"><h3>混合液のようす</h3><div class="visual-box"><div class="beaker"><div id="neutral-liquid" class="solution-liquid"></div></div></div><div class="ph-scale"><div id="ph-marker" class="ph-marker"></div></div></div><div><div class="sim-card"><h3>条件</h3>${range('acid-volume', '塩酸の体積', 0, 100, 1, 50, ' mL')}${range('acid-concentration', '塩酸の濃度', 0.01, 0.5, 0.01, 0.1, ' mol/L')}${range('base-volume', '水酸化ナトリウムの体積', 0, 100, 1, 50, ' mL')}${range('base-concentration', '水酸化ナトリウムの濃度', 0.01, 0.5, 0.01, 0.1, ' mol/L')}</div>${results([['pH', '7.0', 'ph-result'], ['液性', '中性', 'property-result'], ['残ったイオン', 'なし', 'remaining-result']])}</div></div>`;
  const color = (ph) => {
    if (ph < 6) return '#e9cf48';
    if (ph <= 7.6) return '#40be74';
    return '#3a78d1';
  };
  const update = () => {
    const acidMoles = +$('#acid-volume').value / 1000 * +$('#acid-concentration').value;
    const baseMoles = +$('#base-volume').value / 1000 * +$('#base-concentration').value;
    const totalVolume = Math.max((+$('#acid-volume').value + +$('#base-volume').value) / 1000, 0.001);
    let ph = 7;
    let property = '中性';
    let remaining = 'なし';
    if (acidMoles > baseMoles) {
      ph = -Math.log10((acidMoles - baseMoles) / totalVolume);
      property = '酸性';
      remaining = 'H⁺';
    } else if (baseMoles > acidMoles) {
      const poh = -Math.log10((baseMoles - acidMoles) / totalVolume);
      ph = 14 - poh;
      property = 'アルカリ性';
      remaining = 'OH⁻';
    }
    ph = Math.max(0, Math.min(14, ph));
    $('#ph-result').textContent = ph.toFixed(1);
    $('#property-result').textContent = property;
    $('#remaining-result').textContent = remaining;
    $('#neutral-liquid').style.background = color(ph);
    $('#ph-marker').style.left = `${ph / 14 * 100}%`;
  };
  bindRange('acid-volume', ' mL', update);
  bindRange('acid-concentration', ' mol/L', update);
  bindRange('base-volume', ' mL', update);
  bindRange('base-concentration', ' mol/L', update);
  update();
}

const renderers = {
  density: renderDensity,
  gas: renderGas,
  solubility: renderSolubility,
  particles: renderParticles,
  mass: renderMass,
  oxidation: renderOxidation,
  precipitation: renderPrecipitation,
  electrolysis: renderElectrolysis,
  battery: renderBattery,
  neutralization: renderNeutralization
};

gradeTabs.addEventListener('click', (event) => {
  const button = event.target.closest('[data-grade]');
  if (!button) return;
  currentGrade = +button.dataset.grade;
  const first = topics.find((topic) => topic.grade === currentGrade);
  openTopic(first.id);
});

unitList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-topic]');
  if (button) openTopic(button.dataset.topic);
});

$('#reset-topic').addEventListener('click', () => openTopic(currentTopic, false));
window.addEventListener('hashchange', () => openTopic(location.hash.slice(1), false));

openTopic(location.hash.slice(1) || 'density', false);
