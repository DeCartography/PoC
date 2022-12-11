import { apps, firestore, initializeApp } from 'firebase-admin';
import { https } from 'firebase-functions';

import { addresses } from './addresses';

if (apps.length === 0) {
  initializeApp();
}
const db = firestore();

export const generateQuestions = https.onRequest(async (_, res) => {
  let batch = db.batch();

  let count = 0;
  for (let i = 0; i < addresses.length; i++) {
    for (let j = i + 1; j < addresses.length; j++) {
      count++;

      batch.create(db.collection('/questions').doc(), {
        addressA: addresses[i],
        addressB: addresses[j],
        count: 0,
      });
      if (count % 500 === 0) {
        await batch.commit();
        batch = db.batch();
      }
    }
  }

  await batch.commit();
  res.send(`count: ${count} added.`);
});
