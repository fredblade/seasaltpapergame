// Shared Card Rendering Helpers
// Used by both client.js (in-game) and cards.html (/cards reference page)

function getCollectorLadder(cardName) {
  const ladders = {
    Shell: ['2', '4', '6', '8', '10'],
    Octopus: ['3', '6', '9', '12'],
    Penguin: ['1', '3', '5'],
    Sailor: ['5']
  };
  return ladders[cardName] || [];
}

function getSpecialEffectBadge(card) {
  const effects = {
    Mermaid: '🧜 4 = WIN',
    Lighthouse: '🏠💡 needs ⛵',
    'Shoal of Fish': '🐠 needs 🐟',
    'Penguin Colony': '🐧 needs 🐧',
    Captain: '👨‍✈️ needs 🧭'
  };
  return effects[card.name] || '';
}

function getCompactCardHint(card) {
  if (card.type === 'collector') return 'Collection';
  if (card.type === 'special' || card.type === 'multiplier') return getSpecialEffectBadge(card) || 'Special';
  if (card.name === 'Crab') return 'Take from discard';
  if (card.name === 'Boat') return 'Extra turn';
  if (card.name === 'Fish') return 'Draw 1';
  if (card.name === 'Shark' || card.name === 'Swimmer') return 'Pair to steal';
  return card.type;
}

function renderCardInnerMarkup(card) {
  const isCollector = card.type === 'collector';
  const collectorLadder = getCollectorLadder(card.name);
  const specialBadge = getSpecialEffectBadge(card);
  const hint = getCompactCardHint(card);
  const topIcon = card.emoji || '●';

  return `
    <div class="card-top-row">
      <div class="card-icon-box">${topIcon}</div>
      ${isCollector ? `<div class="card-score-ladder">${collectorLadder.map(v => `<span>${v}</span>`).join('')}</div>` : `<div class="card-score-ladder small"><span>1</span></div>`}
    </div>
    <div class="card-main">
      <div class="card-emoji">${card.emoji}</div>
    </div>
    <div class="card-name-strip">${card.name}</div>
    <div class="card-footer-info">
      <span class="card-effect-badge">${specialBadge || hint}</span>
    </div>
  `;
}

function renderCardMarkup(card) {
  return `
    <div class="card-item" data-color="${card.color}">
      ${renderCardInnerMarkup(card)}
    </div>
  `;
}
