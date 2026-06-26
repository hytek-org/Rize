import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';

import { Note } from '@/types/notes';
import { db } from '@/firebase.config';

const notesCollection = (uid: string) => {
  return collection(db, 'users', uid, 'notes');
};

/**
 * Upload/create/update one note.
 *
 * Firestore document:
 * users/{uid}/notes/{noteId}
 */
export async function uploadNote(
  uid: string,
  note: Note
): Promise<void> {
  const ref = doc(
    notesCollection(uid),
    note.id
  );

  const noteData = {
    id: note.id,
    content: note.content,
    contentPreview: note.contentPreview,
    date: note.date,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    deleted: note.deleted,
    version: note.version,

    ...(note.tag !== undefined
      ? { tag: note.tag }
      : {}),

    ...(note.deletedAt !== undefined
      ? { deletedAt: note.deletedAt }
      : {}),
  };

  await setDoc(ref, noteData);
}

/**
 * Hard delete from Firestore.
 *
 * DON'T use this for normal user deletion.
 *
 * Keep it for permanent cleanup later.
 */
export async function deleteRemoteNote(
  uid: string,
  noteId: string
): Promise<void> {
  const ref = doc(
    notesCollection(uid),
    noteId
  );

  await deleteDoc(ref);
}

/**
 * Get all notes for one authenticated user.
 */
export async function getRemoteNotes(
  uid: string
): Promise<Note[]> {
  const snapshot = await getDocs(
    notesCollection(uid)
  );

  return snapshot.docs.map(docSnap => {
    const data = docSnap.data();

    return {
      id: docSnap.id,

      content:
        typeof data.content === 'string'
          ? data.content
          : '',

      contentPreview:
        typeof data.contentPreview === 'string'
          ? data.contentPreview
          : '',

      date:
        typeof data.date === 'string'
          ? data.date
          : '',

      ...(typeof data.tag === 'string'
        ? { tag: data.tag }
        : {}),

      createdAt:
        typeof data.createdAt === 'number'
          ? data.createdAt
          : Date.now(),

      updatedAt:
        typeof data.updatedAt === 'number'
          ? data.updatedAt
          : Date.now(),

      deleted:
        typeof data.deleted === 'boolean'
          ? data.deleted
          : false,

      ...(typeof data.deletedAt === 'number'
        ? { deletedAt: data.deletedAt }
        : {}),

      version:
        typeof data.version === 'number'
          ? data.version
          : 1,
    };
  });
}