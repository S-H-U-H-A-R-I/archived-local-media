import type {
    DocumentReference,
    DocumentSnapshot,
    FieldPath,
    WhereFilterOp
} from "firebase-admin/firestore";

import { admin } from "../config/index.js";
import type { FirestoreDocument } from "./firestore.models.js";


export class FirestoreService {
    #firestore = admin.firestore();

    //#region READ OPERATIONS
    /**
     * ### Get all documents from a collection
     * @param collection The collection to retrieve
     * @returns Array of documents with their IDs and refs
     */
    public async getCollection<T extends object>(
        collection: string
    ): Promise<(FirestoreDocument<T>)[]> {
        try {
            const snapshotRef = this.#firestore.collection(collection);
            const snapshot = await snapshotRef.get();
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ref: doc.ref,
                ...doc.data()
            }) as FirestoreDocument<T>);
        } catch (error) {
            console.error(`Error getting collection ${collection}:`, error);
            throw error;
        }
    }

    /**
     * ### Get a single document by ID
     * @param collection The collection containing the document
     * @param id The document ID to retrieve
     * @returns The document data with ID or null if not found
     */
    public async getDocument<T extends object>(
        collection: string,
        id: string
    ): Promise<FirestoreDocument<T> | null> {
        try {
            const docRef = this.#firestore.collection(collection).doc(id);
            const doc = await docRef.get();
            if (!doc.exists) return null;
            return { id: doc.id, ref: doc.ref, ...doc.data() } as FirestoreDocument<T>;
        } catch (error) {
            console.error(`Error getting document from ${collection}:`, error);
            throw error;
        }
    }
    //#endregion

    //#region WRITE OPERATIONS
    /**
     * ### Delete a document from a collection
     * @param collection The collection containing the document
     * @param id The ID of the document to delete
     */
    public async deleteDocument(collection: string, id: string): Promise<void> {
        try {
            await this.#firestore.collection(collection).doc(id).delete();
        } catch (error) {
            console.error(`Error deleting document from ${collection}:`, error);
            throw error;
        }
    }

    /**
     * ### Add a new document to a collection
     * @param collection The collection to add the document to
     * @param data The document data to add (without ID)
     * @returns The ID of the newly created document
     */
    public async addDocument<T extends object>(
        collection: string, data: Omit<T, 'id'> & Partial<{ id?: string }>
    ): Promise<DocumentReference> {
        try {
            return await this.#firestore.collection(collection).add(data);
        } catch (error) {
            console.error(`Error adding document to ${collection}:`, error);
            throw error;
        }
    }

    /**
     * ### Update an existing document
     * @param collection The collection containing the document
     * @param id The ID of the document to update
     * @param data The partial data to update
     */
    public async updateDocument<T extends object>(
        collection: string,
        id: string,
        data: Partial<Omit<T, 'id'>>
    ): Promise<void> {
        try {
            await this.#firestore.collection(collection).doc(id).update(data);
        } catch (error) {
            console.error(`Error updating document in ${collection}:`, error);
            throw error;
        }
    }
    //#endregion

    //#region QUERY OPERATIONS
    /**
     * ### Query documents based on field value
     * @param collection The collection to query
     * @param field The field to filter on
     * @param operator The comparison operator
     * @param value The value to compare against
     * @returns Array of matching documents with their IDs
     */
    public async queryDocument<T extends object>(
        collection: string,
        field: string | FieldPath,
        operator: WhereFilterOp,
        value: unknown
    ): Promise<FirestoreDocument<T>[]> {
        try {
            const snapshot = await this.#firestore
                .collection(collection)
                .where(field, operator, value)
                .get();
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ref: doc.ref,
                ...doc.data()
            }) as FirestoreDocument<T>);
        } catch (error) {
            console.error(`Error querying documents in ${collection}:`, error);
            throw error;
        }
    }
    //#endregion

    //#region SUBSCRIPTION OPERATIONS
    /**
     * ### Subscribe to real-time updates on a specific document
     * @param collection The collection containing the document
     * @param id The document ID to subscribe to
     * @param callback Function to call when data changes
     * @returns An unsubscribe function to stop listening
     */
    public subscribeToDocument<T extends object>(
        collection: string,
        id: string,
        callback: (data: FirestoreDocument<T> | null) => void
    ): () => void {
        const unsubscribe = this.#firestore.collection(collection).doc(id).onSnapshot(
            (doc) => {
                if (!doc.exists) {
                    callback(null);
                    return;
                }

                const data = {
                    id: doc.id,
                    ref: doc.ref,
                    ...doc.data(),
                } as FirestoreDocument<T>;

                callback(data);
            },
            (error) => {
                console.error(`Error in document subscription for ${collection}/${id}:`, error);
            }
        );

        return unsubscribe;
    }

    /**
      * ### Subscribe to real-time updates on a collection
      * @param collection The collection to subscribe to
      * @param callback Function to call when data changes
      * @returns An unsubscribe function to stop listening
      */
    public subscribeToCollection<T extends object>(
        collection: string,
        callback: (data: FirestoreDocument<T>[]) => void
    ): () => void {
        const unsubscribe = this.#firestore.collection(collection).onSnapshot(
            (snapshot) => {
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ref: doc.ref,
                    ...doc.data()
                }) as FirestoreDocument<T>);
                callback(data);
            },
            (error) => {
                console.error(`Error in collection subscription for ${collection}`, error);
            }
        );

        return unsubscribe;
    }

    /**
     * ### Subscribe to real-time updates on a query
     * @param collection The collection to query
     * @param field The field to filter on
     * @param operator The comparison operator
     * @param value The value to compare against
     * @param callback Function to call when data changes
     * @returns An unsubscribe function to stop listening
     */
    public subscribeToQuery<T extends object>(
        collection: string,
        field: string | FieldPath,
        operator: WhereFilterOp,
        value: unknown,
        callback: (data: FirestoreDocument<T>[]) => void
    ): () => void {
        const unsubscribe = this.#firestore
            .collection(collection)
            .where(field, operator, value)
            .onSnapshot(
                (snapshot) => {
                    const data = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ref: doc.ref,
                        ...doc.data(),
                    }) as FirestoreDocument<T>);
                    callback(data);
                },
                (error) => {
                    console.error(`Error in query subscription for ${collection}:`, error);
                }
            );

        return unsubscribe;
    }
    //#endregion

    public getConverter<T>(): {
        toFirestore: (data: T) => T;
        fromFirestore: (snap: DocumentSnapshot) => T;
    } {
        return {
            toFirestore: (data: T) => data,
            fromFirestore: (snap: DocumentSnapshot) => snap.data() as T,
        };
    }
}

const firestoreService = new FirestoreService();
export default firestoreService;