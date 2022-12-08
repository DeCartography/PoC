import type { Auth, User } from "firebase/auth";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { ref } from "vue";

export const useAuth = (auth: Auth = getAuth()) => {
  const user = ref<User | null>(auth.currentUser);

  auth.onIdTokenChanged((authUser) => (user.value = authUser));

  const checkAuthState = async () => {
    try {
      if (auth.currentUser === null) {
        const _user = await _checkAuthState(auth);
        user.value = _user;
      }
    } catch (error) {
      user.value = null;
    }
  };

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      user.value = null;
    } catch (error) {
      throw error;
    }
  };

  return { user, checkAuthState, login, logout };
};

const _checkAuthState = async (auth: Auth) => {
  return new Promise<User | null>((resolve, reject) => {
    onAuthStateChanged(
      auth,
      (user) => resolve(user || null),
      (error) => reject(error)
    );
  });
};
