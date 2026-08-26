/**
 * Maps exercise names to QuickPose SDK feature strings + per-exercise coaching instructions.
 * fitnessFeature: the QuickPose fitness.* rep-counter feature
 * overlayFeature: skeleton overlay shown on the camera feed
 * instructions: coaching prompts shown at the start of the session
 */
export const QUICKPOSE_EXERCISE_MAP = {
  // ── Push Variations ──────────────────────────────────────────────────────
  'Push-Ups': {
    fitnessFeature: 'fitness.pushUps',
    overlayFeature: 'overlay.upperBody',
    instructions: [
      'Start in a high plank — hands shoulder-width apart',
      'Lower your chest until it almost touches the floor',
      'Keep your core tight and back straight throughout',
      'Push back up to full arm extension to complete one rep',
    ],
  },
  'Push Ups': {
    fitnessFeature: 'fitness.pushUps',
    overlayFeature: 'overlay.upperBody',
    instructions: [
      'Start in a high plank — hands shoulder-width apart',
      'Lower your chest until it almost touches the floor',
      'Keep your core tight and back straight throughout',
      'Push back up to full arm extension to complete one rep',
    ],
  },
  'Wide Push-Ups': {
    fitnessFeature: 'fitness.pushUps',
    overlayFeature: 'overlay.upperBody',
    instructions: [
      'Place hands wider than shoulder-width',
      'Lower chest toward floor with control',
      'Keep elbows flared at 45° from your body',
      'Press back up powerfully',
    ],
  },

  // ── Squat Variations ─────────────────────────────────────────────────────
  'Squats': {
    fitnessFeature: 'fitness.squats',
    overlayFeature: 'overlay.lowerBody',
    instructions: [
      'Stand with feet shoulder-width apart, toes slightly out',
      'Lower your hips down as if sitting into a chair',
      'Keep your chest up and knees tracking over your toes',
      'Drive through your heels to stand back up',
    ],
  },
  'Bodyweight Squats': {
    fitnessFeature: 'fitness.squats',
    overlayFeature: 'overlay.lowerBody',
    instructions: [
      'Stand with feet shoulder-width apart, toes slightly out',
      'Lower your hips down as if sitting into a chair',
      'Keep your chest up and knees tracking over your toes',
      'Drive through your heels to stand back up',
    ],
  },
  'Sumo Squats': {
    fitnessFeature: 'fitness.sumoSquats',
    overlayFeature: 'overlay.lowerBody',
    instructions: [
      'Stand with feet wider than shoulder-width, toes pointed outward',
      'Squat down keeping your back straight',
      'Drive through your heels to return to standing',
    ],
  },
  'Jump Squats': {
    fitnessFeature: 'fitness.squats',
    overlayFeature: 'overlay.lowerBody',
    instructions: [
      'Stand feet shoulder-width apart',
      'Squat down, then explosively jump upward',
      'Land softly and immediately lower into the next squat',
    ],
  },

  // ── Lunge Variations ─────────────────────────────────────────────────────
  'Lunges': {
    fitnessFeature: 'fitness.lunges.left',
    overlayFeature: 'overlay.lowerBody',
    instructions: [
      'Stand tall with feet together',
      'Step one foot forward and lower your back knee toward the floor',
      'Keep your front knee directly above your ankle',
      'Push off the front foot to return, then alternate legs',
    ],
  },
  'Reverse Lunges': {
    fitnessFeature: 'fitness.lunges.right',
    overlayFeature: 'overlay.lowerBody',
    instructions: [
      'Stand with feet together',
      'Step one foot backward and lower your back knee toward the floor',
      'Keep your torso upright and core engaged',
      'Return to standing and alternate',
    ],
  },
  'Side Lunges': {
    fitnessFeature: 'fitness.sideLunges.left',
    overlayFeature: 'overlay.lowerBody',
    instructions: [
      'Stand with feet together',
      'Step wide to one side and bend that knee deeply',
      'Keep the opposite leg straight',
      'Push back to center and repeat on both sides',
    ],
  },

  // ── Core ─────────────────────────────────────────────────────────────────
  'Sit-Ups': {
    fitnessFeature: 'fitness.sitUps',
    overlayFeature: 'overlay.wholeBody',
    instructions: [
      'Lie on your back with knees bent and feet flat',
      'Cross arms over chest or place hands behind head lightly',
      'Engage your core and lift your torso toward your knees',
      'Lower back down with control to complete one rep',
    ],
  },
  'Abdominal Crunches': {
    fitnessFeature: 'fitness.sitUps',
    overlayFeature: 'overlay.wholeBody',
    instructions: [
      'Lie flat on your back, knees bent at 90°',
      'Curl your upper back off the floor using your abs',
      'Do NOT pull on your neck — keep elbows wide',
      'Lower back down slowly',
    ],
  },
  'Crunches': {
    fitnessFeature: 'fitness.sitUps',
    overlayFeature: 'overlay.wholeBody',
    instructions: [
      'Lie flat on your back, knees bent at 90°',
      'Curl your upper back off the floor using your abs',
      'Do NOT pull on your neck — keep elbows wide',
      'Lower back down slowly',
    ],
  },
  'Leg Raises': {
    fitnessFeature: 'fitness.legRaises',
    overlayFeature: 'overlay.lowerBody',
    instructions: [
      'Lie flat on your back with legs straight',
      'Keep your lower back pressed into the floor',
      'Raise both legs to 90° then lower slowly',
      'Stop before your feet touch the ground to complete one rep',
    ],
  },
  'Plank': {
    fitnessFeature: 'fitness.plank',
    overlayFeature: 'overlay.wholeBody',
    instructions: [
      'Get into a forearm plank — elbows under shoulders',
      'Keep your body in a straight line from head to heels',
      'Squeeze your glutes and core — do not let hips sag',
      'Hold the position for the target duration',
    ],
  },
  'V-Ups': {
    fitnessFeature: 'fitness.vUps',
    overlayFeature: 'overlay.wholeBody',
    instructions: [
      'Lie flat with arms extended overhead',
      'Simultaneously lift legs and torso to form a V shape',
      'Try to touch your toes at the top',
      'Lower back down with control',
    ],
  },
  'Cobra Wings': {
    fitnessFeature: 'fitness.cobraWings',
    overlayFeature: 'overlay.upperBody',
    instructions: [
      'Lie face down with arms along your sides',
      'Lift your chest and arms off the ground',
      'Squeeze your shoulder blades together at the top',
      'Lower back down and repeat',
    ],
  },
  'Glute Bridge': {
    fitnessFeature: 'fitness.gluteBridge',
    overlayFeature: 'overlay.lowerBody',
    instructions: [
      'Lie on your back, knees bent and feet flat on the floor',
      'Drive your hips upward by squeezing your glutes',
      'Hold at the top for a second, then lower slowly',
      'Keep your core engaged throughout',
    ],
  },

  // ── Arms / Shoulders ─────────────────────────────────────────────────────
  'Dumbbell Bicep Curl': {
    fitnessFeature: 'fitness.bicepCurls',
    overlayFeature: 'overlay.arms',
    instructions: [
      'Stand with dumbbells at your sides, palms facing forward',
      'Curl both weights toward your shoulders',
      'Squeeze the bicep at the top',
      'Lower slowly with control — do not swing',
    ],
  },
  'Bicep Curls': {
    fitnessFeature: 'fitness.bicepCurls',
    overlayFeature: 'overlay.arms',
    instructions: [
      'Stand with dumbbells at your sides, palms facing forward',
      'Curl both weights toward your shoulders',
      'Squeeze the bicep at the top',
      'Lower slowly with control — do not swing',
    ],
  },
  'Lateral Raises': {
    fitnessFeature: 'fitness.lateralRaises',
    overlayFeature: 'overlay.upperBody',
    instructions: [
      'Stand with dumbbells at your sides',
      'Raise arms out to the sides until parallel with the floor',
      'Keep a slight bend in the elbow',
      'Lower back down slowly',
    ],
  },
  'Front Raises': {
    fitnessFeature: 'fitness.frontRaises',
    overlayFeature: 'overlay.upperBody',
    instructions: [
      'Stand with dumbbells in front of your thighs',
      'Raise arms straight forward to shoulder height',
      'Keep core tight and avoid leaning back',
      'Lower back down with control',
    ],
  },
  'Overhead Dumbbell Press': {
    fitnessFeature: 'fitness.overheadDumbbellPress',
    overlayFeature: 'overlay.upperBody',
    instructions: [
      'Hold dumbbells at shoulder height, palms forward',
      'Press the weights directly overhead until arms are extended',
      'Do not arch your lower back — keep core braced',
      'Lower the dumbbells back to shoulder height',
    ],
  },

  // ── Cardio ───────────────────────────────────────────────────────────────
  'Jumping Jacks': {
    fitnessFeature: 'fitness.jumpingJacks',
    overlayFeature: 'overlay.wholeBody',
    instructions: [
      'Stand with feet together and arms at your sides',
      'Jump feet wide while raising arms overhead',
      'Jump back to starting position to complete one rep',
      'Maintain a steady rhythm and breathe evenly',
    ],
  },
};

/**
 * Returns the QuickPose config for a given exercise name.
 * Falls back to overlay-only mode if exercise not mapped.
 */
export const getQuickPoseConfig = (exerciseName = '') => {
  // Exact match first
  if (QUICKPOSE_EXERCISE_MAP[exerciseName]) {
    return QUICKPOSE_EXERCISE_MAP[exerciseName];
  }

  // Fuzzy match: check if any key is contained in the exercise name
  const lower = exerciseName.toLowerCase();
  for (const [key, config] of Object.entries(QUICKPOSE_EXERCISE_MAP)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return config;
    }
  }

  // Default: full-body overlay, no rep counter
  return {
    fitnessFeature: null,
    overlayFeature: 'overlay.wholeBody',
    instructions: [
      'Stand with your full body visible to the camera',
      'Follow your normal form for this exercise',
      'The AI will track your movement in real-time',
    ],
  };
};
