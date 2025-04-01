export type FirestoreDocument<T> = T & {
    id: string;
    ref: FirebaseFirestore.DocumentReference<T>;
}