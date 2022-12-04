import {firestore as firestoreEvent} from 'firebase-functions';
import { FieldValue } from 'firebase-admin/firestore';
import { initializeApp,firestore, apps } from 'firebase-admin';

if (apps.length === 0) {
    initializeApp();
}
const db = firestore();

/**
 * Trigger a function with an firestore document created.
 */
export const poapMint = firestoreEvent.document('/users/{userId}/poap/{poapId}').onCreate(async (change, context) => {
    const { userId } = context.params;
    if (!userId) {
        console.warn(`/users/{userId} userId is undefined`);
        return;
    }

    const answers = await db.collection(`/users/${userId}/answers/`).get();
    if (answers.empty) {
        console.warn(`answers dose not exists`);
        return;
    }

    const questionIds = answers.docs.map((doc) => doc.id);

    const batch = db.batch();
    questionIds.forEach((id) => {
        const ref = db.doc(`/questions/${id}`);
        batch.update(ref, {
            count: FieldValue.increment(1)
        });
    });

    const poap = await db.collection('/poaps/').limit(1).get();

    if (poap.empty) {
        console.warn('poap does not exist');
        return;
    }

    const {url} = poap.docs[0].data();

    batch.update(poap.docs[0].ref, {
        used: true
    });
    
    batch.update(change.ref, {
        url,
    });

    await batch.commit();
});

