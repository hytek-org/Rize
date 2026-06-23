import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useAuth } from '@/contexts/AuthProvider';
import { Note } from '@/types/notes';

import {
  getRemoteNotes,
  uploadNote,
} from '@/lib/notesFirestore';

interface NotesContextType {
  notes: Note[];
  addNote: (content: string, tag?: string) => void;
  editNote: (id: string, content: string, tag?: string) => void;
  deleteNote: (id: string) => void;
  syncNotes: () => Promise<void>;
  syncing: boolean;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const useNotes = () => {
  const context = useContext(NotesContext);

  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }

  return context;
};

const STORAGE_KEY = '@notes';

export const NotesProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();

  /**
   * Only ACTIVE notes are exposed to the UI.
   *
   * Deleted notes remain inside AsyncStorage as tombstones.
   */
  const [notes, setNotes] = useState<Note[]>([]);

  const [allNotes, setAllNotes] = useState<Note[]>([]);

  const [storageLoaded, setStorageLoaded] = useState(false);

  const [syncing, setSyncing] = useState(false);

  /**
   * Convert:
   * DD/MM/YYYY HH:mm:ss
   * into a timestamp.
   */
  const parseIndianDate = useCallback((dateString: string): number => {
    try {
      const [datePart, timePart = '00:00:00'] =
        dateString.split(' ');

      const [day, month, year] =
        datePart.split('/').map(Number);

      const [hours = 0, minutes = 0, seconds = 0] =
        timePart.split(':').map(Number);

      const parsedDate = new Date(
        year,
        month - 1,
        day,
        hours,
        minutes,
        seconds
      );

      const timestamp = parsedDate.getTime();

      return Number.isFinite(timestamp)
        ? timestamp
        : Date.now();
    } catch {
      return Date.now();
    }
  }, []);

  const formatDateToIndian = useCallback((date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1)
      .toString()
      .padStart(2, '0');

    const year = date.getFullYear();

    const hours = date.getHours()
      .toString()
      .padStart(2, '0');

    const minutes = date.getMinutes()
      .toString()
      .padStart(2, '0');

    const seconds = date.getSeconds()
      .toString()
      .padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }, []);

  const generateNoteId = useCallback(() => {
    return `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  }, []);

  /**
   * Convert old v1 note -> current Note.
   */
  const migrateNote = useCallback(
    (rawNote: Partial<Note>): Note => {
      const fallbackTimestamp = Date.now();

      const dateTimestamp =
        typeof rawNote.date === 'string'
          ? parseIndianDate(rawNote.date)
          : fallbackTimestamp;

      const content =
        typeof rawNote.content === 'string'
          ? rawNote.content
          : '';

      const contentPreview =
        typeof rawNote.contentPreview === 'string'
          ? rawNote.contentPreview
          : content.substring(0, 150);

      const createdAt =
        typeof rawNote.createdAt === 'number'
          ? rawNote.createdAt
          : dateTimestamp;

      const updatedAt =
        typeof rawNote.updatedAt === 'number'
          ? rawNote.updatedAt
          : dateTimestamp;

      return {
        id:
          typeof rawNote.id === 'string' &&
          rawNote.id.trim().length > 0
            ? rawNote.id
            : generateNoteId(),

        content,

        contentPreview,

        tag:
          typeof rawNote.tag === 'string'
            ? rawNote.tag
            : 'Untagged',

        date:
          typeof rawNote.date === 'string'
            ? rawNote.date
            : formatDateToIndian(
                new Date(updatedAt)
              ),

        createdAt,

        updatedAt,

        deleted:
          typeof rawNote.deleted === 'boolean'
            ? rawNote.deleted
            : false,

        ...(typeof rawNote.deletedAt === 'number'
          ? {
              deletedAt: rawNote.deletedAt,
            }
          : {}),

        version:
          typeof rawNote.version === 'number'
            ? rawNote.version
            : 1,
      };
    },
    [
      parseIndianDate,
      generateNoteId,
      formatDateToIndian,
    ]
  );

  /**
   * Write the complete local dataset.
   *
   * `allNotes` includes deleted tombstones.
   * UI gets only active notes.
   */
  const saveAllNotes = useCallback(
    async (updatedNotes: Note[]) => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(updatedNotes)
        );

        setAllNotes(updatedNotes);

        setNotes(
          updatedNotes
            .filter(note => !note.deleted)
            .sort(
              (a, b) =>
                b.updatedAt - a.updatedAt
            )
        );
      } catch (error) {
        console.error(
          'Failed to save notes:',
          error
        );
      }
    },
    []
  );

  /**
   * Initial local load + v1 migration.
   */
  useEffect(() => {
    const loadLocalNotes = async () => {
      try {
        const storedNotes =
          await AsyncStorage.getItem(STORAGE_KEY);

        if (!storedNotes) {
          setAllNotes([]);
          setNotes([]);
          setStorageLoaded(true);
          return;
        }

        const parsed: unknown =
          JSON.parse(storedNotes);

        if (!Array.isArray(parsed)) {
          console.warn(
            'Invalid @notes data.'
          );

          setAllNotes([]);
          setNotes([]);
          setStorageLoaded(true);
          return;
        }

        /**
         * This handles both:
         *
         * v1:
         * id/content/date...
         *
         * v2:
         * id/content/date/createdAt/...
         */
        const migratedNotes: Note[] =
          parsed.map(item =>
            migrateNote(
              item as Partial<Note>
            )
          );

        /**
         * Immediately rewrite @notes using
         * the new schema.
         */
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(migratedNotes)
        );

        setAllNotes(migratedNotes);

        setNotes(
          migratedNotes
            .filter(note => !note.deleted)
            .sort(
              (a, b) =>
                b.updatedAt - a.updatedAt
            )
        );

        console.log(
          '[Notes] Local migration completed:',
          migratedNotes.length
        );
      } catch (error) {
        console.error(
          '[Notes] Failed to load/migrate:',
          error
        );
      } finally {
        setStorageLoaded(true);
      }
    };

    void loadLocalNotes();
  }, [migrateNote]);

  /**
   * Merge local + Firestore.
   *
   * Rule:
   * - same ID + local newer => local wins
   * - same ID + remote newer => remote wins
   * - only local => upload later
   * - only remote => download
   */
  const syncNotes = useCallback(async () => {
    if (!user) {
      return;
    }

    if (!storageLoaded) {
      return;
    }

    if (syncing) {
      return;
    }

    setSyncing(true);

    try {
      const remoteNotes =
        await getRemoteNotes(user.uid);

      const localMap = new Map(
        allNotes.map(note => [
          note.id,
          note,
        ])
      );

      const remoteMap = new Map(
        remoteNotes.map(note => [
          note.id,
          note,
        ])
      );

      const mergedMap = new Map<
        string,
        Note
      >();

      /**
       * First add all local notes.
       */
      for (const localNote of allNotes) {
        mergedMap.set(
          localNote.id,
          localNote
        );
      }

      /**
       * Compare remote notes.
       */
      for (const remoteNote of remoteNotes) {
        const localNote =
          localMap.get(remoteNote.id);

        if (!localNote) {
          /**
           * Only exists remotely.
           * Download it.
           */
          mergedMap.set(
            remoteNote.id,
            remoteNote
          );

          continue;
        }

        /**
         * Remote is newer.
         */
        if (
          remoteNote.updatedAt >
          localNote.updatedAt
        ) {
          mergedMap.set(
            remoteNote.id,
            remoteNote
          );
        } else {
          /**
           * Local is newer or equal.
           *
           * Keep local.
           */
          mergedMap.set(
            localNote.id,
            localNote
          );
        }
      }

      const mergedNotes = Array.from(
        mergedMap.values()
      );

      /**
       * Save merged data locally first.
       */
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(mergedNotes)
      );

      setAllNotes(mergedNotes);

      setNotes(
        mergedNotes
          .filter(note => !note.deleted)
          .sort(
            (a, b) =>
              b.updatedAt - a.updatedAt
          )
      );

      /**
       * Upload anything that:
       *
       * - exists only locally
       * - local version is newer
       */
      for (const mergedNote of mergedNotes) {
        const remoteNote =
          remoteMap.get(mergedNote.id);

        if (
          !remoteNote ||
          mergedNote.updatedAt >
            remoteNote.updatedAt
        ) {
          try {
            await uploadNote(
              user.uid,
              mergedNote
            );
          } catch (uploadError) {
            console.error(
              `[Notes] Failed to upload ${mergedNote.id}:`,
              uploadError
            );
          }
        }
      }

      console.log(
        `[Notes] Sync completed. Local: ${mergedNotes.length}, Remote: ${remoteNotes.length}`
      );
    } catch (error) {
      /**
       * IMPORTANT:
       * Sync failure must NOT break local notes.
       */
      console.error(
        '[Notes] Sync failed:',
        error
      );
    } finally {
      setSyncing(false);
    }
  }, [
    user,
    storageLoaded,
    allNotes,
    syncing,
  ]);

  /**
   * Automatically synchronize once:
   *
   * - AsyncStorage is loaded
   * - Firebase Auth has finished restoring
   * - user exists
   */
  useEffect(() => {
    if (
      storageLoaded &&
      !authLoading &&
      user
    ) {
      void syncNotes();
    }
  }, [
    storageLoaded,
    authLoading,
    user,
    syncNotes,
  ]);

  /**
   * Add local note immediately.
   *
   * Firestore sync happens through the effect below.
   */
  const addNote = useCallback(
    (
      content: string,
      tag: string = ''
    ) => {
      const now = Date.now();

      const trimmedContent =
        content.trim();

      const newNote: Note = {
        id: generateNoteId(),

        content: trimmedContent,

        contentPreview:
          trimmedContent.substring(0, 150),

        tag:
          tag.trim() || 'Untagged',

        date:
          formatDateToIndian(
            new Date(now)
          ),

        createdAt: now,

        updatedAt: now,

        deleted: false,

        version: 1,
      };

      void saveAllNotes([
        ...allNotes,
        newNote,
      ]);
    },
    [
      allNotes,
      generateNoteId,
      formatDateToIndian,
      saveAllNotes,
    ]
  );

  const editNote = useCallback(
    (
      id: string,
      content: string,
      tag: string = ''
    ) => {
      const now = Date.now();

      const updatedNotes =
        allNotes.map(note => {
          if (note.id !== id) {
            return note;
          }

          return {
            ...note,

            content: content.trim(),

            contentPreview:
              content
                .trim()
                .substring(0, 150),

            tag:
              tag.trim() || 'Untagged',

            date:
              formatDateToIndian(
                new Date(now)
              ),

            updatedAt: now,

            version:
              note.version + 1,

            deleted: false,

            deletedAt: undefined,
          };
        });

      void saveAllNotes(updatedNotes);
    },
    [
      allNotes,
      formatDateToIndian,
      saveAllNotes,
    ]
  );

  const deleteNote = useCallback(
    (id: string) => {
      const now = Date.now();

      const updatedNotes =
        allNotes.map(note => {
          if (note.id !== id) {
            return note;
          }

          return {
            ...note,

            updatedAt: now,

            deleted: true,

            deletedAt: now,

            version:
              note.version + 1,
          };
        });

      void saveAllNotes(updatedNotes);
    },
    [allNotes, saveAllNotes]
  );

  return (
    <NotesContext.Provider
      value={{
        notes,
        addNote,
        editNote,
        deleteNote,
        syncNotes,
        syncing,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};