/**
 * Local pose tracking configs for exercises in the workout UI.
 * Matches backend PoseConfig schema; used when API config is unavailable.
 */
export const EXERCISE_POSE_CONFIGS = {
  'Abdominal Crunches': {
    exercise_id: 'EX_CRUNCH',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: {
        vertex: 'RIGHT_HIP',
        point_a: 'RIGHT_SHOULDER',
        point_b: 'RIGHT_KNEE',
      },
      thresholds: {
        state_rest_angle: 155,
        state_peak_angle: 95,
        rep_complete_tolerance: 12,
      },
      live_corrections: [
        {
          trigger_flag: 'HIP_SAG',
          ui_banner: 'Keep your lower back pressed to the floor',
        },
      ],
    },
  },
  Plank: {
    exercise_id: 'EX_PLANK',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'static_hold_alignment',
      target_angle_points: {
        vertex: 'LEFT_HIP',
        point_a: 'LEFT_SHOULDER',
        point_b: 'LEFT_ANKLE',
      },
      thresholds: {
        perfect_score_angle: 175,
        max_allowable_deviation: 15,
        min_hold_stability_seconds: 10,
      },
      live_corrections: [
        {
          trigger_flag: 'HIP_SAG',
          ui_banner: '⚠ Hips sagging — tighten your core',
        },
      ],
    },
  },
  'Leg Raises': {
    exercise_id: 'EX_LEG_RAISE',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: {
        vertex: 'RIGHT_HIP',
        point_a: 'RIGHT_SHOULDER',
        point_b: 'RIGHT_ANKLE',
      },
      thresholds: {
        state_rest_angle: 160,
        state_peak_angle: 100,
        rep_complete_tolerance: 15,
      },
      live_corrections: [],
    },
  },
  'Russian Twist': {
    exercise_id: 'EX_RUSSIAN_TWIST',
    is_supported: false,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      thresholds: {},
      live_corrections: [],
    },
  },
  'Dumbbell Bicep Curl': {
    exercise_id: 'EX015',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: {
        vertex: 'RIGHT_ELBOW',
        point_a: 'RIGHT_SHOULDER',
        point_b: 'RIGHT_WRIST',
      },
      thresholds: {
        state_rest_angle: 165,
        state_peak_angle: 50,
        rep_complete_tolerance: 15,
      },
      live_corrections: [
        {
          trigger_flag: 'LEAN_BACK',
          ui_banner: '⚠ Leaning Back — Sit Upright',
        },
        {
          trigger_flag: 'ELBOW_WIDE',
          ui_banner: '⚠ Keep elbows close to your sides',
        },
      ],
    },
  },
  Squats: {
    exercise_id: 'EX_SQUAT',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: {
        vertex: 'RIGHT_KNEE',
        point_a: 'RIGHT_HIP',
        point_b: 'RIGHT_ANKLE',
      },
      thresholds: {
        state_rest_angle: 165,
        state_peak_angle: 90,
        rep_complete_tolerance: 15,
      },
      live_corrections: [
        {
          trigger_flag: 'KNEE_CAVE',
          ui_banner: '⚠ Push knees out — avoid caving inward',
        },
      ],
    },
  },
  'Mountain Climbers': {
    exercise_id: 'EX_MOUNTAIN',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: {
        vertex: 'RIGHT_KNEE',
        point_a: 'RIGHT_HIP',
        point_b: 'RIGHT_ANKLE',
      },
      thresholds: {
        state_rest_angle: 150,
        state_peak_angle: 70,
        rep_complete_tolerance: 20,
      },
      live_corrections: [
        {
          trigger_flag: 'HIP_SAG',
          ui_banner: 'Keep hips level — don\'t bounce',
        },
      ],
    },
  },
};

export const EXERCISE_DETAILS = {
  'Abdominal Crunches': {
    exerciseId: 'EX_CRUNCH',
    muscleGroup: 'abs',
    workoutType: 'strength',
    instructions: [
      'Lie on your back with knees bent and feet flat.',
      'Place hands behind your head, elbows wide.',
      'Exhale and lift your shoulders off the floor.',
      'Lower slowly with control.',
    ],
    tips: 'Focus on curling your rib cage toward your pelvis — not pulling with your neck.',
    targetReps: 16,
    targetSets: 3,
    supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=Xyd_fa5zoEU',
  },
  Plank: {
    exerciseId: 'EX_PLANK',
    muscleGroup: 'abs',
    workoutType: 'strength',
    instructions: [
      'Start in a forearm plank, elbows under shoulders.',
      'Keep body in a straight line from head to heels.',
      'Engage core and glutes throughout the hold.',
    ],
    tips: 'Don\'t let hips sag or pike up — maintain neutral spine.',
    targetDurationSec: 30,
    targetSets: 3,
    supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
  },
  'Leg Raises': {
    exerciseId: 'EX_LEG_RAISE',
    muscleGroup: 'abs',
    workoutType: 'strength',
    instructions: [
      'Lie flat with legs extended.',
      'Keep lower back pressed to the floor.',
      'Raise legs to 90° then lower with control.',
    ],
    tips: 'Bend knees slightly if your lower back lifts off the floor.',
    targetReps: 15,
    targetSets: 3,
    supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=l4kQd9eWclE',
  },
  'Russian Twist': {
    exerciseId: 'EX_RUSSIAN_TWIST',
    muscleGroup: 'abs',
    workoutType: 'strength',
    instructions: [
      'Sit with knees bent, lean back slightly.',
      'Rotate torso side to side while keeping core tight.',
    ],
    tips: 'Move from your obliques, not just your arms.',
    targetReps: 20,
    targetSets: 3,
    supportsPoseTracking: false,
    youtubeUrl: 'https://www.youtube.com/watch?v=wkD8rjkodUI',
  },
  'Jumping Jacks': {
    exerciseId: 'EX_JJ',
    muscleGroup: 'cardio',
    workoutType: 'cardio',
    instructions: [
      'Stand with feet together, arms at sides.',
      'Jump while spreading legs and raising arms overhead.',
      'Return to start and repeat rhythmically.',
    ],
    tips: 'Land softly on the balls of your feet.',
    targetDurationSec: 20,
    supportsPoseTracking: false,
    youtubeUrl: 'https://www.youtube.com/watch?v=2W4ZNSwoW_4',
  },
  Squats: {
    exerciseId: 'EX_SQUAT',
    muscleGroup: 'legs',
    workoutType: 'strength',
    instructions: [
      'Stand with feet shoulder-width apart.',
      'Lower hips back and down until thighs are parallel.',
      'Drive through heels to stand back up.',
    ],
    tips: 'Keep chest up and knees tracking over toes.',
    targetReps: 12,
    targetSets: 3,
    supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=U3HlEF_E9fo',
  },
};

export function getExerciseDetail(name) {
  return EXERCISE_DETAILS[name] ?? {
    exerciseId: `EX_${name.replace(/\s+/g, '_').toUpperCase()}`,
    muscleGroup: 'general',
    workoutType: 'strength',
    instructions: ['Perform the exercise with controlled form.'],
    tips: 'Maintain steady breathing throughout.',
    targetReps: 12,
    targetSets: 3,
    supportsPoseTracking: Boolean(EXERCISE_POSE_CONFIGS[name]?.is_supported),
  };
}

export function getPoseConfigForExercise(name) {
  return EXERCISE_POSE_CONFIGS[name] ?? null;
}

export function parseTargetFromMetric(metric) {
  if (!metric) return { targetReps: 12, targetDurationSec: null };
  if (metric.startsWith('x')) {
    return { targetReps: parseInt(metric.slice(1), 10) || 12, targetDurationSec: null };
  }
  if (metric.includes(':')) {
    const [mins, secs] = metric.replace('00:', '').split(':').map(Number);
    return { targetReps: null, targetDurationSec: (mins || 0) * 60 + (secs || 0) };
  }
  return { targetReps: 12, targetDurationSec: null };
}
