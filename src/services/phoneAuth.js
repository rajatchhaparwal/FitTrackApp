import {
  getAuth,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from '@react-native-firebase/auth';

let confirmationResult = null;
let lastPhoneNumber = null;

let authListeners = [];
let bypassActive = false;

const dummyUser = {
  uid: 'xMZZTq4KNhPEI9BWGpE6qin2b7y2',
  phoneNumber: '+918602149400',
  displayName: 'Rajat',
  name: 'Rajat',
};

export function getFirebaseAuthErrorMessage(error) {
  const code = error?.code ?? '';
  switch (code) {
    case 'auth/invalid-phone-number':
      return 'That phone number is invalid. Check the number and try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes and try again.';
    case 'auth/quota-exceeded':
      return 'SMS quota exceeded. Try again later or contact support.';
    case 'auth/invalid-verification-code':
      return 'The code you entered is incorrect. Please try again.';
    case 'auth/code-expired':
      return 'This code has expired. Tap Resend OTP to get a new one.';
    case 'auth/session-expired':
      return 'Your verification session expired. Go back and request a new code.';
    case 'auth/missing-verification-code':
      return 'Please enter the 6-digit verification code.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return error?.message ?? 'Something went wrong. Please try again.';
  }
}

export async function sendPhoneOtp(phoneNumber) {
  confirmationResult = await getAuth().signInWithPhoneNumber(phoneNumber);
  lastPhoneNumber = phoneNumber;
  return confirmationResult;
}

export async function verifyPhoneOtp(code) {
  if (!confirmationResult) {
    throw new Error('No active verification session. Go back and request a new code.');
  }
  const userCredential = await confirmationResult.confirm(code);
  confirmationResult = null;
  return userCredential;
}

export async function resendPhoneOtp() {
  if (!lastPhoneNumber) {
    throw new Error('Phone number unavailable. Go back and enter your number again.');
  }
  return sendPhoneOtp(lastPhoneNumber);
}

export function clearPhoneAuthSession() {
  confirmationResult = null;
  lastPhoneNumber = null;
}

export function subscribeToAuthState(callback) {
  if (bypassActive) {
    setTimeout(() => callback(dummyUser), 0);
    return () => {};
  }

  authListeners.push(callback);

  const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
    if (!bypassActive) {
      callback(user);
    }
  });

  return () => {
    authListeners = authListeners.filter(cb => cb !== callback);
    unsubscribe();
  };
}

export function activateBypass() {
  bypassActive = true;

  try {
    const authInstance = getAuth();
    Object.defineProperty(authInstance, 'currentUser', {
      get: () => dummyUser,
      configurable: true,
    });
  } catch (e) {
    console.log("Mock getAuth error:", e);
  }

  // Notify all registered authentication listeners instantly
  authListeners.forEach(callback => {
    try {
      callback(dummyUser);
    } catch (err) {
      console.error("Error in auth listener callback:", err);
    }
  });
}

export async function signOut() {
  const uid = getAuth().currentUser?.uid;
  clearPhoneAuthSession();
  if (uid) {
    const { clearLocalOnboardingComplete } = require('./onboardingStatus');
    await clearLocalOnboardingComplete(uid);
  }
  bypassActive = false;
  return firebaseSignOut(getAuth());
}

export function getCurrentUser() {
  if (bypassActive) return dummyUser;
  
  const user = getAuth().currentUser;
  if (!user) {
    throw new Error('No user found');
  }
  return user;
}