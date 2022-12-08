<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const router = useRouter();
const { user, logout } = useAuth();

if (user) {
  await logout();
  router.push("/");
}
</script>
<template>
  <p>trying to sign out...</p>
</template>
