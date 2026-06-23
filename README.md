# FitTrack App

**AI-powered fitness tracking app** built with React Native 0.83 — tracks workouts, diet, hydration, and provides personalised exercise & food recommendations using the **FatSecret Platform API**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📱 Phone Auth | Firebase OTP-based authentication |
| 🏠 Dashboard | Personalised greeting, trending workouts, activity summary |
| 💪 Workout Tracker | Browse body-focus routines, live pose detection, progress tracking |
| 🥗 Diet Tracker | Log meals by type, calorie & macro tracking against personal goals |
| 📸 Snap & Identify | Camera-based AI meal recognition via backend |
| 🔍 **Food Search** | Real-time food search powered by **FatSecret API** with full nutrition data |
| 🏋️ **Exercise Recommendations** | AI-personalised workouts based on user's goal, fitness level & BMI |
| 🍽️ **Food Recommendations** | Daily meal plan + food suggestions aligned to calorie goal |
| 🔎 **Global Search Bar** | Works on Home, Diet, Workout screens — searches food & exercises simultaneously |
| 💧 Hydration Tracker | Daily water intake logging |
| 👤 User Profile | View & edit profile, goal, dietary preferences |

---

## 🚀 Tech Stack

- **React Native** 0.83.1 (New Architecture)
- **React Navigation** v7 (Stack + Bottom Tabs)
- **Firebase** – Auth (Phone OTP)
- **FatSecret Platform API** v2 – food search & nutrition data
- **react-native-vision-camera** + **react-native-mediapipe** – pose detection
- **react-native-reanimated** – animations
- **Axios** – backend API calls
- **Node.js / Express** – custom backend (in `/back`)

---

## 📁 Project Structure

```
FittrackApp/
├── App.jsx                          # Root navigator (Stack + Tabs)
├── api.js                           # Backend base URL
├── UserContext.js                   # Global user state & API calls
│
├── src/
│   ├── services/
│   │   ├── fatsecretApi.js          # ⭐ FatSecret OAuth2 wrapper
│   │   ├── exerciseRecommendation.js # ⭐ Exercise recommendation engine
│   │   ├── foodRecommendation.js    # ⭐ Food recommendation engine
│   │   ├── phoneAuth.js             # Firebase phone auth
│   │   ├── mongoAuth.js             # MongoDB user auth
│   │   ├── onboardingStatus.js      # Onboarding flow management
│   │   └── safeStorage.js           # Secure local storage
│   │
│   ├── Screens/
│   │   ├── Home.jsx                 # Dashboard home
│   │   ├── SplashScreen.jsx
│   │   ├── Auth/                    # Login, OTP, Profile setup
│   │   ├── DietTracker/
│   │   │   ├── DietTracker.jsx      # ⭐ Meal log with real calorie goals
│   │   │   └── CaptureMeal.jsx      # ⭐ Camera + FatSecret manual search
│   │   ├── WorkoutTracker/
│   │   │   ├── WorkoutTracker.jsx   # ⭐ With personalised recommendations
│   │   │   ├── AbsBeginnerScreen.jsx
│   │   │   ├── SpecificWorkoutPage.jsx
│   │   │   └── LivePoseDetectionScreen.jsx
│   │   ├── FoodSearch/
│   │   │   └── FoodSearchScreen.jsx  # ⭐ Full FatSecret food search screen
│   │   ├── ExerciseRecommendation/
│   │   │   └── ExerciseRecommendationScreen.jsx # ⭐ AI exercise recommendations
│   │   ├── FoodRecommendation/
│   │   │   └── FoodRecommendationScreen.jsx     # ⭐ Meal plan generator
│   │   ├── UserProfile/
│   │   └── Actitvities/
│   │
│   ├── components/
│   │   ├── SearchNotification&otherIconsLogic/
│   │   │   └── SearchBar.jsx        # ⭐ Functional global search bar
│   │   ├── DietTracker/
│   │   │   └── TrackFood.jsx
│   │   ├── workoutTracker/
│   │   │   └── WhatToTrain.jsx
│   │   └── ActivityTracker/
│   │       ├── Activities.jsx
│   │       └── TodaysGoalCard.jsx
│   │
│   ├── constants/
│   └── utils/
│
└── android/                         # Android native project
```

---

## 🔧 Setup & Installation

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 20 |
| React Native CLI | Latest |
| Android Studio | Hedgehog+ (API 35) |
| JDK | 17 (Eclipse Temurin) |
| Android SDK | 36 |
| NDK | 27.0.12077973 |

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd FittrackApp
npm install
```

### 2. Backend Setup

```bash
cd ../back
npm install
node index.js          # Starts on port 5000
```

Update `api.js` with your machine's local IP:

```js
// FittrackApp/api.js
const api_call = 'http://YOUR_LOCAL_IP:5000';
export default api_call;
```

### 3. Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Phone Authentication**
3. Download `google-services.json` → place in `android/app/`

### 4. FatSecret API (Already configured ✅)

The app uses FatSecret Platform API v2. Credentials are already integrated in `src/services/fatsecretApi.js`:

```
Client ID:     197ebdcdca80403ebf89af543ac75dae
Client Secret: d7c83897f7e94d9a9b41361ad760484a
```

> **Security Note:** For production, move these to environment variables using `react-native-config` or store server-side.

### 5. Run on Android

```bash
# Start Metro bundler
npx react-native start

# In a new terminal
npx react-native run-android
```

---

## 🍽️ FatSecret API Integration

### How it works

```
User types "chicken" in search bar
      ↓
SearchBar.jsx (debounced 500ms)
      ↓
fatsecretApi.js → getAccessToken() [OAuth2 client_credentials]
      ↓
FatSecret Token URL: https://oauth.fatsecret.com/connect/token
      ↓
fatsecretApi.js → searchFood("chicken")
      ↓
FatSecret API: https://platform.fatsecret.com/rest/server.api
      ↓
Returns: [ { name, calories, protein, carbs, fat, ... } ]
      ↓
Displayed as dropdown suggestions → Navigate to FoodSearchScreen
```

### API Methods

| Function | Description |
|---|---|
| `getAccessToken()` | Fetches OAuth2 Bearer token (cached for duration) |
| `searchFood(query, maxResults)` | Searches foods by name |
| `getFoodById(foodId)` | Gets full nutrition detail for one food |

---

## 💪 Exercise Recommendation System

Exercises are scored based on:

| Factor | Logic |
|---|---|
| **User Goal** | Weight loss → cardio boosted; Muscle gain → strength boosted |
| **Fitness Level** | Beginner only sees beginner exercises; Advanced sees all |
| **BMI** | BMI > 30 → low-impact exercises prioritized |
| **Calorie Burn** | High-burn exercises get bonus score |

**Available body parts:** Abs, Arm, Chest, Leg, Shoulder, Back, Full Body  
**Exercise types:** Strength, Cardio, Flexibility  
**Total exercises in database:** 30+

---

## 🥗 Food Recommendation System

Meal plan generated based on:

| Factor | Logic |
|---|---|
| **Calorie Goal** | Sourced from `userData.calorie_goal` |
| **Goal** | Weight loss → low-cal high-protein; Muscle gain → high-protein high-cal |
| **Dietary Preference** | Vegetarian filter applied from user profile |
| **Meal Type** | Separate recommendations for Breakfast, Lunch, Dinner, Snacks |

**Total foods in database:** 20+ with full macro data  
**Macros tracked:** Calories, Protein, Carbs, Fat, Fiber, Sugar

---

## 🔍 Search Bar (Global)

The unified SearchBar component (`SearchBar.jsx`) works across:

| Screen | Behaviour |
|---|---|
| **Home** | Searches food + exercises simultaneously, shows inline dropdown |
| **Diet Tracker** | Meal sections tap → opens FoodSearch screen |
| **CaptureMeal** | Inline food search with FatSecret, debounced 500ms |
| **WorkoutTracker** | Tappable search bar → ExerciseRecommendation screen |

**Search flow:**
1. User types → 500ms debounce
2. Parallel calls to FatSecret (food) + local exercise DB
3. Top 8 results shown as dropdown
4. Tap result → navigate to full screen or add directly

---

## 🗺️ Navigation Map

```
App
└── Stack Navigator
    ├── Login / Otp
    ├── CompleteUserProfile (onboarding)
    └── MyTab (Bottom Tabs)
        ├── Home
        ├── Workout → ExerciseRecommendation
        ├── Diet    → FoodSearch | FoodRecommendation | CaptureMeal
        └── Profile
    
    Stack Screens (accessible from tabs):
    ├── FoodSearch            ← food search with FatSecret
    ├── ExerciseRecommendation ← personalised AI workouts
    ├── FoodRecommendation    ← meal plan generator
    ├── CaptureMeal           ← camera + search
    ├── AbsBeginnerScreen     ← workout detail
    ├── SpecificWorkoutPage
    ├── LivePoseDetection
    ├── DrinkWaterScreen
    └── Activities
```

---

## ⚙️ Environment Variables

For production, extract these to `.env`:

```env
FATSECRET_CLIENT_ID=197ebdcdca80403ebf89af543ac75dae
FATSECRET_CLIENT_SECRET=d7c83897f7e94d9a9b41361ad760484a
API_BASE_URL=http://your-server.com:5000
```

Then use `react-native-config` to load them.

---

## 🐛 Known Issues & Fixes

### Android Build — Gradle Cache Corruption

If you see `checkDebugAarMetadata FAILED` with immutable workspace errors:

```powershell
# Stop all Gradle daemons
cd android && .\gradlew.bat --stop

# Delete corrupted transforms cache (use long-path prefix on Windows)
Remove-Item -LiteralPath "\\?\C:\Users\<YOU>\.gradle\caches\9.0.0\transforms" -Recurse -Force

# Delete CMake build caches
Remove-Item -Recurse -Force android\app\.cxx
Remove-Item -Recurse -Force android\app\build

# Rebuild
npx react-native run-android
```

### Metro Bundler Port Conflict

```bash
npx react-native start --reset-cache
```

---

## 📝 Licence

MIT — © 2025 FitTrack
