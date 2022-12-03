import { getFirestore } from "firebase-admin/firestore";
import {https} from "firebase-functions";

const db = getFirestore();

export const insertPoapLinks = https.onRequest(async (req) => {
    const params = JSON.parse(req.body);
    let batch = db.batch();

    for (const [index, url] of params.links.entries()) {
        batch.create(db.collection('poaps').doc(), {
            url,
            used: false
        });

        if (index % 500 === 0) {
            await batch.commit();
            batch = db.batch();
        }
    }
    await batch.commit();
});

