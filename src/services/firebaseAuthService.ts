import { 
  signInAnonymously, 
  onAuthStateChanged, 
  signOut, 
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { OfficerAuthUser } from '../types';

const OFFICER_STORAGE_KEY = 'idshield_active_officer';

const DEFAULT_OFFICER: OfficerAuthUser = {
  uid: 'OFFICER-BOI-8842',
  officerName: 'Officer V. Sharma',
  badgeNumber: 'BOI-8842',
  checkpointLocation: 'Terminal 3 - E-Gates, IGI International Airport',
  role: 'Senior Immigration & Border Security Inspector',
  isAnonymous: true,
  email: 'v.sharma@immigration.gov.demo',
};

// Retrieve cached officer profile if available
export function getSavedOfficerProfile(): OfficerAuthUser {
  try {
    const raw = localStorage.getItem(OFFICER_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_OFFICER;
}

// Save active officer profile
export function saveOfficerProfile(officer: OfficerAuthUser): void {
  try {
    localStorage.setItem(OFFICER_STORAGE_KEY, JSON.stringify(officer));
  } catch (e) {
    // ignore
  }
}

// Sign in with Firebase Authentication (creates authenticated session)
export async function authenticateOfficer(profile?: Partial<OfficerAuthUser>): Promise<OfficerAuthUser> {
  try {
    const userCredential = await signInAnonymously(auth);
    const fbUser = userCredential.user;

    const base = getSavedOfficerProfile();
    const updated: OfficerAuthUser = {
      uid: fbUser.uid || base.uid,
      officerName: profile?.officerName || base.officerName,
      badgeNumber: profile?.badgeNumber || base.badgeNumber,
      checkpointLocation: profile?.checkpointLocation || base.checkpointLocation,
      role: profile?.role || base.role,
      isAnonymous: fbUser.isAnonymous,
      email: profile?.email || base.email,
    };

    if (fbUser) {
      try {
        await updateProfile(fbUser, { displayName: updated.officerName });
      } catch (e) {
        // non-blocking
      }
    }

    saveOfficerProfile(updated);
    return updated;
  } catch (error: any) {
    console.warn('Firebase anonymous officer auth fallback to local session:', error.message);
    const fallback = { ...getSavedOfficerProfile(), ...(profile || {}) };
    saveOfficerProfile(fallback);
    return fallback;
  }
}

// Listen to officer auth state
export function subscribeToOfficerAuth(callback: (officer: OfficerAuthUser | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      const saved = getSavedOfficerProfile();
      callback({
        ...saved,
        uid: user.uid,
        isAnonymous: user.isAnonymous,
      });
    } else {
      callback(getSavedOfficerProfile());
    }
  });
}

// Log out officer
export async function logoutOfficer(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    // ignore
  }
}
