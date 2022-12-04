import { initializeApp, firestore, apps } from 'firebase-admin';
import {https} from "firebase-functions";
import {createHash} from 'crypto';

if (apps.length === 0) {
    initializeApp();
}
const db = firestore();

export const insertPoapLinks = https.onRequest(async (req, res) => {
    console.log(req.body);
    let batch = db.batch();

    for (const [index, url] of req.body.links.entries()) {
        const hash = createHash('sha256');
        hash.update(url);
        const docId = hash.digest('hex')
        const ref = db.collection('poaps').doc(docId);
        if ((await ref.get()).exists) {
            continue;
        }

        batch.create(ref, {
            url,
            used: false
        });

        if (index % 500 === 0) {
            await batch.commit();
            batch = db.batch();
        }
    }
    await batch.commit();

    res.send('ok');
});

