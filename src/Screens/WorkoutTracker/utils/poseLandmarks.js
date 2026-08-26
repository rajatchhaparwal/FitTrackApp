
/** Maps backend/schema landmark names to MediaPipe indices (0–32) */
export const LANDMARK_NAME_TO_INDEX = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
};

export function getLandmark(landmarks, name) {
  const index = LANDMARK_NAME_TO_INDEX[name];
  if (index == null || !landmarks?.[index]) return null;
  const point = landmarks[index];
  // Require visibility > 0.5 for production-quality tracking
  if ((point.visibility ?? 1) < 0.5) return null;
  return point;
}

export function calculateAngle(pointA, vertex, pointB) {
  if (!pointA || !vertex || !pointB) return null;

  const ax = pointA.x - vertex.x;
  const ay = pointA.y - vertex.y;
  const bx = pointB.x - vertex.x;
  const by = pointB.y - vertex.y;

  const dot = ax * bx + ay * by;
  const magA = Math.sqrt(ax * ax + ay * ay);
  const magB = Math.sqrt(bx * bx + by * by);
  if (magA === 0 || magB === 0) return null;

  const cosAngle = Math.max(-1, Math.min(1, dot / (magA * magB)));
  return (Math.acos(cosAngle) * 180) / Math.PI;
}

export function calculateLateralDeviation(elbow, shoulder, hip) {
  if (!elbow || !shoulder || !hip) return null;
  const dx = hip.x - shoulder.x;
  const dy = hip.y - shoulder.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) return null;

  const cross = Math.abs(dx * (shoulder.y - elbow.y) - dy * (shoulder.x - elbow.x));
  return (cross / length) * 100;
}

export function getPrimaryAngle(landmarks, targetAnglePoints) {
  if (!targetAnglePoints) return null;
  const { vertex, point_a: pointA, point_b: pointB } = targetAnglePoints;
  return calculateAngle(
    getLandmark(landmarks, pointA),
    getLandmark(landmarks, vertex),
    getLandmark(landmarks, pointB),
  );
}
