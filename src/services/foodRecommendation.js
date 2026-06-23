/**
 * Food Recommendation Engine
 * Generates meal plans and food suggestions based on user profile data.
 */

// ── Food Database ─────────────────────────────────────────────────────────────
const FOOD_DATABASE = [
  // BREAKFAST
  { id: 'BF_01', name: 'Oatmeal with Berries',       meal: 'breakfast', calories: 320, protein: 12, carbs: 55, fat:  6, fiber: 8,  tags: ['high-fiber', 'low-fat', 'veg'],   imageUri: 'https://images.unsplash.com/photo-1517673408408-5dea2b21eaa3?w=300', description: 'Rolled oats topped with mixed berries and honey.', servingSize: '1 bowl (300g)' },
  { id: 'BF_02', name: 'Egg White Omelette',          meal: 'breakfast', calories: 180, protein: 24, carbs:  4, fat:  6, fiber: 1,  tags: ['high-protein', 'low-carb'],       imageUri: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=300', description: '3 egg-white omelette with spinach and mushrooms.', servingSize: '1 omelette (200g)' },
  { id: 'BF_03', name: 'Greek Yogurt Parfait',        meal: 'breakfast', calories: 280, protein: 18, carbs: 35, fat:  5, fiber: 3,  tags: ['high-protein', 'probiotic', 'veg'], imageUri: 'https://images.unsplash.com/photo-1484723091739-30990e14bfd5?w=300', description: 'Greek yogurt layered with granola and fruits.', servingSize: '1 cup (250g)' },
  { id: 'BF_04', name: 'Banana Protein Smoothie',     meal: 'breakfast', calories: 340, protein: 28, carbs: 42, fat:  4, fiber: 4,  tags: ['high-protein', 'veg', 'quick'],   imageUri: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=300', description: 'Protein-packed banana smoothie with almond milk.', servingSize: '1 glass (400ml)' },
  { id: 'BF_05', name: 'Whole Wheat Toast & Eggs',    meal: 'breakfast', calories: 360, protein: 20, carbs: 40, fat: 12, fiber: 5,  tags: ['balanced', 'quick'],              imageUri: 'https://images.unsplash.com/photo-1484723091739-30990e14bfd5?w=300', description: '2 boiled eggs with whole wheat toast and avocado.', servingSize: '2 toasts + 2 eggs' },
  { id: 'BF_06', name: 'Idli Sambar',                 meal: 'breakfast', calories: 260, protein: 10, carbs: 48, fat:  3, fiber: 4,  tags: ['low-fat', 'veg', 'indian'],       imageUri: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300', description: 'Steamed rice cakes served with lentil soup.', servingSize: '4 idlis + sambar' },
  { id: 'BF_07', name: 'Poha',                        meal: 'breakfast', calories: 250, protein:  6, carbs: 45, fat:  5, fiber: 2,  tags: ['light', 'veg', 'indian'],         imageUri: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300', description: 'Flattened rice with mustard seeds, onion, and peas.', servingSize: '1 plate (200g)' },

  // LUNCH
  { id: 'LN_01', name: 'Grilled Chicken Salad',       meal: 'lunch',     calories: 420, protein: 45, carbs: 15, fat: 14, fiber: 5,  tags: ['high-protein', 'low-carb'],       imageUri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300', description: 'Grilled chicken breast on mixed greens with light dressing.', servingSize: '1 plate (350g)' },
  { id: 'LN_02', name: 'Quinoa Buddha Bowl',          meal: 'lunch',     calories: 480, protein: 18, carbs: 65, fat: 14, fiber: 10, tags: ['high-fiber', 'veg', 'balanced'],  imageUri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300', description: 'Quinoa with roasted vegetables and tahini.', servingSize: '1 bowl (400g)' },
  { id: 'LN_03', name: 'Dal Rice',                    meal: 'lunch',     calories: 400, protein: 16, carbs: 72, fat:  5, fiber: 8,  tags: ['veg', 'indian', 'balanced'],      imageUri: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300', description: 'Yellow lentil curry served with steamed rice.', servingSize: '1 plate (350g)' },
  { id: 'LN_04', name: 'Turkey Wrap',                 meal: 'lunch',     calories: 380, protein: 30, carbs: 38, fat: 10, fiber: 4,  tags: ['high-protein', 'quick'],          imageUri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300', description: 'Whole wheat wrap with turkey, greens, and hummus.', servingSize: '1 wrap (300g)' },
  { id: 'LN_05', name: 'Paneer Sabzi with Roti',      meal: 'lunch',     calories: 460, protein: 22, carbs: 52, fat: 16, fiber: 5,  tags: ['veg', 'indian', 'high-protein'], imageUri: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300', description: 'Cottage cheese curry served with whole wheat flatbread.', servingSize: '2 rotis + 1 cup paneer' },
  { id: 'LN_06', name: 'Tuna Pasta Salad',            meal: 'lunch',     calories: 440, protein: 28, carbs: 50, fat:  9, fiber: 4,  tags: ['high-protein', 'balanced'],       imageUri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300', description: 'Whole grain pasta with canned tuna and vegetables.', servingSize: '1 plate (350g)' },

  // DINNER
  { id: 'DN_01', name: 'Baked Salmon & Veggies',      meal: 'dinner',    calories: 520, protein: 48, carbs: 20, fat: 24, fiber: 6,  tags: ['high-protein', 'omega-3', 'keto'], imageUri: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300', description: 'Oven-baked salmon fillet with steamed broccoli and carrots.', servingSize: '1 fillet + vegetables' },
  { id: 'DN_02', name: 'Chicken Stir Fry',            meal: 'dinner',    calories: 450, protein: 38, carbs: 35, fat: 14, fiber: 5,  tags: ['high-protein', 'balanced'],       imageUri: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300', description: 'Chicken breast stir-fried with mixed vegetables and soy sauce.', servingSize: '1 plate (380g)' },
  { id: 'DN_03', name: 'Vegetable Soup + Bread',      meal: 'dinner',    calories: 280, protein: 10, carbs: 48, fat:  5, fiber: 8,  tags: ['low-calorie', 'veg', 'light'],    imageUri: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300', description: 'Hearty mixed vegetable soup with whole grain bread.', servingSize: '1 bowl + 1 slice bread' },
  { id: 'DN_04', name: 'Egg Bhurji with Roti',        meal: 'dinner',    calories: 380, protein: 22, carbs: 40, fat: 14, fiber: 4,  tags: ['indian', 'high-protein'],         imageUri: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300', description: 'Scrambled eggs with onion, tomato, and spices with flatbread.', servingSize: '2 eggs + 2 rotis' },
  { id: 'DN_05', name: 'Lentil Soup',                 meal: 'dinner',    calories: 320, protein: 18, carbs: 50, fat:  4, fiber: 12, tags: ['high-fiber', 'veg', 'light'],     imageUri: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300', description: 'Red lentil soup with herbs and lemon.', servingSize: '1 bowl (350g)' },

  // SNACKS
  { id: 'SN_01', name: 'Mixed Nuts',                  meal: 'snacks',    calories: 180, protein:  5, carbs:  8, fat: 16, fiber: 2,  tags: ['keto', 'healthy-fat', 'quick'],   imageUri: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=300', description: 'Handful of almonds, walnuts, and cashews.', servingSize: '30g' },
  { id: 'SN_02', name: 'Protein Bar',                 meal: 'snacks',    calories: 220, protein: 20, carbs: 25, fat:  6, fiber: 3,  tags: ['high-protein', 'quick'],          imageUri: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300', description: 'High-protein snack bar for on-the-go nutrition.', servingSize: '1 bar (60g)' },
  { id: 'SN_03', name: 'Apple with Peanut Butter',    meal: 'snacks',    calories: 200, protein:  5, carbs: 28, fat:  8, fiber: 4,  tags: ['veg', 'balanced', 'quick'],       imageUri: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=300', description: 'Sliced apple with natural peanut butter.', servingSize: '1 medium apple + 2 tbsp PB' },
  { id: 'SN_04', name: 'Roasted Chickpeas',           meal: 'snacks',    calories: 160, protein:  8, carbs: 25, fat:  3, fiber: 6,  tags: ['veg', 'high-fiber', 'indian'],    imageUri: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=300', description: 'Crispy spiced roasted chickpeas.', servingSize: '50g' },
  { id: 'SN_05', name: 'Cottage Cheese',              meal: 'snacks',    calories: 150, protein: 18, carbs:  6, fat:  4, fiber: 0,  tags: ['high-protein', 'low-carb', 'veg'], imageUri: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300', description: 'Low-fat cottage cheese with a pinch of black pepper.', servingSize: '100g' },
];

// ── Recommendation Logic ────────────────────────────────────────────────────────
/**
 * Get food recommendations based on user profile and meal type.
 * @param {Object} userProfile – from UserContext
 * @param {string} mealType    – 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'all'
 * @returns {Array} recommended foods
 */
export const getFoodRecommendations = (userProfile = {}, mealType = 'all') => {
  const goal    = (userProfile.goal || '').toLowerCase();
  const diet    = (userProfile.dietary_preference || '').toLowerCase();
  const calGoal = parseInt(userProfile.calorie_goal || 2000, 10);

  let filtered = mealType === 'all'
    ? FOOD_DATABASE
    : FOOD_DATABASE.filter(f => f.meal === mealType);

  // ── Dietary filter ───────────────────────────────────────────────────────────
  if (diet.includes('veg')) {
    filtered = filtered.filter(f => f.tags.includes('veg'));
  }

  // ── Goal-based scoring ───────────────────────────────────────────────────────
  const scored = filtered.map(food => {
    let score = 10;

    if (goal.includes('weight') || goal.includes('lose') || goal.includes('fat')) {
      if (food.calories < 350)            score += 20;
      if (food.protein > 15)              score += 15;
      if (food.tags.includes('low-calorie')) score += 10;
      if (food.fat < 8)                   score += 10;
    } else if (goal.includes('muscle') || goal.includes('bulk') || goal.includes('gain')) {
      if (food.protein > 20)              score += 25;
      if (food.calories > 350)            score += 10;
      if (food.tags.includes('high-protein')) score += 15;
    } else if (goal.includes('maintain')) {
      if (food.tags.includes('balanced')) score += 20;
      score += food.fiber;             
    }

    if (food.tags.includes('high-fiber')) score += 5;

    return { ...food, score };
  });

  return scored.sort((a, b) => b.score - a.score);
};

/**
 * Generate a full-day meal plan.
 * @param {Object} userProfile
 * @returns {{ breakfast, lunch, dinner, snacks, totalCalories, totalProtein, totalCarbs, totalFat }}
 */
export const getMealPlan = (userProfile = {}) => {
  const meals = ['breakfast', 'lunch', 'dinner', 'snacks'];
  const plan = {};

  meals.forEach(meal => {
    const recs = getFoodRecommendations(userProfile, meal);
    plan[meal] = recs.slice(0, 3); // top 3 per meal
  });

  const all = [...plan.breakfast, ...plan.lunch, ...plan.dinner, ...plan.snacks];
  const totals = all.reduce(
    (acc, f) => ({
      calories: acc.calories + f.calories,
      protein:  acc.protein  + f.protein,
      carbs:    acc.carbs    + f.carbs,
      fat:      acc.fat      + f.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return { ...plan, totals };
};
