import { initializeApp } from "firebase/app";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const firebaseConfig = {
    apiKey: config.FIREBASE_API_KEY,
    authDomain: config.FIREBASE_AUTH_DOMAIN,
    projectId: config.FIREBASE_PROJECT_ID,
    appId: config.FIREBASE_APP_ID,
  };
  initializeApp(firebaseConfig);
});
