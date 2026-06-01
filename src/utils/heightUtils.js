export function ftInToCm(feet, inches) {
  const ft = Number(feet) || 0;
  const inch = Number(inches) || 0;
  const totalInches = ft * 12 + inch;
  return Math.round(totalInches * 2.54 * 10) / 10;
}

export function getHeightInCm({ heightUnit, height, heightFt, heightIn }) {
  if (heightUnit === 'ft-in') {
    return ftInToCm(heightFt, heightIn);
  }
  return Number(height);
}
