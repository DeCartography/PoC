<script setup lang="ts">
import {
  AssetTransfersCategory,
  AssetTransfersResult,
  OwnedNft,
} from "alchemy-sdk";

definePageMeta({
  middleware: "auth",
});

type Question = {
  id: string;
  addressA: string;
  addressB: string;
  order: number;
};

type Nft = {
  image: string;
  title: string;
};

const questionsLengthToAnswer = 49; // start from 0

const router = useRouter();
const { user } = useAuth();
const { createAnswerDoc, createPoapDoc, fetchNextQuestion } = useFirestore();

const currentQuestion = ref<Question>();
const isLoading = ref(false);
const nftCollectionsA = ref<Nft[]>([]);
const nftCollectionsB = ref<Nft[]>([]);
const transactionsA = ref<AssetTransfersResult[]>([]);
const transactionsB = ref<AssetTransfersResult[]>([]);

const onAnswer = async (answer: 0 | 1) => {
  if (currentQuestion.value && user.value) {
    isLoading.value = true;
    // register answer history
    await createAnswerDoc(user.value.uid, currentQuestion.value.id, answer);

    // get next question
    const res = await fetchNextQuestion(user.value.uid);
    if (!res) {
      if (currentQuestion.value.order >= questionsLengthToAnswer) {
        // user has answered all questions
        await createPoapDoc(user.value.uid);
        return router.push("/complete");
      } else {
        return router.push("/");
      }
    }
    currentQuestion.value = {
      id: res.qid,
      addressA: res.data.addressA,
      addressB: res.data.addressB,
      order: res.data.order,
    };
    router.push(`/questions/${res.qid}`);
  }
};

watch(
  user,
  async () => {
    if (user.value) {
      const res = await fetchNextQuestion(user.value.uid);
      if (!res) {
        return router.push("/");
      }
      currentQuestion.value = {
        id: res.qid,
        addressA: res.data.addressA,
        addressB: res.data.addressB,
        order: res.data.order,
      };

      await Promise.all([
        alchemy.nft.getNftsForOwner(currentQuestion.value?.addressA),
        alchemy.nft.getNftsForOwner(currentQuestion.value?.addressB),
      ]).then((res) => {
        nftCollectionsA.value = getNftDetail(res[0].ownedNfts);
        nftCollectionsB.value = getNftDetail(res[1].ownedNfts);
      });

      Promise.all([
        alchemy.core.getAssetTransfers({
          withMetadata: true,
          fromAddress: currentQuestion.value?.addressA,
          maxCount: 10,
          category: [
            AssetTransfersCategory.EXTERNAL,
            AssetTransfersCategory.INTERNAL,
            AssetTransfersCategory.ERC20,
            AssetTransfersCategory.ERC721,
            AssetTransfersCategory.ERC1155,
            AssetTransfersCategory.SPECIALNFT,
          ],
        }),
        alchemy.core.getAssetTransfers({
          withMetadata: true,
          toAddress: currentQuestion.value?.addressA,
          maxCount: 10,
          category: [
            AssetTransfersCategory.EXTERNAL,
            AssetTransfersCategory.INTERNAL,
            AssetTransfersCategory.ERC20,
            AssetTransfersCategory.ERC721,
            AssetTransfersCategory.ERC1155,
            AssetTransfersCategory.SPECIALNFT,
          ],
        }),
      ]).then((res) => {
        const txsA = res[0].transfers.concat(res[1].transfers);
        txsA
          .sort((a, b) => {
            return (
              new Date(a.metadata.blockTimestamp).getTime() -
              new Date(b.metadata.blockTimestamp).getTime()
            );
          })
          .reverse();
        transactionsA.value = txsA;
      });

      Promise.all([
        alchemy.core.getAssetTransfers({
          withMetadata: true,
          fromAddress: currentQuestion.value?.addressB,
          maxCount: 10,
          category: [
            AssetTransfersCategory.EXTERNAL,
            AssetTransfersCategory.INTERNAL,
            AssetTransfersCategory.ERC20,
            AssetTransfersCategory.ERC721,
            AssetTransfersCategory.ERC1155,
            AssetTransfersCategory.SPECIALNFT,
          ],
        }),
        alchemy.core.getAssetTransfers({
          withMetadata: true,
          toAddress: currentQuestion.value?.addressB,
          maxCount: 10,
          category: [
            AssetTransfersCategory.EXTERNAL,
            AssetTransfersCategory.INTERNAL,
            AssetTransfersCategory.ERC20,
            AssetTransfersCategory.ERC721,
            AssetTransfersCategory.ERC1155,
            AssetTransfersCategory.SPECIALNFT,
          ],
        }),
      ]).then((res) => {
        const txsB = res[0].transfers.concat(res[1].transfers);
        txsB
          .sort((a, b) => {
            return (
              new Date(a.metadata.blockTimestamp).getTime() -
              new Date(b.metadata.blockTimestamp).getTime()
            );
          })
          .reverse();
        transactionsB.value = txsB;
      });

      isLoading.value = false;
    }
  },
  { immediate: true }
);

const getNftDetail = (ownedNfts: OwnedNft[]) => {
  return ownedNfts
    .filter((nft) => {
      if (nft.rawMetadata && nft.rawMetadata.image_url) {
        return true;
      } else if (nft.media.length) {
        return true;
      } else {
        return false;
      }
    })
    .map((nft) => {
      if (nft.rawMetadata && nft.rawMetadata.image_url) {
        return {
          image: nft.rawMetadata.image_url,
          title: nft.title,
        };
      } else if (nft.media.length) {
        return {
          image: nft.media[0].raw,
          title: nft.title,
        };
      }
    });
};

const onLoadingImageError = (nftCollection: Nft[], idx: number) => {
  // remove nft data if src url is rejected
  nftCollection.splice(idx, 1);
};
</script>
<template>
  <template v-if="isLoading">
    <Loading />
  </template>
  <template v-else>
    <div v-if="currentQuestion">
      <div class="grid grid-cols-1 md:grid-cols-2">
        <div class="text-center border-r-0 md:border-r pt-12 pb-48 md:pb-64">
          <p class="text-gray-700 text-sm">Wallet A:</p>
          <p class="text-gray-800 mb-8 break-all">
            {{ currentQuestion.addressA }}
          </p>
          <p class="text-left mb-4 ml-4">{{ nftCollectionsA?.length }} NFTs</p>
          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 overflow-y-scroll"
            :style="{
              height:
                nftCollectionsA.length <= 6 && nftCollectionsB.length <= 6
                  ? '40vh'
                  : '60vh',
            }"
          >
            <template v-for="(nft, i) in nftCollectionsA" :key="i">
              <div class="mx-auto">
                <img
                  :src="nft.image"
                  class="w-64 h-auto"
                  :loading="i < 6 ? 'eager' : 'lazy'"
                  @error="onLoadingImageError(nftCollectionsA, i)"
                />
                <p>{{ nft.title }}</p>
              </div>
            </template>
          </div>
          <p class="text-left mb-4 ml-4 mt-24 md:mt-48">Transactions</p>
          <div class="h-[70vh] overflow-y-scroll">
            <div class="w-3/4 mx-auto">
              <template v-for="tx in transactionsA" :key="tx.uniqueId">
                <div class="mb-12 break-all">
                  <p>{{ tx.value }} {{ tx.asset }}</p>
                  <p class="text-left">From:</p>
                  <p>{{ tx.from }}</p>
                  <br />
                  <p class="text-left">To:</p>
                  <p>{{ tx.to }}</p>
                </div>
              </template>
            </div>
          </div>
        </div>
        <div class="text-center pt-12 pb-48 md:pb-64">
          <p class="text-gray-700 text-sm">Wallet B:</p>
          <p class="text-gray-800 mb-8 break-all">
            {{ currentQuestion.addressB }}
          </p>
          <p class="text-left mb-4 ml-4">{{ nftCollectionsB?.length }} NFTs</p>
          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 overflow-y-scroll"
            :style="{
              height:
                nftCollectionsA.length <= 6 && nftCollectionsB.length <= 6
                  ? '40vh'
                  : '60vh',
            }"
          >
            <template v-for="(nft, i) in nftCollectionsB" :key="i">
              <div class="mx-auto">
                <img
                  :src="nft.image"
                  class="w-64 h-auto"
                  :loading="i < 6 ? 'eager' : 'lazy'"
                  @error="onLoadingImageError(nftCollectionsB, i)"
                />
                <p>{{ nft.title }}</p>
              </div>
            </template>
          </div>
          <p class="text-left mb-4 ml-4 mt-24 md:mt-48">Transactions</p>
          <div class="h-[70vh] overflow-y-scroll">
            <div class="w-3/4 mx-auto">
              <template v-for="tx in transactionsB" :key="tx.uniqueId">
                <div class="mb-12 break-all">
                  <p>{{ tx.value }} {{ tx.asset }}</p>
                  <p class="text-left">From:</p>
                  <p>{{ tx.from }}</p>
                  <br />
                  <p class="text-left">To:</p>
                  <p>{{ tx.to }}</p>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
      <div
        class="text-center text-gray-800 p-4 md:p-8 fixed bottom-0 bg-white w-full border"
      >
        <div>
          <p class="text-xl mb-4">Is A similar to B?</p>
          <button
            class="text-lg border-2 border-black rounded px-4 py-1 hover:bg-black hover:text-white hover:font-semibold mr-6"
            @click="onAnswer(1)"
          >
            Yes
          </button>
          <button
            class="text-lg border-2 border-black rounded px-4 py-1 hover:bg-black hover:text-white hover:font-semibold"
            @click="onAnswer(0)"
          >
            No
          </button>
        </div>
        <p class="text-right">
          {{ currentQuestion.order + 1 }} / {{ questionsLengthToAnswer + 1 }}
        </p>
      </div>
    </div>
  </template>
</template>
