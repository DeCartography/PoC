import { Firestore, getFirestore } from "firebase/firestore";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

export const useFirestore = (firestore: Firestore = getFirestore()) => {
  const fetchNextQuestion = async (uid: string) => {
    const q = query(
      collection(firestore, `users/${uid}/questions`),
      where("answered", "==", false),
      orderBy("order"),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.size !== 1) {
      // ERROR: questions with same order value are duplicated or no questions available
      return;
    }
    const doc = querySnapshot.docs[0];
    return { qid: doc.id, data: doc.data() };
  };

  const fetchPoapRef = async (uid: string) => {
    return await getDocs(collection(firestore, `users/${uid}/poap`));
  };

  const createAnswerDoc = async (uid: string, qid: string, value: 0 | 1) => {
    await updateDoc(doc(firestore, `users/${uid}/questions`, qid), {
      answered: true,
    });
    return await setDoc(doc(firestore, `users/${uid}/answers`, qid), {
      value,
      createdAt: serverTimestamp(),
    });
  };

  const createPoapDoc = async (uid: string) => {
    return await addDoc(collection(firestore, `users/${uid}/poap`), {
      createdAt: serverTimestamp(),
    });
  };

  return {
    fetchNextQuestion,
    fetchPoapRef,
    createAnswerDoc,
    createPoapDoc,
  };
};
