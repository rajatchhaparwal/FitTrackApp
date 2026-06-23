/**
 * Exercise Recommendation Engine
 * Returns personalised workout suggestions based on user profile data.
 */

// ── Full exercise database ─────────────────────────────────────────────────────
const EXERCISE_DATABASE = [
  // ── ABS ──────────────────────────────────────────────────────────────────────
  { id: 'ABS_01', name: 'Crunches',            bodyPart: 'Abs',      type: 'strength',    sets: 3, reps: '15-20', duration: null,  difficulty: 'beginner',     kcalPer30: 120, imageUri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300', description: 'Classic abdominal exercise targeting the rectus abdominis.' },
  { id: 'ABS_02', name: 'Plank',               bodyPart: 'Abs',      type: 'strength',    sets: 3, reps: null,    duration: '60s', difficulty: 'beginner',     kcalPer30: 100, imageUri: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300', description: 'Isometric core exercise that strengthens the entire midsection.' },
  { id: 'ABS_03', name: 'Bicycle Crunches',    bodyPart: 'Abs',      type: 'strength',    sets: 3, reps: '20',    duration: null,  difficulty: 'intermediate', kcalPer30: 140, imageUri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300', description: 'Rotational crunch targeting the obliques and rectus abdominis.' },
  { id: 'ABS_04', name: 'Leg Raises',          bodyPart: 'Abs',      type: 'strength',    sets: 3, reps: '12',    duration: null,  difficulty: 'intermediate', kcalPer30: 110, imageUri: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300', description: 'Lower ab focus with controlled leg lowering movement.' },
  { id: 'ABS_05', name: 'Russian Twists',      bodyPart: 'Abs',      type: 'strength',    sets: 3, reps: '20',    duration: null,  difficulty: 'intermediate', kcalPer30: 130, imageUri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300', description: 'Oblique targeting rotational movement.' },
  { id: 'ABS_06', name: 'Mountain Climbers',   bodyPart: 'Abs',      type: 'cardio',      sets: 3, reps: null,    duration: '45s', difficulty: 'intermediate', kcalPer30: 200, imageUri: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300', description: 'Full body cardio exercise with core engagement.' },

  // ── ARMS ─────────────────────────────────────────────────────────────────────
  { id: 'ARM_01', name: 'Push-ups',            bodyPart: 'Arm',      type: 'strength',    sets: 3, reps: '12-15', duration: null,  difficulty: 'beginner',     kcalPer30: 170, imageUri: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300', description: 'Classic upper body exercise for chest, shoulders, and triceps.' },
  { id: 'ARM_02', name: 'Diamond Push-ups',    bodyPart: 'Arm',      type: 'strength',    sets: 3, reps: '10-12', duration: null,  difficulty: 'intermediate', kcalPer30: 180, imageUri: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300', description: 'Tricep-focused push-up variation.' },
  { id: 'ARM_03', name: 'Tricep Dips',         bodyPart: 'Arm',      type: 'strength',    sets: 3, reps: '12',    duration: null,  difficulty: 'beginner',     kcalPer30: 150, imageUri: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300', description: 'Bodyweight dip targeting the triceps using a chair or bench.' },
  { id: 'ARM_04', name: 'Bicep Curls',         bodyPart: 'Arm',      type: 'strength',    sets: 3, reps: '10-12', duration: null,  difficulty: 'beginner',     kcalPer30: 130, imageUri: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300', description: 'Isolation exercise for the biceps.' },
  { id: 'ARM_05', name: 'Hammer Curls',        bodyPart: 'Arm',      type: 'strength',    sets: 3, reps: '12',    duration: null,  difficulty: 'intermediate', kcalPer30: 135, imageUri: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=300', description: 'Neutral-grip curl targeting brachialis and brachioradialis.' },

  // ── CHEST ────────────────────────────────────────────────────────────────────
  { id: 'CHE_01', name: 'Chest Press',         bodyPart: 'Chest',    type: 'strength',    sets: 4, reps: '10-12', duration: null,  difficulty: 'beginner',     kcalPer30: 160, imageUri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300', description: 'Compound push exercise for the pectorals.' },
  { id: 'CHE_02', name: 'Wide Push-ups',       bodyPart: 'Chest',    type: 'strength',    sets: 3, reps: '12-15', duration: null,  difficulty: 'beginner',     kcalPer30: 170, imageUri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300', description: 'Wide-grip push-up focusing on the outer pectorals.' },
  { id: 'CHE_03', name: 'Chest Flyes',         bodyPart: 'Chest',    type: 'strength',    sets: 3, reps: '12',    duration: null,  difficulty: 'intermediate', kcalPer30: 140, imageUri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300', description: 'Isolation fly movement for the pectorals.' },

  // ── LEGS ─────────────────────────────────────────────────────────────────────
  { id: 'LEG_01', name: 'Squats',              bodyPart: 'Leg',      type: 'strength',    sets: 4, reps: '15',    duration: null,  difficulty: 'beginner',     kcalPer30: 200, imageUri: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=300', description: 'Fundamental lower body compound movement.' },
  { id: 'LEG_02', name: 'Lunges',              bodyPart: 'Leg',      type: 'strength',    sets: 3, reps: '12 each', duration: null, difficulty: 'beginner',    kcalPer30: 180, imageUri: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=300', description: 'Unilateral leg exercise targeting quads and glutes.' },
  { id: 'LEG_03', name: 'Jump Squats',         bodyPart: 'Leg',      type: 'cardio',      sets: 3, reps: '12',    duration: null,  difficulty: 'intermediate', kcalPer30: 250, imageUri: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=300', description: 'Plyometric squat variation for power and cardio.' },
  { id: 'LEG_04', name: 'Glute Bridges',       bodyPart: 'Leg',      type: 'strength',    sets: 3, reps: '15-20', duration: null,  difficulty: 'beginner',     kcalPer30: 130, imageUri: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=300', description: 'Hip thrust motion isolating the glutes and hamstrings.' },
  { id: 'LEG_05', name: 'Calf Raises',         bodyPart: 'Leg',      type: 'strength',    sets: 3, reps: '20',    duration: null,  difficulty: 'beginner',     kcalPer30: 100, imageUri: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=300', description: 'Isolation exercise for the calves.' },

  // ── SHOULDERS ────────────────────────────────────────────────────────────────
  { id: 'SHO_01', name: 'Shoulder Press',      bodyPart: 'Shoulder', type: 'strength',    sets: 3, reps: '10-12', duration: null,  difficulty: 'intermediate', kcalPer30: 140, imageUri: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=300', description: 'Overhead press targeting all three deltoid heads.' },
  { id: 'SHO_02', name: 'Lateral Raises',      bodyPart: 'Shoulder', type: 'strength',    sets: 3, reps: '15',    duration: null,  difficulty: 'beginner',     kcalPer30: 110, imageUri: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=300', description: 'Side raise isolating the medial deltoid.' },
  { id: 'SHO_03', name: 'Pike Push-ups',       bodyPart: 'Shoulder', type: 'strength',    sets: 3, reps: '10',    duration: null,  difficulty: 'intermediate', kcalPer30: 150, imageUri: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=300', description: 'Bodyweight overhead press focusing on shoulders.' },

  // ── BACK ─────────────────────────────────────────────────────────────────────
  { id: 'BCK_01', name: 'Superman',            bodyPart: 'Back',     type: 'strength',    sets: 3, reps: '15',    duration: null,  difficulty: 'beginner',     kcalPer30: 100, imageUri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300', description: 'Lower back extension strengthening the erector spinae.' },
  { id: 'BCK_02', name: 'Pull-ups',            bodyPart: 'Back',     type: 'strength',    sets: 3, reps: '8-10',  duration: null,  difficulty: 'advanced',     kcalPer30: 200, imageUri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300', description: 'Bodyweight vertical pulling movement for back and biceps.' },
  { id: 'BCK_03', name: 'Bent-over Rows',      bodyPart: 'Back',     type: 'strength',    sets: 3, reps: '10-12', duration: null,  difficulty: 'intermediate', kcalPer30: 160, imageUri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300', description: 'Horizontal pulling movement for back thickness.' },

  // ── CARDIO ───────────────────────────────────────────────────────────────────
  { id: 'CAR_01', name: 'Jumping Jacks',       bodyPart: 'Full Body', type: 'cardio',     sets: 3, reps: null,    duration: '60s', difficulty: 'beginner',     kcalPer30: 300, imageUri: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300', description: 'Full body warm-up/cardio exercise.' },
  { id: 'CAR_02', name: 'High Knees',          bodyPart: 'Full Body', type: 'cardio',     sets: 3, reps: null,    duration: '45s', difficulty: 'beginner',     kcalPer30: 280, imageUri: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300', description: 'Running in place with exaggerated knee raises.' },
  { id: 'CAR_03', name: 'Burpees',             bodyPart: 'Full Body', type: 'cardio',     sets: 3, reps: '10',    duration: null,  difficulty: 'advanced',     kcalPer30: 350, imageUri: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300', description: 'Total body conditioning exercise combining squat, plank, and jump.' },

  // ── FLEXIBILITY ──────────────────────────────────────────────────────────────
  { id: 'FLX_01', name: 'Child\'s Pose',       bodyPart: 'Full Body', type: 'flexibility', sets: 1, reps: null,   duration: '90s', difficulty: 'beginner',     kcalPer30:  60, imageUri: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300', description: 'Yoga resting pose stretching the spine, hips, and shoulders.' },
  { id: 'FLX_02', name: 'Hip Flexor Stretch',  bodyPart: 'Full Body', type: 'flexibility', sets: 2, reps: null,   duration: '60s', difficulty: 'beginner',     kcalPer30:  50, imageUri: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300', description: 'Kneeling lunge stretch targeting hip flexors.' },
  { id: 'FLX_03', name: 'Cat-Cow Stretch',     bodyPart: 'Back',      type: 'flexibility', sets: 2, reps: '10',   duration: null,  difficulty: 'beginner',     kcalPer30:  40, imageUri: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300', description: 'Spinal mobility exercise improving flexibility and posture.' },
];

// ── Recommendation Logic ────────────────────────────────────────────────────────
/**
 * Get personalised workout recommendations based on user profile.
 * @param {Object} userProfile – from UserContext userData
 * @returns {Array} recommended exercises
 */
export const getPersonalizedWorkouts = (userProfile = {}) => {
  const goal       = (userProfile.goal          || '').toLowerCase();
  const level      = (userProfile.fitness_level || 'beginner').toLowerCase();
  const weight     = parseFloat(userProfile.weight || 70);
  const height     = parseFloat(userProfile.height || 170);
  const bmi        = weight / Math.pow(height / 100, 2);

  let filtered = [...EXERCISE_DATABASE];

  // ── Filter by fitness level ──────────────────────────────────────────────────
  const levelMap = {
    beginner:     ['beginner'],
    intermediate: ['beginner', 'intermediate'],
    advanced:     ['beginner', 'intermediate', 'advanced'],
  };
  const allowedLevels = levelMap[level] || levelMap.beginner;
  filtered = filtered.filter(e => allowedLevels.includes(e.difficulty));

  // ── Goal-based scoring ───────────────────────────────────────────────────────
  const scored = filtered.map(exercise => {
    let score = 0;

    if (goal.includes('weight') || goal.includes('fat') || goal.includes('lose')) {
      if (exercise.type === 'cardio') score += 30;
      if (exercise.kcalPer30 > 200)   score += 20;
      if (exercise.type === 'strength') score += 10;
    } else if (goal.includes('muscle') || goal.includes('bulk') || goal.includes('gain')) {
      if (exercise.type === 'strength')  score += 30;
      if (exercise.sets >= 4)            score += 10;
      if (exercise.type === 'cardio')    score += 5;
    } else if (goal.includes('flex') || goal.includes('yoga')) {
      if (exercise.type === 'flexibility') score += 30;
      if (exercise.type === 'cardio')      score += 10;
    } else {
      // General fitness – balanced
      score += 15;
    }

    // BMI-based adjustments: high BMI → prefer low-impact
    if (bmi > 30) {
      if (exercise.id.startsWith('CAR')) score -= 5;
      if (exercise.type === 'flexibility') score += 10;
    }

    return { ...exercise, score };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, 12);
};

/**
 * Get exercises filtered by body part.
 */
export const getExercisesByBodyPart = (bodyPart) => {
  if (!bodyPart || bodyPart === 'All') return EXERCISE_DATABASE;
  return EXERCISE_DATABASE.filter(e =>
    e.bodyPart.toLowerCase().includes(bodyPart.toLowerCase())
  );
};

/**
 * Search exercises by name.
 */
export const searchExercises = (query) => {
  if (!query) return [];
  const q = query.toLowerCase();
  return EXERCISE_DATABASE.filter(
    e => e.name.toLowerCase().includes(q) || e.bodyPart.toLowerCase().includes(q)
  );
};

export const BODY_PARTS = ['All', 'Abs', 'Arm', 'Chest', 'Leg', 'Shoulder', 'Back', 'Full Body'];
export const EXERCISE_TYPES = ['All', 'strength', 'cardio', 'flexibility'];
