import { KnownPoseLandmarks } from 'react-native-mediapipe';

/** Maps backend/schema landmark names to MediaPipe indices */
export const LANDMARK_NAME_TO_INDEX = {
  NOSE: KnownPoseLandmarks.nose,
  LEFT_EYE_INNER: KnownPoseLandmarks.leftEyeInner,
  LEFT_EYE: KnownPoseLandmarks.leftEye,
  LEFT_EYE_OUTER: KnownPoseLandmarks.leftEyeOuter,
  RIGHT_EYE_INNER: KnownPoseLandmarks.rightEyeInner,
  RIGHT_EYE: KnownPoseLandmarks.rightEye,
  RIGHT_EYE_OUTER: KnownPoseLandmarks.rightEyeOuter,
  LEFT_EAR: KnownPoseLandmarks.leftEar,
  RIGHT_EAR: KnownPoseLandmarks.rightEar,
  MOUTH_LEFT: KnownPoseLandmarks.mouthLeft,
  MOUTH_RIGHT: KnownPoseLandmarks.mouthRight,
  LEFT_SHOULDER: KnownPoseLandmarks.leftShoulder,
  RIGHT_SHOULDER: KnownPoseLandmarks.rightShoulder,
  LEFT_ELBOW: KnownPoseLandmarks.leftElbow,
  RIGHT_ELBOW: KnownPoseLandmarks.rightElbow,
  LEFT_WRIST: KnownPoseLandmarks.leftWrist,
  RIGHT_WRIST: KnownPoseLandmarks.rightWrist,
  LEFT_PINKY: KnownPoseLandmarks.leftPinky,
  RIGHT_PINKY: KnownPoseLandmarks.rightPinky,
  LEFT_INDEX: KnownPoseLandmarks.leftIndex,
  RIGHT_INDEX: KnownPoseLandmarks.rightIndex,
  LEFT_THUMB: KnownPoseLandmarks.leftThumb,
  RIGHT_THUMB: KnownPoseLandmarks.rightThumb,
  LEFT_HIP: KnownPoseLandmarks.leftHip,
  RIGHT_HIP: KnownPoseLandmarks.rightHip,
  LEFT_KNEE: KnownPoseLandmarks.leftKnee,
  RIGHT_KNEE: KnownPoseLandmarks.rightKnee,
  LEFT_ANKLE: KnownPoseLandmarks.leftAnkle,
  RIGHT_ANKLE: KnownPoseLandmarks.rightAnkle,
  LEFT_HEEL: KnownPoseLandmarks.leftHeel,
  RIGHT_HEEL: KnownPoseLandmarks.rightHeel,
  LEFT_FOOT_INDEX: KnownPoseLandmarks.leftFootIndex,
  RIGHT_FOOT_INDEX: KnownPoseLandmarks.rightFootIndex,
};

export function getLandmark(landmarks, name) {
  const index = LANDMARK_NAME_TO_INDEX[name];
  if (index == null || !landmarks?.[index]) return null;
  const point = landmarks[index];
  if ((point.visibility ?? 1) < 0.35 && (point.presence ?? 1) < 0.35) return null;
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
