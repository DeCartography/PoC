import { getFirestore } from "firebase-admin/firestore";
import {https} from "firebase-functions";
import { addresses } from "./addresses";

const db = getFirestore();

export const generateQuestions = https.onRequest(async () => {
    let batch = db.batch();

    let count = 0
    for (let i = 0; i < addresses.length; i++) {
        for (let j = i + 1; j < addresses.length; j++) {
            count++;

            batch.create(db.collection('/questions').doc(), {
                addressA: addresses[i],
                addressB: addresses[j],
                count: 0
            });
            if (count % 500 === 0) {
                await batch.commit();
                batch = db.batch()
            }
        }
    }

    await batch.commit();
});

