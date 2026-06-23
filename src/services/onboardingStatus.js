import axios from 'axios';
import { storageGetItem, storageSetItem, storageRemoveItem } from './safeStorage';
import api_call from '../../api';
const STORAGE_KEY = '@fittrack/onboarding_complete';
const API_BASE = api_call;
const API_TIMEOUT_MS = 6000;

const api = axios.create({ timeout: API_TIMEOUT_MS });

function storageKeyForUid(uid) {
  return `${STORAGE_KEY}:${uid}`;
}

/** Read many possible API response shapes from your backend */
export function parseOnboardingCompleteFromApi(data) {
  if (!data || typeof data !== 'object') return false;

  const flags = [
    data.onboardingCompleted,
    data.data?.onboardingCompleted,
    data.user?.onboardingCompleted,
    data.data?.user?.onboardingCompleted,
    data.profile?.onboardingCompleted,
  ];

  if (flags.some((v) => v === true || v === 1 || v === 'true')) {
    return true;
  }

  const profile =
    data.data?.user ??
    data.data ??
    data.user ??
    (data.success && data.data ? data.data : null) ??
    data;

  if (profile && typeof profile === 'object' && !Array.isArray(profile)) {
    const hasName = Boolean(profile.name && String(profile.name).trim().length >= 2);
    const hasStats =
      profile.age != null && profile.weight != null && profile.height != null;
    if (hasName && hasStats) return true;
  }

  return false;
}

export async function getLocalOnboardingComplete(uid) {
  if (!uid) return false;
  try {
    const value = await storageGetItem(storageKeyForUid(uid));
    return value === 'true';
  } catch {
    return false;
  }
}

export async function setLocalOnboardingComplete(uid, complete = true) {
  if (!uid) return;
  try {
    if (complete) {
      await storageSetItem(storageKeyForUid(uid), 'true');
    } else {
      await storageRemoveItem(storageKeyForUid(uid));
    }
  } catch {
    // ignore storage errors
  }
}

export async function clearLocalOnboardingComplete(uid) {
  return setLocalOnboardingComplete(uid, false);
}

/** Check server whether onboarding is done (authoritative over local cache). */
export async function resolveOnboardingStatus(user) {
  if (!user?.uid) {
    return false;
  }

  try {
    const response = await api.get(`${API_BASE}/Home`, {
      headers: { 'firebase-uid': user.uid },
    });

    const serverComplete = parseOnboardingCompleteFromApi(response.data);
    if (serverComplete) {
      await setLocalOnboardingComplete(user.uid, true);
    } else {
      await clearLocalOnboardingComplete(user.uid);
    }
    return serverComplete;
  } catch (error) {
    if (error.response?.status === 404) {
      await clearLocalOnboardingComplete(user.uid);
      return false;
    }

    console.warn('Onboarding status check failed:', error?.message ?? error);

    // Do not trust stale local cache when the server cannot be reached.
    return false;
  }
}
