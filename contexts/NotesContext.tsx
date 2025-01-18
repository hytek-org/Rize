import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Note {
  id: string;
  contentPreview: string;
  content: string;
  tag: string; // Make tag required but allow empty string
  date: string;
}

interface NotesContextType {
  notes: Note[];
  addNote: (content: string, tag?: string) => void;
  editNote: (id: string, content: string, tag?: string) => void;
  deleteNote: (id: string) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);

  const formatDateToIndian = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const storedNotes = await AsyncStorage.getItem('@notes');
        if (storedNotes) {
          const parsedNotes: Note[] = JSON.parse(storedNotes);
          setNotes(parsedNotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
      } catch (error) {
        console.error('Failed to load notes:', error);
      }
    };
    loadNotes();
  }, []);

  const saveNotes = async (newNotes: Note[]) => {
    try {
      await AsyncStorage.setItem('@notes', JSON.stringify(newNotes));
      setNotes(newNotes);
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const addNote = (content: string, tag: string = '') => {
    const newNote: Note = {
      id: Date.now().toString(),
      contentPreview: content.trim().substring(0, 150),
      content:content.trim(),
      tag: tag.trim() || 'Untagged',
      date: formatDateToIndian(new Date()),
    };
    const updatedNotes = [...notes, newNote];
    saveNotes(updatedNotes);
  };

  const editNote = (id: string, content: string, tag: string = '') => {
    const updatedNotes = notes.map(note =>
      note.id === id ? { 
        ...note, 
        content,
        contentPreview: content.substring(0, 150), // Add preview update
        tag: tag.trim() || 'Untagged',
        date: formatDateToIndian(new Date()) 
      } : note
    );
    saveNotes(updatedNotes);
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    saveNotes(updatedNotes);
  };

  return (
    <NotesContext.Provider value={{ notes, addNote, editNote, deleteNote }}>
      {children}
    </NotesContext.Provider>
  );
};
