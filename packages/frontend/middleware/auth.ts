export default defineNuxtRouteMiddleware(async () => {
  if (!process.server) {
    const { user, checkAuthState } = useAuth();

    await checkAuthState();

    if (!user.value) {
      return await navigateTo("/", { replace: true });
    }
  }
});
