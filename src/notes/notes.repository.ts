import { promises as fs } from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { Note, NoteSummary } from './entities/note.entity';
import { randomUUID } from 'crypto';

const dbPath = path.resolve(__dirname, '..', '..', 'database', 'notes.json');

type RawNote = {
  id: string;
  title: string;
  content: string;
  creationDate: string;
  modificationDate: string;
};

export type FindAllOptions = {
  search?: string;
  sort?: 'title' | 'creationDate' | 'modificationDate';
  order?: 'asc' | 'desc';
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
};

/**
 * Repository for handling note data storage.
 */
@Injectable()
export class NotesRepository {
  /**
   * Reads all notes from the database file.
   * @returns A promise that resolves to an array of notes.
   */
  private async readAllNotes(): Promise<Note[]> {
    const data = await fs.readFile(dbPath, 'utf-8');
    const raw = JSON.parse(data) as RawNote[];
    return raw.map(
      (n): Note => ({
        id: n.id,
        title: n.title,
        content: n.content,
        creationDate: new Date(n.creationDate),
        modificationDate: new Date(n.modificationDate),
      }),
    );
  }

  /**
   * Finds all notes, with optional filtering and sorting.
   * @param options - Options for searching, sorting, and filtering.
   * @returns A promise that resolves to an array of note summaries.
   */
  async findAll(options?: FindAllOptions): Promise<NoteSummary[]> {
    const notes = await this.readAllNotes();

    let results = notes.slice();

    if (options?.search) {
      const q = options.search.toLowerCase();
      results = results.filter((n) =>
        (n.title ?? '').toLowerCase().includes(q),
      );
    }

    // Date range filtering (creation)
    if (options?.createdFrom) {
      const from = new Date(options.createdFrom).getTime();
      results = results.filter((n) => n.creationDate.getTime() >= from);
    }
    if (options?.createdTo) {
      const to = new Date(options.createdTo).getTime();
      results = results.filter((n) => n.creationDate.getTime() <= to);
    }

    // Date range filtering (modification)
    if (options?.updatedFrom) {
      const from = new Date(options.updatedFrom).getTime();
      results = results.filter((n) => n.modificationDate.getTime() >= from);
    }
    if (options?.updatedTo) {
      const to = new Date(options.updatedTo).getTime();
      results = results.filter((n) => n.modificationDate.getTime() <= to);
    }

    // Determine effective sort key: if sort not provided but date filters exist,
    // default to the corresponding date field so `order` still applies.
    let effectiveSort = options?.sort;
    if (!effectiveSort) {
      if (options?.createdFrom || options?.createdTo) {
        effectiveSort = 'creationDate';
      } else if (options?.updatedFrom || options?.updatedTo) {
        effectiveSort = 'modificationDate';
      }
    }

    if (effectiveSort) {
      const orderMultiplier = options?.order?.toLowerCase() === 'desc' ? -1 : 1;
      const key = effectiveSort;
      results.sort((a, b) => {
        if (key === 'title') {
          return (
            String(a.title || '').localeCompare(String(b.title || '')) *
            orderMultiplier
          );
        }
        if (key === 'creationDate' || key === 'modificationDate') {
          const da =
            key === 'creationDate'
              ? a.creationDate.getTime()
              : a.modificationDate.getTime();
          const db =
            key === 'creationDate'
              ? b.creationDate.getTime()
              : b.modificationDate.getTime();
          return (da - db) * orderMultiplier;
        }
        return 0;
      });
    }

    return results.map((note) => ({
      id: note.id,
      title: note.title,
      creationDate: note.creationDate,
      modificationDate: note.modificationDate,
    }));
  }

  /**
   * Retrieves all notes including their content.
   * @returns A promise that resolves to an array of full note objects.
   */
  async findAllWithContent(): Promise<Note[]> {
    return this.readAllNotes();
  }

  /**
   * Finds a single note by its ID.
   * @param id - The ID of the note to find.
   * @returns A promise that resolves to the note or null if not found.
   */
  async findOne(id: string): Promise<Note | null> {
    const notes = await this.readAllNotes();
    const note = notes.find((n) => n.id === id);
    return note || null;
  }

  /**
   * Creates a new note.
   * @param title - The title of the new note.
   * @param content - The content of the new note.
   * @returns A promise that resolves to the newly created note.
   */
  async create(title: string, content: string): Promise<Note> {
    const notes = await this.readAllNotes();
    const now = new Date();
    const newNote: Note = {
      id: randomUUID(),
      title,
      content,
      creationDate: now,
      modificationDate: now,
    };
    notes.push(newNote);
    await fs.writeFile(dbPath, JSON.stringify(notes, null, 2));
    return newNote;
  }

  /**
   * Updates an existing note.
   * @param id - The ID of the note to update.
   * @param title - The new title for the note.
   * @param content - The new content for the note.
   * @returns A promise that resolves to the updated note or null if not found.
   */
  async update(
    id: string,
    title: string,
    content: string,
  ): Promise<Note | null> {
    const notes = await this.readAllNotes();
    const noteIndex = notes.findIndex((n) => n.id === id);

    if (noteIndex === -1) {
      return null;
    }

    const originalNote = notes[noteIndex];
    const updatedNote: Note = {
      ...originalNote,
      title: title,
      content: content,
      modificationDate: new Date(),
    };

    notes[noteIndex] = updatedNote;
    await fs.writeFile(dbPath, JSON.stringify(notes, null, 2));

    return updatedNote;
  }

  /**
   * Removes a single note by its ID.
   * @param id - The ID of the note to remove.
   * @returns A promise that resolves to the removed note or null if not found.
   */
  async remove(id: string): Promise<Note | null> {
    const notes = await this.readAllNotes();
    const noteIndex = notes.findIndex((n) => n.id === id);
    if (noteIndex === -1) {
      return null;
    }
    const [removedNote] = notes.splice(noteIndex, 1);
    await fs.writeFile(dbPath, JSON.stringify(notes, null, 2));
    return removedNote;
  }

  /**
   * Removes multiple notes by their IDs.
   * @param ids - An array of note IDs to remove.
   * @returns A promise that resolves to an array of the removed notes.
   */
  async removeMany(ids: string[]): Promise<Note[]> {
    const notes = await this.readAllNotes();
    const idSet = new Set(ids);

    const remaining = notes.filter((n) => !idSet.has(n.id));
    const removed = notes.filter((n) => idSet.has(n.id));

    if (removed.length === 0) {
      return [];
    }

    await fs.writeFile(dbPath, JSON.stringify(remaining, null, 2));
    return removed;
  }
}
