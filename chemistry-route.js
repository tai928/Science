'use strict';

const topicById = new Map(topics.map((topic) => [topic.id, topic]));

function routeFor(topic, gradeOnly = false) {
  return gradeOnly ? `#grade-${topic.grade}` : `#grade-${topic.grade}/${topic.id}`;
}

function topicFromRoute() {
  const route = location.hash.slice(1);
  const gradeMatch = route.match(/^grade-([1-3])(?:\/([a-z-]+))?$/);

  if (gradeMatch) {
    const grade = Number(gradeMatch[1]);
    const requestedTopic = gradeMatch[2];
    const matched = requestedTopic && topicById.get(requestedTopic);
    if (matched && matched.grade === grade) return matched;
    return topics.find((topic) => topic.grade === grade);
  }

  return topicById.get(route) || topics[0];
}

function syncTextbookHeading(topic) {
  const label = document.querySelector('#textbook-topic-name');
  if (label) label.textContent = `中学${topic.grade}年｜${topic.name}`;
}

function applyRoute(replace = true) {
  const topic = topicFromRoute();
  openTopic(topic.id, false);
  syncTextbookHeading(topic);
  const canonical = routeFor(topic, /^#grade-[1-3]$/.test(location.hash));
  if (location.hash !== canonical) {
    history[replace ? 'replaceState' : 'pushState'](null, '', canonical);
  }
}

gradeTabs.addEventListener('click', (event) => {
  const button = event.target.closest('[data-grade]');
  if (!button) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const topic = topics.find((item) => item.grade === Number(button.dataset.grade));
  openTopic(topic.id, false);
  syncTextbookHeading(topic);
  history.pushState(null, '', routeFor(topic, true));
}, true);

unitList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-topic]');
  if (!button) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const topic = topicById.get(button.dataset.topic);
  openTopic(topic.id, false);
  syncTextbookHeading(topic);
  history.pushState(null, '', routeFor(topic));
}, true);

window.addEventListener('popstate', () => applyRoute(true));
window.addEventListener('hashchange', () => applyRoute(true));

applyRoute(true);
