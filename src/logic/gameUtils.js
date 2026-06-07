// Utility functions for TorahPoly

export function buildBoardPositions(refSize = 1200, margin = 100, spacesPerSide = 11) {
  const positions = [];
  const step = (refSize - 2 * margin) / (spacesPerSide - 1);

  const topY = margin;
  for (let i = 0; i < spacesPerSide; i++) positions.push({ x: Math.round(margin + i * step), y: topY });
  const rightX = refSize - margin;
  for (let i = 1; i < spacesPerSide; i++) positions.push({ x: rightX, y: Math.round(topY + i * step) });
  const bottomY = refSize - margin;
  for (let i = 1; i < spacesPerSide; i++) positions.push({ x: Math.round(rightX - i * step), y: bottomY });
  const leftX = margin;
  for (let i = 1; i < spacesPerSide - 1; i++) positions.push({ x: leftX, y: Math.round(bottomY - i * step) });

  return positions.slice(0, 44);
}

export function calculateRent(card) {
  if (card.hotel) return card.rent.hotel;
  switch (card.houses) {
    case 3: return card.rent.house3;
    case 2: return card.rent.house2;
    case 1: return card.rent.house1;
    default: return card.rent.base;
  }
}
