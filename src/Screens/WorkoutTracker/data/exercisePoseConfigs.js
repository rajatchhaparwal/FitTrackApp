/**
 * Pose tracking configs for ALL exercises in EXERCISE_DATABASE.
 * Matches backend PoseConfig schema; used when API config is unavailable.
 *
 * evaluation_type:
 *   'dynamic_rep_counter'   – counts reps via angle threshold crossing
 *   'static_hold_alignment' – scores form during a held position
 *
 * target_angle_points: { vertex, point_a, point_b }
 *   Angle at vertex between rays to point_a and point_b (0–180°)
 *
 * thresholds (dynamic):
 *   state_rest_angle      – joint angle in the START position
 *   state_peak_angle      – joint angle at PEAK contraction
 *   rep_complete_tolerance – ±degrees forgiveness on thresholds
 *
 * thresholds (static):
 *   perfect_score_angle     – ideal alignment angle
 *   max_allowable_deviation – degrees before score hits 0
 */
export const EXERCISE_POSE_CONFIGS = {

  // ── ABS ──────────────────────────────────────────────────────────────────────

  'Abdominal Crunches': {
    exercise_id: 'EX_CRUNCH',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_HIP', point_a: 'RIGHT_SHOULDER', point_b: 'RIGHT_KNEE' },
      thresholds: { state_rest_angle: 155, state_peak_angle: 95, rep_complete_tolerance: 12 },
      live_corrections: [{ trigger_flag: 'HIP_SAG', ui_banner: '⚠ Keep your lower back pressed to the floor' }],
    },
  },

  Crunches: {
    exercise_id: 'EX_CRUNCH',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_HIP', point_a: 'RIGHT_SHOULDER', point_b: 'RIGHT_KNEE' },
      thresholds: { state_rest_angle: 155, state_peak_angle: 95, rep_complete_tolerance: 12 },
      live_corrections: [{ trigger_flag: 'HIP_SAG', ui_banner: '⚠ Keep your lower back pressed to the floor' }],
    },
  },

  'Bicycle Crunches': {
    exercise_id: 'EX_BICYCLE',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_KNEE', point_a: 'RIGHT_HIP', point_b: 'RIGHT_ANKLE' },
      thresholds: { state_rest_angle: 160, state_peak_angle: 70, rep_complete_tolerance: 15 },
      live_corrections: [{ trigger_flag: 'LEAN_BACK', ui_banner: '⚠ Rotate fully — elbow to opposite knee' }],
    },
  },

  'Sit-Ups': {
    exercise_id: 'EX_SITUP',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_HIP', point_a: 'RIGHT_SHOULDER', point_b: 'RIGHT_KNEE' },
      thresholds: { state_rest_angle: 165, state_peak_angle: 75, rep_complete_tolerance: 12 },
      live_corrections: [{ trigger_flag: 'LEAN_BACK', ui_banner: '⚠ Engage your core — do not pull your neck' }],
    },
  },

  'Leg Raises': {
    exercise_id: 'EX_LEG_RAISE',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_HIP', point_a: 'RIGHT_SHOULDER', point_b: 'RIGHT_ANKLE' },
      thresholds: { state_rest_angle: 165, state_peak_angle: 90, rep_complete_tolerance: 15 },
      live_corrections: [],
    },
  },

  'Russian Twists': {
    exercise_id: 'EX_RUSSIAN_TWIST',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_SHOULDER', point_a: 'RIGHT_HIP', point_b: 'RIGHT_ELBOW' },
      thresholds: { state_rest_angle: 90, state_peak_angle: 30, rep_complete_tolerance: 18 },
      live_corrections: [{ trigger_flag: 'LEAN_BACK', ui_banner: '⚠ Lean back slightly — keep core tight' }],
    },
  },

  'Russian Twist': {
    exercise_id: 'EX_RUSSIAN_TWIST',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_SHOULDER', point_a: 'RIGHT_HIP', point_b: 'RIGHT_ELBOW' },
      thresholds: { state_rest_angle: 90, state_peak_angle: 30, rep_complete_tolerance: 18 },
      live_corrections: [{ trigger_flag: 'LEAN_BACK', ui_banner: '⚠ Lean back slightly — keep core tight' }],
    },
  },

  'Mountain Climbers': {
    exercise_id: 'EX_MOUNTAIN',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_KNEE', point_a: 'RIGHT_HIP', point_b: 'RIGHT_ANKLE' },
      thresholds: { state_rest_angle: 155, state_peak_angle: 65, rep_complete_tolerance: 18 },
      live_corrections: [{ trigger_flag: 'HIP_SAG', ui_banner: '⚠ Keep hips level — do not bounce' }],
    },
  },

  Plank: {
    exercise_id: 'EX_PLANK',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'static_hold_alignment',
      target_angle_points: { vertex: 'LEFT_HIP', point_a: 'LEFT_SHOULDER', point_b: 'LEFT_ANKLE' },
      thresholds: { perfect_score_angle: 175, max_allowable_deviation: 15 },
      live_corrections: [{ trigger_flag: 'HIP_SAG', ui_banner: '⚠ Hips sagging — tighten your core' }],
    },
  },

  // ── ARMS ─────────────────────────────────────────────────────────────────────

  'Push-ups': {
    exercise_id: 'EX_PUSHUP',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_ELBOW', point_a: 'RIGHT_SHOULDER', point_b: 'RIGHT_WRIST' },
      thresholds: { state_rest_angle: 165, state_peak_angle: 70, rep_complete_tolerance: 15 },
      live_corrections: [
        { trigger_flag: 'HIP_SAG', ui_banner: '⚠ Keep your body in a straight line' },
      ],
    },
  },

  'Push Ups': {
    exercise_id: 'EX_PUSHUP',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_ELBOW', point_a: 'RIGHT_SHOULDER', point_b: 'RIGHT_WRIST' },
      thresholds: { state_rest_angle: 165, state_peak_angle: 70, rep_complete_tolerance: 15 },
      live_corrections: [{ trigger_flag: 'HIP_SAG', ui_banner: '⚠ Keep your body in a straight line' }],
    },
  },

  'Diamond Push-ups': {
    exercise_id: 'EX_DIAMOND_PUSHUP',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_ELBOW', point_a: 'RIGHT_SHOULDER', point_b: 'RIGHT_WRIST' },
      thresholds: { state_rest_angle: 165, state_peak_angle: 65, rep_complete_tolerance: 15 },
      live_corrections: [
        { trigger_flag: 'ELBOW_WIDE', ui_banner: '⚠ Keep elbows pointed back — diamond hand position' },
      ],
    },
  },

  'Wide Push-ups': {
    exercise_id: 'EX_WIDE_PUSHUP',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_ELBOW', point_a: 'RIGHT_SHOULDER', point_b: 'RIGHT_WRIST' },
      thresholds: { state_rest_angle: 165, state_peak_angle: 75, rep_complete_tolerance: 15 },
      live_corrections: [{ trigger_flag: 'HIP_SAG', ui_banner: '⚠ Keep your body straight — do not sag' }],
    },
  },

  'Tricep Dips': {
    exercise_id: 'EX_TRICEP_DIP',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_ELBOW', point_a: 'RIGHT_SHOULDER', point_b: 'RIGHT_WRIST' },
      thresholds: { state_rest_angle: 165, state_peak_angle: 75, rep_complete_tolerance: 15 },
      live_corrections: [{ trigger_flag: 'LEAN_BACK', ui_banner: '⚠ Keep your back close to the bench' }],
    },
  },

  'Bicep Curls': {
    exercise_id: 'EX015',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_ELBOW', point_a: 'RIGHT_SHOULDER', point_b: 'RIGHT_WRIST' },
      thresholds: { state_rest_angle: 165, state_peak_angle: 50, rep_complete_tolerance: 15 },
      live_corrections: [
        { trigger_flag: 'LEAN_BACK', ui_banner: '⚠ Leaning back — stay upright' },
        { trigger_flag: 'ELBOW_WIDE', ui_banner: '⚠ Keep elbows close to your sides' },
      ],
    },
  },

  'Dumbbell Bicep Curl': {
    exercise_id: 'EX015',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_ELBOW', point_a: 'RIGHT_SHOULDER', point_b: 'RIGHT_WRIST' },
      thresholds: { state_rest_angle: 165, state_peak_angle: 50, rep_complete_tolerance: 15 },
      live_corrections: [
        { trigger_flag: 'LEAN_BACK', ui_banner: '⚠ Leaning Back — Sit Upright' },
        { trigger_flag: 'ELBOW_WIDE', ui_banner: '⚠ Keep elbows close to your sides' },
      ],
    },
  },

  'Hammer Curls': {
    exercise_id: 'EX_HAMMER_CURL',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_ELBOW', point_a: 'RIGHT_SHOULDER', point_b: 'RIGHT_WRIST' },
      thresholds: { state_rest_angle: 165, state_peak_angle: 55, rep_complete_tolerance: 15 },
      live_corrections: [
        { trigger_flag: 'ELBOW_WIDE', ui_banner: '⚠ Keep elbows pinned to your sides' },
      ],
    },
  },

  // ── CHEST ────────────────────────────────────────────────────────────────────

  'Chest Press': {
    exercise_id: 'EX_CHEST_PRESS',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_ELBOW', point_a: 'RIGHT_SHOULDER', point_b: 'RIGHT_WRIST' },
      thresholds: { state_rest_angle: 80, state_peak_angle: 160, rep_complete_tolerance: 15 },
      live_corrections: [
        { trigger_flag: 'ELBOW_WIDE', ui_banner: '⚠ Keep elbows at 45° — do not flare wide' },
      ],
    },
  },

  'Chest Flyes': {
    exercise_id: 'EX_CHEST_FLY',
    is_supported: false,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      thresholds: {},
      live_corrections: [],
    },
  },

  // ── LEGS ─────────────────────────────────────────────────────────────────────

  Squats: {
    exercise_id: 'EX_SQUAT',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_KNEE', point_a: 'RIGHT_HIP', point_b: 'RIGHT_ANKLE' },
      thresholds: { state_rest_angle: 165, state_peak_angle: 90, rep_complete_tolerance: 15 },
      live_corrections: [
        { trigger_flag: 'KNEE_CAVE', ui_banner: '⚠ Push knees out — avoid caving inward' },
      ],
    },
  },

  'Bodyweight Squats': {
    exercise_id: 'EX_SQUAT',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_KNEE', point_a: 'RIGHT_HIP', point_b: 'RIGHT_ANKLE' },
      thresholds: { state_rest_angle: 165, state_peak_angle: 90, rep_complete_tolerance: 15 },
      live_corrections: [{ trigger_flag: 'KNEE_CAVE', ui_banner: '⚠ Push knees out — avoid caving inward' }],
    },
  },

  'Jump Squats': {
    exercise_id: 'EX_JUMP_SQUAT',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_KNEE', point_a: 'RIGHT_HIP', point_b: 'RIGHT_ANKLE' },
      thresholds: { state_rest_angle: 165, state_peak_angle: 85, rep_complete_tolerance: 20 },
      live_corrections: [{ trigger_flag: 'KNEE_CAVE', ui_banner: '⚠ Land softly — knees over toes' }],
    },
  },

  Lunges: {
    exercise_id: 'EX_LUNGE',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_KNEE', point_a: 'RIGHT_HIP', point_b: 'RIGHT_ANKLE' },
      thresholds: { state_rest_angle: 165, state_peak_angle: 85, rep_complete_tolerance: 15 },
      live_corrections: [
        { trigger_flag: 'LEAN_BACK', ui_banner: '⚠ Stay upright — do not lean forward' },
        { trigger_flag: 'KNEE_CAVE', ui_banner: '⚠ Front knee should track over your toes' },
      ],
    },
  },

  'Reverse Lunges': {
    exercise_id: 'EX_REVERSE_LUNGE',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_KNEE', point_a: 'RIGHT_HIP', point_b: 'RIGHT_ANKLE' },
      thresholds: { state_rest_angle: 165, state_peak_angle: 85, rep_complete_tolerance: 15 },
      live_corrections: [
        { trigger_flag: 'LEAN_BACK', ui_banner: '⚠ Keep your torso upright' },
      ],
    },
  },

  'Side Lunges': {
    exercise_id: 'EX_SIDE_LUNGE',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_KNEE', point_a: 'RIGHT_HIP', point_b: 'RIGHT_ANKLE' },
      thresholds: { state_rest_angle: 165, state_peak_angle: 85, rep_complete_tolerance: 18 },
      live_corrections: [
        { trigger_flag: 'KNEE_CAVE', ui_banner: '⚠ Keep stepping knee over foot' },
      ],
    },
  },

  'Glute Bridges': {
    exercise_id: 'EX_GLUTE_BRIDGE',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_HIP', point_a: 'RIGHT_KNEE', point_b: 'RIGHT_SHOULDER' },
      thresholds: { state_rest_angle: 165, state_peak_angle: 145, rep_complete_tolerance: 12 },
      live_corrections: [
        { trigger_flag: 'HIP_SAG', ui_banner: '⚠ Drive hips higher — squeeze your glutes at top' },
      ],
    },
  },

  'Glute Bridge': {
    exercise_id: 'EX_GLUTE_BRIDGE',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_HIP', point_a: 'RIGHT_KNEE', point_b: 'RIGHT_SHOULDER' },
      thresholds: { state_rest_angle: 165, state_peak_angle: 145, rep_complete_tolerance: 12 },
      live_corrections: [{ trigger_flag: 'HIP_SAG', ui_banner: '⚠ Drive hips higher — squeeze glutes at top' }],
    },
  },

  'Calf Raises': {
    exercise_id: 'EX_CALF_RAISE',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_ANKLE', point_a: 'RIGHT_KNEE', point_b: 'RIGHT_FOOT_INDEX' },
      thresholds: { state_rest_angle: 90, state_peak_angle: 65, rep_complete_tolerance: 12 },
      live_corrections: [],
    },
  },

  // ── SHOULDERS ────────────────────────────────────────────────────────────────

  'Shoulder Press': {
    exercise_id: 'EX_SHOULDER_PRESS',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_ELBOW', point_a: 'RIGHT_SHOULDER', point_b: 'RIGHT_WRIST' },
      thresholds: { state_rest_angle: 80, state_peak_angle: 160, rep_complete_tolerance: 15 },
      live_corrections: [
        { trigger_flag: 'LEAN_BACK', ui_banner: '⚠ Do not arch lower back — brace your core' },
      ],
    },
  },

  'Overhead Dumbbell Press': {
    exercise_id: 'EX_OHP',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_ELBOW', point_a: 'RIGHT_SHOULDER', point_b: 'RIGHT_WRIST' },
      thresholds: { state_rest_angle: 80, state_peak_angle: 160, rep_complete_tolerance: 15 },
      live_corrections: [{ trigger_flag: 'LEAN_BACK', ui_banner: '⚠ Do not arch lower back — brace core' }],
    },
  },

  'Lateral Raises': {
    exercise_id: 'EX_LATERAL_RAISE',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_SHOULDER', point_a: 'RIGHT_HIP', point_b: 'RIGHT_ELBOW' },
      thresholds: { state_rest_angle: 15, state_peak_angle: 80, rep_complete_tolerance: 15 },
      live_corrections: [
        { trigger_flag: 'LEAN_BACK', ui_banner: '⚠ Stay upright — do not swing to lift' },
      ],
    },
  },

  'Front Raises': {
    exercise_id: 'EX_FRONT_RAISE',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_SHOULDER', point_a: 'RIGHT_HIP', point_b: 'RIGHT_ELBOW' },
      thresholds: { state_rest_angle: 15, state_peak_angle: 85, rep_complete_tolerance: 15 },
      live_corrections: [
        { trigger_flag: 'LEAN_BACK', ui_banner: '⚠ Avoid leaning back to compensate' },
      ],
    },
  },

  'Pike Push-ups': {
    exercise_id: 'EX_PIKE_PUSHUP',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_ELBOW', point_a: 'RIGHT_SHOULDER', point_b: 'RIGHT_WRIST' },
      thresholds: { state_rest_angle: 165, state_peak_angle: 70, rep_complete_tolerance: 15 },
      live_corrections: [
        { trigger_flag: 'HIP_SAG', ui_banner: '⚠ Keep hips high — inverted V position' },
      ],
    },
  },

  // ── BACK ─────────────────────────────────────────────────────────────────────

  Superman: {
    exercise_id: 'EX_SUPERMAN',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'static_hold_alignment',
      target_angle_points: { vertex: 'LEFT_HIP', point_a: 'LEFT_SHOULDER', point_b: 'LEFT_ANKLE' },
      thresholds: { perfect_score_angle: 175, max_allowable_deviation: 15 },
      live_corrections: [{ trigger_flag: 'HIP_SAG', ui_banner: '⚠ Lift chest and legs higher off the ground' }],
    },
  },

  'Pull-ups': {
    exercise_id: 'EX_PULLUP',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_ELBOW', point_a: 'RIGHT_SHOULDER', point_b: 'RIGHT_WRIST' },
      thresholds: { state_rest_angle: 165, state_peak_angle: 55, rep_complete_tolerance: 15 },
      live_corrections: [
        { trigger_flag: 'LEAN_BACK', ui_banner: '⚠ Keep your body straight — avoid swinging' },
      ],
    },
  },

  'Bent-over Rows': {
    exercise_id: 'EX_BENT_ROW',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_ELBOW', point_a: 'RIGHT_SHOULDER', point_b: 'RIGHT_WRIST' },
      thresholds: { state_rest_angle: 165, state_peak_angle: 70, rep_complete_tolerance: 15 },
      live_corrections: [
        { trigger_flag: 'LEAN_BACK', ui_banner: '⚠ Keep your back flat — do not round' },
      ],
    },
  },

  // ── CARDIO ───────────────────────────────────────────────────────────────────

  'Jumping Jacks': {
    exercise_id: 'EX_JJ',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_SHOULDER', point_a: 'RIGHT_HIP', point_b: 'RIGHT_ELBOW' },
      thresholds: { state_rest_angle: 20, state_peak_angle: 80, rep_complete_tolerance: 18 },
      live_corrections: [],
    },
  },

  'High Knees': {
    exercise_id: 'EX_HIGH_KNEES',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_HIP', point_a: 'RIGHT_SHOULDER', point_b: 'RIGHT_KNEE' },
      thresholds: { state_rest_angle: 165, state_peak_angle: 85, rep_complete_tolerance: 18 },
      live_corrections: [{ trigger_flag: 'LEAN_BACK', ui_banner: '⚠ Stay upright — drive knees up' }],
    },
  },

  Burpees: {
    exercise_id: 'EX_BURPEE',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'dynamic_rep_counter',
      target_angle_points: { vertex: 'RIGHT_HIP', point_a: 'RIGHT_SHOULDER', point_b: 'RIGHT_KNEE' },
      thresholds: { state_rest_angle: 165, state_peak_angle: 70, rep_complete_tolerance: 20 },
      live_corrections: [
        { trigger_flag: 'HIP_SAG', ui_banner: '⚠ Keep plank position tight during floor phase' },
      ],
    },
  },

  // ── FLEXIBILITY ──────────────────────────────────────────────────────────────

  "Child's Pose": {
    exercise_id: 'EX_CHILDS_POSE',
    is_supported: true,
    metrics_calculation: {
      evaluation_type: 'static_hold_alignment',
      target_angle_points: { vertex: 'LEFT_HIP', point_a: 'LEFT_SHOULDER', point_b: 'LEFT_KNEE' },
      thresholds: { perfect_score_angle: 130, max_allowable_deviation: 25 },
      live_corrections: [],
    },
  },

  'Hip Flexor Stretch': {
    exercise_id: 'EX_HIP_FLEXOR',
    is_supported: false,
    metrics_calculation: { evaluation_type: 'static_hold_alignment', thresholds: {}, live_corrections: [] },
  },

  'Cat-Cow Stretch': {
    exercise_id: 'EX_CAT_COW',
    is_supported: false,
    metrics_calculation: { evaluation_type: 'dynamic_rep_counter', thresholds: {}, live_corrections: [] },
  },
};

// ── Exercise detail metadata (instructions, tips, YouTube, targets) ────────────

export const EXERCISE_DETAILS = {
  'Abdominal Crunches': {
    exerciseId: 'EX_CRUNCH', muscleGroup: 'abs', workoutType: 'strength',
    instructions: ['Lie on your back with knees bent and feet flat.', 'Place hands behind your head, elbows wide.', 'Exhale and lift your shoulders off the floor.', 'Lower slowly with control.'],
    tips: 'Focus on curling your rib cage toward your pelvis — not pulling with your neck.',
    targetReps: 16, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=Xyd_fa5zoEU',
  },
  Crunches: {
    exerciseId: 'EX_CRUNCH', muscleGroup: 'abs', workoutType: 'strength',
    instructions: ['Lie flat on your back, knees bent at 90°.', 'Curl your upper back off the floor using your abs.', 'Do NOT pull on your neck — keep elbows wide.', 'Lower back down slowly.'],
    tips: 'Short range of motion is fine — full sit-ups are not required.',
    targetReps: 16, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=Xyd_fa5zoEU',
  },
  'Bicycle Crunches': {
    exerciseId: 'EX_BICYCLE', muscleGroup: 'abs', workoutType: 'strength',
    instructions: ['Lie flat, hands behind head, knees raised.', 'Bring right elbow to left knee while extending right leg.', 'Switch sides in a pedalling motion.', 'Keep your lower back pressed to the floor.'],
    tips: 'Move slowly and deliberately — speed causes form to break.',
    targetReps: 20, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=1we3bh9uhqY',
  },
  'Sit-Ups': {
    exerciseId: 'EX_SITUP', muscleGroup: 'abs', workoutType: 'strength',
    instructions: ['Lie on your back with knees bent and feet flat.', 'Cross arms over chest or place hands behind head lightly.', 'Engage your core and lift your torso toward your knees.', 'Lower back down with control.'],
    tips: 'Anchor feet under something heavy if needed for balance.',
    targetReps: 15, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=jDwoBqPH0jk',
  },
  'Leg Raises': {
    exerciseId: 'EX_LEG_RAISE', muscleGroup: 'abs', workoutType: 'strength',
    instructions: ['Lie flat with legs extended.', 'Keep lower back pressed to the floor.', 'Raise legs to 90° then lower with control.'],
    tips: 'Bend knees slightly if your lower back lifts off the floor.',
    targetReps: 15, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=l4kQd9eWclE',
  },
  'Russian Twists': {
    exerciseId: 'EX_RUSSIAN_TWIST', muscleGroup: 'abs', workoutType: 'strength',
    instructions: ['Sit with knees bent, lean back slightly.', 'Rotate torso side to side while keeping core tight.'],
    tips: 'Move from your obliques, not just your arms.',
    targetReps: 20, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=wkD8rjkodUI',
  },
  'Russian Twist': {
    exerciseId: 'EX_RUSSIAN_TWIST', muscleGroup: 'abs', workoutType: 'strength',
    instructions: ['Sit with knees bent, lean back slightly.', 'Rotate torso side to side while keeping core tight.'],
    tips: 'Move from your obliques, not just your arms.',
    targetReps: 20, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=wkD8rjkodUI',
  },
  'Mountain Climbers': {
    exerciseId: 'EX_MOUNTAIN', muscleGroup: 'abs', workoutType: 'cardio',
    instructions: ['Start in a high plank position.', 'Drive one knee toward your chest.', 'Quickly switch legs in a running motion.', 'Keep your hips level throughout.'],
    tips: 'The faster the tempo, the more cardio benefit.',
    targetDurationSec: 30, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=nmwgirgXLYM',
  },
  Plank: {
    exerciseId: 'EX_PLANK', muscleGroup: 'abs', workoutType: 'strength',
    instructions: ['Start in a forearm plank, elbows under shoulders.', 'Keep body in a straight line from head to heels.', 'Engage core and glutes throughout the hold.'],
    tips: "Don't let hips sag or pike up — maintain neutral spine.",
    targetDurationSec: 30, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
  },
  'Push-ups': {
    exerciseId: 'EX_PUSHUP', muscleGroup: 'chest', workoutType: 'strength',
    instructions: ['Start in a high plank — hands shoulder-width apart.', 'Lower your chest until it almost touches the floor.', 'Keep your core tight and back straight throughout.', 'Push back up to full arm extension.'],
    tips: 'Flare elbows slightly — 45° is optimal for shoulder health.',
    targetReps: 12, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
  },
  'Push Ups': {
    exerciseId: 'EX_PUSHUP', muscleGroup: 'chest', workoutType: 'strength',
    instructions: ['Start in a high plank — hands shoulder-width apart.', 'Lower your chest until it almost touches the floor.', 'Keep core tight throughout.', 'Push back up to full extension.'],
    tips: 'Flare elbows at 45° for optimal shoulder health.',
    targetReps: 12, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
  },
  'Wide Push-ups': {
    exerciseId: 'EX_WIDE_PUSHUP', muscleGroup: 'chest', workoutType: 'strength',
    instructions: ['Place hands wider than shoulder-width.', 'Lower chest toward floor with control.', 'Keep elbows flared at 45° from your body.', 'Press back up powerfully.'],
    tips: 'Wide grip shifts load to outer chest and shoulders.',
    targetReps: 12, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=2TGSxHJX6As',
  },
  'Diamond Push-ups': {
    exerciseId: 'EX_DIAMOND_PUSHUP', muscleGroup: 'arms', workoutType: 'strength',
    instructions: ['Form a diamond shape with thumbs and index fingers.', 'Keep elbows pointed backward as you lower.', 'Lower chest to hands then press back up.'],
    tips: 'Diamond push-ups heavily target the triceps.',
    targetReps: 10, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=J0DnG1_S92I',
  },
  'Tricep Dips': {
    exerciseId: 'EX_TRICEP_DIP', muscleGroup: 'arms', workoutType: 'strength',
    instructions: ['Sit on a chair edge, hands gripping the seat.', 'Slide forward and lower your body by bending elbows.', 'Press back up until arms are nearly straight.'],
    tips: 'Keep your back close to the chair throughout.',
    targetReps: 12, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=6kALZikXxLc',
  },
  'Bicep Curls': {
    exerciseId: 'EX015', muscleGroup: 'arms', workoutType: 'strength',
    instructions: ['Stand with dumbbells at your sides, palms facing forward.', 'Curl both weights toward your shoulders.', 'Squeeze the bicep at the top.', 'Lower slowly with control — do not swing.'],
    tips: 'Fully extend at the bottom for maximum range of motion.',
    targetReps: 12, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
  },
  'Dumbbell Bicep Curl': {
    exerciseId: 'EX015', muscleGroup: 'arms', workoutType: 'strength',
    instructions: ['Stand with dumbbells at your sides, palms facing forward.', 'Curl both weights toward your shoulders.', 'Squeeze the bicep at the top.', 'Lower slowly — do not swing.'],
    tips: 'Fully extend at the bottom for maximum range of motion.',
    targetReps: 12, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
  },
  'Hammer Curls': {
    exerciseId: 'EX_HAMMER_CURL', muscleGroup: 'arms', workoutType: 'strength',
    instructions: ['Hold dumbbells with palms facing each other (neutral grip).', 'Curl up keeping palms facing inward throughout.', 'Squeeze at the top then lower with control.'],
    tips: 'Hammer curls target the brachialis for thicker arms.',
    targetReps: 12, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=zC3nLlEvin4',
  },
  'Chest Press': {
    exerciseId: 'EX_CHEST_PRESS', muscleGroup: 'chest', workoutType: 'strength',
    instructions: ['Lie on your back, dumbbells at chest level.', 'Press the weights straight up until arms are extended.', 'Lower slowly back to chest height.'],
    tips: 'Arch your back slightly and retract shoulder blades for stability.',
    targetReps: 10, targetSets: 4, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=VmB1G1K7v94',
  },
  Squats: {
    exerciseId: 'EX_SQUAT', muscleGroup: 'legs', workoutType: 'strength',
    instructions: ['Stand with feet shoulder-width apart.', 'Lower hips back and down until thighs are parallel.', 'Drive through heels to stand back up.'],
    tips: 'Keep chest up and knees tracking over toes.',
    targetReps: 12, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=U3HlEF_E9fo',
  },
  'Jump Squats': {
    exerciseId: 'EX_JUMP_SQUAT', muscleGroup: 'legs', workoutType: 'cardio',
    instructions: ['Stand feet shoulder-width apart.', 'Squat down, then explosively jump upward.', 'Land softly and immediately lower into the next squat.'],
    tips: 'Land toe-to-heel to absorb impact and protect your knees.',
    targetReps: 12, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=YGGq0AE5J_0',
  },
  Lunges: {
    exerciseId: 'EX_LUNGE', muscleGroup: 'legs', workoutType: 'strength',
    instructions: ['Stand tall with feet together.', 'Step one foot forward and lower your back knee toward the floor.', 'Keep your front knee directly above your ankle.', 'Push off the front foot to return, then alternate legs.'],
    tips: 'Keep your torso upright throughout the movement.',
    targetReps: 12, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U',
  },
  'Reverse Lunges': {
    exerciseId: 'EX_REVERSE_LUNGE', muscleGroup: 'legs', workoutType: 'strength',
    instructions: ['Stand with feet together.', 'Step one foot backward and lower your back knee toward the floor.', 'Keep your torso upright and core engaged.', 'Return to standing and alternate.'],
    tips: 'Easier on the knees than forward lunges — great for beginners.',
    targetReps: 12, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=xrjmEglouQE',
  },
  'Side Lunges': {
    exerciseId: 'EX_SIDE_LUNGE', muscleGroup: 'legs', workoutType: 'strength',
    instructions: ['Stand with feet together.', 'Step wide to one side and bend that knee deeply.', 'Keep the opposite leg straight.', 'Push back to center and repeat on both sides.'],
    tips: 'Drive your hips back — not just down — to protect your knees.',
    targetReps: 12, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=CLPX8i9jcHQ',
  },
  'Glute Bridges': {
    exerciseId: 'EX_GLUTE_BRIDGE', muscleGroup: 'legs', workoutType: 'strength',
    instructions: ['Lie on your back, knees bent and feet flat on the floor.', 'Drive your hips upward by squeezing your glutes.', 'Hold at the top for a second, then lower slowly.', 'Keep your core engaged throughout.'],
    tips: 'Fully contract your glutes at the top — do not rush.',
    targetReps: 15, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=OUgsJ8-Vi0E',
  },
  'Glute Bridge': {
    exerciseId: 'EX_GLUTE_BRIDGE', muscleGroup: 'legs', workoutType: 'strength',
    instructions: ['Lie on your back, knees bent and feet flat on the floor.', 'Drive your hips upward by squeezing your glutes.', 'Hold at the top then lower slowly.'],
    tips: 'Fully contract glutes at the top — do not rush.',
    targetReps: 15, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=OUgsJ8-Vi0E',
  },
  'Calf Raises': {
    exerciseId: 'EX_CALF_RAISE', muscleGroup: 'legs', workoutType: 'strength',
    instructions: ['Stand with feet hip-width apart.', 'Raise up onto your toes as high as possible.', 'Hold briefly at the top, then lower slowly.'],
    tips: 'Use a step edge for greater range of motion.',
    targetReps: 20, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=-M4-G8p1fCI',
  },
  'Shoulder Press': {
    exerciseId: 'EX_SHOULDER_PRESS', muscleGroup: 'shoulder', workoutType: 'strength',
    instructions: ['Hold dumbbells at shoulder height, palms forward.', 'Press the weights directly overhead until arms are extended.', 'Do not arch your lower back — keep core braced.', 'Lower the dumbbells back to shoulder height.'],
    tips: 'Press in a slight forward arc, not straight up, to reduce shoulder impingement.',
    targetReps: 10, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
  },
  'Overhead Dumbbell Press': {
    exerciseId: 'EX_OHP', muscleGroup: 'shoulder', workoutType: 'strength',
    instructions: ['Hold dumbbells at shoulder height, palms forward.', 'Press the weights directly overhead until arms are extended.', 'Lower the dumbbells back to shoulder height.'],
    tips: 'Keep your core tight throughout to protect your lower back.',
    targetReps: 10, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
  },
  'Lateral Raises': {
    exerciseId: 'EX_LATERAL_RAISE', muscleGroup: 'shoulder', workoutType: 'strength',
    instructions: ['Stand with dumbbells at your sides.', 'Raise arms out to the sides until parallel with the floor.', 'Keep a slight bend in the elbow.', 'Lower back down slowly.'],
    tips: 'Tilt pinky slightly up at the top for full medial deltoid activation.',
    targetReps: 15, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
  },
  'Front Raises': {
    exerciseId: 'EX_FRONT_RAISE', muscleGroup: 'shoulder', workoutType: 'strength',
    instructions: ['Stand with dumbbells in front of your thighs.', 'Raise arms straight forward to shoulder height.', 'Keep core tight and avoid leaning back.', 'Lower back down with control.'],
    tips: 'Slight bend in elbows to reduce joint strain.',
    targetReps: 12, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=sOcYlBI85hc',
  },
  'Pike Push-ups': {
    exerciseId: 'EX_PIKE_PUSHUP', muscleGroup: 'shoulder', workoutType: 'strength',
    instructions: ['Start in a downward dog position — hips high.', 'Bend elbows and lower your head toward the floor.', 'Push back up to start position.'],
    tips: 'The more vertical your torso, the more shoulder-focused the exercise.',
    targetReps: 10, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=sposDXWEB0A',
  },
  Superman: {
    exerciseId: 'EX_SUPERMAN', muscleGroup: 'back', workoutType: 'strength',
    instructions: ['Lie face down with arms extended overhead.', 'Simultaneously lift your arms, chest, and legs off the ground.', 'Hold briefly at the top, then lower.'],
    tips: 'Focus on squeezing your glutes and lower back at the top.',
    targetReps: 15, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=z6PJMT2y8GQ',
  },
  'Pull-ups': {
    exerciseId: 'EX_PULLUP', muscleGroup: 'back', workoutType: 'strength',
    instructions: ['Hang from a bar with hands shoulder-width, palms facing away.', 'Pull your chest up to the bar by retracting your shoulder blades.', 'Lower yourself with control.'],
    tips: 'Initiate the movement from your lats, not your arms.',
    targetReps: 8, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
  },
  'Bent-over Rows': {
    exerciseId: 'EX_BENT_ROW', muscleGroup: 'back', workoutType: 'strength',
    instructions: ['Hinge at hips until torso is nearly parallel to floor.', 'Pull dumbbells toward your hips with elbows close to body.', 'Squeeze shoulder blades at the top.', 'Lower with control.'],
    tips: 'Keep your back flat — rounding puts your spine at risk.',
    targetReps: 10, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ',
  },
  'Jumping Jacks': {
    exerciseId: 'EX_JJ', muscleGroup: 'cardio', workoutType: 'cardio',
    instructions: ['Stand with feet together and arms at your sides.', 'Jump feet wide while raising arms overhead.', 'Jump back to starting position to complete one rep.', 'Maintain a steady rhythm and breathe evenly.'],
    tips: 'Land softly on the balls of your feet.',
    targetDurationSec: 30, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=2W4ZNSwoW_4',
  },
  'High Knees': {
    exerciseId: 'EX_HIGH_KNEES', muscleGroup: 'cardio', workoutType: 'cardio',
    instructions: ['Stand tall with feet hip-width apart.', 'Drive one knee up toward your chest while pumping the opposite arm.', 'Quickly alternate legs in a running motion.'],
    tips: 'Keep your core tight and stay on the balls of your feet.',
    targetDurationSec: 30, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=tx5rgpDAKO8',
  },
  Burpees: {
    exerciseId: 'EX_BURPEE', muscleGroup: 'cardio', workoutType: 'cardio',
    instructions: ['Stand, then drop hands to the floor.', 'Jump feet back to a plank position.', 'Do one push-up.', 'Jump feet forward, then explode upward into a jump.'],
    tips: 'Modify by stepping instead of jumping if needed.',
    targetReps: 10, targetSets: 3, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=dZgVxmf6jkA',
  },
  "Child's Pose": {
    exerciseId: 'EX_CHILDS_POSE', muscleGroup: 'flexibility', workoutType: 'flexibility',
    instructions: ['Kneel and sit back on your heels.', 'Extend arms forward on the floor.', 'Rest your forehead on the mat.', 'Breathe deeply and hold.'],
    tips: 'Allow gravity to deepen the stretch with each exhale.',
    targetDurationSec: 60, targetSets: 1, supportsPoseTracking: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=2MJGg-dUKh0',
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
  // Exact match
  if (EXERCISE_POSE_CONFIGS[name]) return EXERCISE_POSE_CONFIGS[name];

  // Fuzzy match — handles variations like "Push Ups" vs "Push-ups"
  const lower = name.toLowerCase();
  for (const [key, config] of Object.entries(EXERCISE_POSE_CONFIGS)) {
    if (
      lower.includes(key.toLowerCase()) ||
      key.toLowerCase().includes(lower)
    ) {
      return config;
    }
  }
  return null;
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
