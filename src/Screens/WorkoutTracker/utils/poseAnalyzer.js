import {
  calculateAngle,
  calculateLateralDeviation,
  getLandmark,
  getPrimaryAngle,
} from './poseLandmarks';

const REP_STATE = {
  REST: 'rest',
  CONTRACTING: 'contracting',
  PEAK: 'peak',
};

export function createRepCounter(thresholds = {}) {
  const {
    state_rest_angle = 160,
    state_peak_angle = 90,
    rep_complete_tolerance = 15,
  } = thresholds;

  let state = REP_STATE.REST;
  let repCount = 0;

  return {
    get count() {
      return repCount;
    },
    get state() {
      return state;
    },
    reset() {
      state = REP_STATE.REST;
      repCount = 0;
    },
    update(angle) {
      if (angle == null) return { repCount, state, repCompleted: false };

      let repCompleted = false;

      if (state === REP_STATE.REST && angle <= state_peak_angle + rep_complete_tolerance) {
        state = REP_STATE.CONTRACTING;
      } else if (state === REP_STATE.CONTRACTING && angle <= state_peak_angle) {
        state = REP_STATE.PEAK;
      } else if (state === REP_STATE.PEAK && angle >= state_rest_angle - rep_complete_tolerance) {
        state = REP_STATE.REST;
        repCount += 1;
        repCompleted = true;
      }

      return { repCount, state, repCompleted };
    },
  };
}

export function evaluateStaticHold(landmarks, thresholds = {}) {
  const {
    perfect_score_angle = 175,
    max_allowable_deviation = 15,
  } = thresholds;

  const shoulder = getLandmark(landmarks, 'LEFT_SHOULDER') || getLandmark(landmarks, 'RIGHT_SHOULDER');
  const hip = getLandmark(landmarks, 'LEFT_HIP') || getLandmark(landmarks, 'RIGHT_HIP');
  const ankle = getLandmark(landmarks, 'LEFT_ANKLE') || getLandmark(landmarks, 'RIGHT_ANKLE');

  const alignmentAngle = calculateAngle(shoulder, hip, ankle);
  if (alignmentAngle == null) return { formScore: 0, isAligned: false };

  const deviation = Math.abs(alignmentAngle - perfect_score_angle);
  const formScore = Math.max(0, Math.round(100 - (deviation / max_allowable_deviation) * 100));
  return {
    formScore,
    isAligned: deviation <= max_allowable_deviation,
    alignmentAngle,
  };
}

export function evaluateLiveCorrections(landmarks, corrections = []) {
  const active = [];

  for (const correction of corrections) {
    const flag = correction.trigger_flag;
    let triggered = false;

    if (flag === 'LEAN_BACK') {
      const shoulder = getLandmark(landmarks, 'RIGHT_SHOULDER') || getLandmark(landmarks, 'LEFT_SHOULDER');
      const hip = getLandmark(landmarks, 'RIGHT_HIP') || getLandmark(landmarks, 'LEFT_HIP');
      const knee = getLandmark(landmarks, 'RIGHT_KNEE') || getLandmark(landmarks, 'LEFT_KNEE');
      const torsoAngle = calculateAngle(shoulder, hip, knee);
      triggered = torsoAngle != null && torsoAngle < 160;
    } else if (flag === 'ELBOW_WIDE') {
      const shoulder = getLandmark(landmarks, 'RIGHT_SHOULDER') || getLandmark(landmarks, 'LEFT_SHOULDER');
      const elbow = getLandmark(landmarks, 'RIGHT_ELBOW') || getLandmark(landmarks, 'LEFT_ELBOW');
      const hip = getLandmark(landmarks, 'RIGHT_HIP') || getLandmark(landmarks, 'LEFT_HIP');
      const deviation = calculateLateralDeviation(elbow, shoulder, hip);
      triggered = deviation != null && deviation > 40;
    } else if (flag === 'HIP_SAG') {
      const shoulder = getLandmark(landmarks, 'LEFT_SHOULDER') || getLandmark(landmarks, 'RIGHT_SHOULDER');
      const hip = getLandmark(landmarks, 'LEFT_HIP') || getLandmark(landmarks, 'RIGHT_HIP');
      const ankle = getLandmark(landmarks, 'LEFT_ANKLE') || getLandmark(landmarks, 'RIGHT_ANKLE');
      const alignmentAngle = calculateAngle(shoulder, hip, ankle);
      triggered = alignmentAngle != null && alignmentAngle < 160;
    } else if (flag === 'KNEE_CAVE') {
      const hip = getLandmark(landmarks, 'RIGHT_HIP') || getLandmark(landmarks, 'LEFT_HIP');
      const knee = getLandmark(landmarks, 'RIGHT_KNEE') || getLandmark(landmarks, 'LEFT_KNEE');
      const ankle = getLandmark(landmarks, 'RIGHT_ANKLE') || getLandmark(landmarks, 'LEFT_ANKLE');
      const kneeAngle = calculateAngle(hip, knee, ankle);
      triggered = kneeAngle != null && kneeAngle < 70;
    }

    if (triggered) active.push(correction);
  }

  return active;
}

export function analyzePoseFrame(landmarks, poseConfig, repCounter) {
  if (!landmarks?.length || !poseConfig) {
    return {
      repCount: repCounter?.count ?? 0,
      formScore: 0,
      currentAngle: null,
      activeCorrections: [],
      evaluationType: poseConfig?.metrics_calculation?.evaluation_type,
    };
  }

  const metrics = poseConfig.metrics_calculation ?? {};
  const thresholds = metrics.thresholds ?? {};
  const evaluationType = metrics.evaluation_type;
  const activeCorrections = evaluateLiveCorrections(landmarks, metrics.live_corrections ?? []);

  let repCount = repCounter?.count ?? 0;
  let formScore = 100;
  let currentAngle = getPrimaryAngle(landmarks, metrics.target_angle_points);

  if (evaluationType === 'dynamic_rep_counter' && repCounter) {
    const result = repCounter.update(currentAngle);
    repCount = result.repCount;
    formScore = Math.max(0, 100 - activeCorrections.length * 20);
  } else if (evaluationType === 'static_hold_alignment') {
    const hold = evaluateStaticHold(landmarks, thresholds);
    formScore = hold.formScore;
    currentAngle = hold.alignmentAngle;
  }

  return {
    repCount,
    formScore,
    currentAngle,
    activeCorrections,
    evaluationType,
    formIssues: activeCorrections.map((c) => c.trigger_flag),
  };
}

export function mapApiPoseConfig(apiData) {
  if (!apiData) return null;
  return {
    exercise_id: apiData.exercise_id,
    is_supported: apiData.is_supported,
    metrics_calculation: apiData.metrics_calculation,
  };
}
