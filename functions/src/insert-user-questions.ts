import { apps, firestore, initializeApp } from 'firebase-admin';
import { auth } from 'firebase-functions';

if (apps.length === 0) {
  initializeApp();
}
const db = firestore();

const QUESTIONS_LIMIT = 100;

export const insertUserQuestions = auth.user().onCreate(async (user) => {
  const userId = user.uid;

  const questions = await db
    .collection('/questions')
    .orderBy('count', 'asc')
    .limit(QUESTIONS_LIMIT)
    .get();
  if (questions.empty) {
    console.warn('could not register master data.');
    return;
  }

  const batch = db.batch();
  questions.docs.forEach((question, index) => {
    const { addressA, addressB } = question.data();
    const questionId = question.id;
    batch.create(db.doc(`/users/${userId}/questions/${questionId}`), {
      addressA,
      addressB,
      order: index,
      answered: false,
    });
  });

  await batch.commit();
});
