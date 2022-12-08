<script async setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const router = useRouter();
const { user } = useAuth();
const { fetchPoapRef } = useFirestore();

const poapUrl = ref("");

const fetchPoapUrl = async (uid: string) => {
  const poapDocsRef = await fetchPoapRef(uid);
  if (poapDocsRef.size >= 1) {
    // size should be either 1 or 0
    poapDocsRef.forEach((doc) => {
      poapUrl.value = doc.data().url;
      if (!poapUrl.value) {
        // wait for poap url to be added to user's poap ref
        setTimeout(() => {
          fetchPoapUrl(uid);
        }, 2000);
        return;
      }
    });
  } else {
    router.push("/");
  }
};

if (user.value) {
  fetchPoapUrl(user.value.uid);
}
</script>
<template>
  <template v-if="poapUrl">
    <a :href="poapUrl" target="_blank">Get your POAP from here</a>
  </template>
  <template v-else>
    <p>We're issueing POAP URL...</p>
  </template>
</template>
