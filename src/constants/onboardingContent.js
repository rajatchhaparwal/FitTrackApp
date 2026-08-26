/** Core FitTrack features — shown on the final insight screen */
export const FITTRACK_FEATURES = {
  pose: {
    icon: 'camera-outline',
    title: 'Real-time form feedback',
    desc: 'Train with your camera and get rep-by-rep guidance.',
    color: '#5A8BFF',
  },
  meals: {
    icon: 'food-apple-outline',
    title: 'Smart meal tracking',
    desc: 'Log meals quickly and stay on top of nutrition.',
    color: '#34C759',
  },
  coach: {
    icon: 'message-text-outline',
    title: 'Personal fitness coach',
    desc: 'Workouts, meals, and recovery tips when you need them.',
    color: '#7C5CFF',
  },
  calories: {
    icon: 'fire',
    title: 'Calorie targets',
    desc: 'Daily goals built from your body stats and objective.',
    color: '#FF6B4A',
  },
};

/**
 * Motivation screens between form steps — full screen hero photography + elegant typography
 * @type {Record<string, { headline: (name: string) => string, subtext: string, image: string, tag?: string, feature?: keyof FITTRACK_FEATURES, quote?: string }>}
 */
export const INSIGHT_PHASES = {
  name: {
    headline: (name) =>
      name ? `Good to meet you, ${name}` : 'Good to meet you',
    subtext:
      'Every lasting habit starts with a single session. You are already on your way.',
    image:
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=85',
    feature: 'coach',
    quote: 'Small steps today lead to big changes tomorrow.',
  },
  body: {
    headline: () => 'Your plan starts with you',
    subtext:
      'Age, height, and weight help us set safe targets that actually fit your body.',
    image:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&auto=format&fit=crop&q=85',
    feature: 'calories',
    quote: 'Train for your body — not someone else’s.',
  },
  goal: {
    headline: () => 'One clear goal.\nOne focused plan.',
    subtext:
      'Whether you want to lose weight, build muscle, or move better — we shape the plan around that.',
    image:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&auto=format&fit=crop&q=85',
    feature: 'pose',
    quote: 'Consistency beats intensity every single time.',
  },
  lifestyle: {
    headline: () => 'Built for your real routine',
    subtext:
      'Busy schedule or just getting started? Your plan adjusts to how you actually live.',
    image:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&auto=format&fit=crop&q=85',
    feature: 'meals',
    quote: 'Good nutrition and consistency make every workout count.',
  },
  finish: {
    headline: (name) =>
      name ? `You are all set, ${name}` : 'You are all set',
    subtext:
      'Form coaching, meal tracking, calorie targets, and guided workouts — ready when you are.',
    image:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&auto=format&fit=crop&q=85',
    quote: 'Start where you are. Keep showing up.',
  },
};

/** Copy for form steps */
export const FORM_STEP_COPY = {
  name: {
    icon: 'account-outline',
    title: 'What should we call you?',
    subtitle: 'We will use your name across your dashboard and workout plan.',
  },
  body: {
    icon: 'heart-pulse',
    title: 'Tell us about yourself',
    subtitle: 'These details help us calculate calories and workout intensity for you.',
  },
  goal: {
    icon: 'flag-checkered',
    title: 'What is your main goal?',
    subtitle: 'Pick what matters most right now. You can change this later.',
  },
  lifestyle: {
    icon: 'walk',
    title: 'Your activity and preferences',
    subtitle: 'Tell us how active you are and what kind of training you enjoy.',
  },
  health: {
    icon: 'shield-check-outline',
    title: 'Anything we should know?',
    subtitle: 'Share injuries or limits so we can keep your workouts safe.',
  },
};
