<script async setup lang="ts">
const router = useRouter();
const { user, checkAuthState, login } = useAuth();
const { fetchNextQuestion, fetchPoapRef } = useFirestore();

await checkAuthState();

const navigateUser = async (uid: string) => {
  // check if user has answered all questions
  const poapDocsRef = await fetchPoapRef(uid);
  if (poapDocsRef.size >= 1) {
    // size should be either 1 or 0
    router.push("/complete");
  } else {
    const question = await fetchNextQuestion(uid);
    if (!question) {
      // ERROR: no questions available
      // wait for user's questions to be cretead
      setTimeout(() => {
        navigateUser(uid);
      }, 2000);
      return;
    }
    router.push(`/questions/${question.qid}`);
  }
};

watch(
  user,
  () => {
    if (user.value) {
      navigateUser(user.value.uid);
    }
  },
  { immediate: true }
);
</script>
<template>
  <template v-if="user?.uid">
    <div class="flex items-center justify-center">
      <div class="text-center">
        <Loading />
        <p>redirecting to the question page...</p>
      </div>
    </div>
  </template>
  <template v-else>
    <div class="flex flex-wrap h-screen">
      <div class="flex justify-center items-center w-full md:w-1/2">
        <h1 class="text-4xl font-semibold inline-block">DeCartography</h1>
        <button
          class="ml-8 border-2 border-black px-6 py-2 rounded"
          @click="login"
        >
          Login
        </button>
      </div>
      <div
        class="flex justify-center items-center bg-gray-800 text-white w-full md:w-1/2"
      >
        <div class="px-16">
          <p class="text-4xl font-extralight">
            Social Graph<br />for era of plurality
          </p>
          <p class="mt-4 text-lg font-extralight leading-8 tracking-wider">
            DeCartography is Social Graph tool for governance.<br />
            Fully decentralized, clustring by wisdom of crowds, based on wallet
            transaction
          </p>
        </div>
      </div>
    </div>
  </template>
</template>
