/** Core FitTrack features — shown on motivation screens */
export const FITTRACK_FEATURES = {
  pose: {
    icon: 'camera-outline',
    title: 'Real-time Pose Detection',
    desc: 'Train with your camera. Get instant form feedback on every rep — so you improve safely, even alone.',
    color: '#5A8BFF',
    bg: '#EEF3FF',
  },
  meals: {
    icon: 'food-apple-outline',
    title: 'AI Meal Tracker',
    desc: 'Snap your plate. AI logs your food in seconds — no tedious searching, no giving up after day three.',
    color: '#34C759',
    bg: '#E8FAEE',
  },
  coach: {
    icon: 'message-text-outline',
    title: 'AI Fitness Coach',
    desc: 'Ask anything — workouts, meals, soreness, motivation. A coach who never judges and always replies.',
    color: '#7C5CFF',
    bg: '#F0EBFF',
  },
  calories: {
    icon: 'fire',
    title: 'Calorie Engine',
    desc: 'Your daily targets, calculated from your body and goal. Know exactly what to eat — no confusing math.',
    color: '#FF6B4A',
    bg: '#FFF0EC',
  },
};

/**
 * One motivation screen per phase — simple headline + one hero feature
 * @type {Record<string, { headline: (name: string) => string, subtext: string, feature: keyof FITTRACK_FEATURES, quote?: string }>}
 */
export const INSIGHT_PHASES = {
  name: {
    headline: (name) =>
      name
        ? `${name}, you showed up. That is already a win.`
        : 'You showed up. That is already a win.',
    subtext:
      'You do not need perfect motivation today. You need one small step — and you just took it.',
    feature: 'coach',
    quote: '"The only bad workout is the one that did not happen."',
  },
  body: {
    headline: () => 'Built around your body — not a generic plan.',
    subtext:
      'Your age, weight, and height power everything. No more guessing what is right for you.',
    feature: 'calories',
    quote: '"What gets measured gets improved."',
  },
  goal: {
    headline: () => 'Your goal is the destination. We map the route.',
    subtext:
      'Whether you want to lose weight, build muscle, or move better — FitTrack adapts to you.',
    feature: 'pose',
    quote: '"Form first. Weight second. Results follow."',
  },
  lifestyle: {
    headline: () => 'A plan you can actually live with.',
    subtext:
      'Busy week? Beginner? Coming back after a break? We scale to your real life, not an ideal one.',
    feature: 'meals',
    quote: '"Nutrition is the foundation. Training builds on top."',
  },
  finish: {
    headline: (name) =>
      name ? `${name}, your team is ready.` : 'Your team is ready.',
    subtext:
      'Pose coaching, meal tracking, calorie targets, and an AI coach — everything in one place.',
    feature: null,
    quote: '"Start where you are. Use what you have. Do what you can."',
  },
};

/** Short encouragement shown on form steps */
export const FORM_STEP_COPY = {
  name: {
    icon: 'account-outline',
    title: 'What should we call you?',
    subtitle: 'Your name makes this journey feel personal — not generic.',
    hint: 'We will use this across your plan and coach chats.',
  },
  body: {
    icon: 'heart-pulse',
    title: 'About you',
    subtitle: 'Honest numbers help us help you — no judgment, ever.',
    hint: 'Used only for your calorie engine and workout intensity.',
  },
  goal: {
    icon: 'flag-checkered',
    title: 'Your main goal',
    subtitle: 'Pick what matters most right now. You can change it later.',
    hint: 'One clear goal beats trying to do everything at once.',
  },
  lifestyle: {
    icon: 'walk',
    title: 'Your routine',
    subtitle: 'Be honest — a realistic plan beats an ambitious one you quit.',
    hint: 'We match workout volume to how active you really are.',
  },
  health: {
    icon: 'shield-check-outline',
    title: 'Anything we should know?',
    subtitle: 'Injuries, pain, or limits — optional, but helps us keep you safe.',
    hint: 'Leave blank if none. We will avoid risky movements for you.',
  },
};
