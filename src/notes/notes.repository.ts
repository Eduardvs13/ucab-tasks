import { Inject, Injectable } from '@nestjs/common';
import { Note, NoteSummary } from './entities/note.entity';
import { NOTES_STORE } from './tokens';
import type { NotesStore } from './stores/notes.store';
import { NoteFactory } from './factories/note.factory';

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
 * Repositorio para gestionar el almacenamiento de datos de notas.
 */
@Injectable()
export class NotesRepository {
  constructor(
    @Inject(NOTES_STORE) private readonly store: NotesStore,
    private readonly noteFactory: NoteFactory,
  ) { }

  /**
   * Busca todas las notas, con filtros y orden opcionales.
   * @param options - Opciones de búsqueda, orden y filtros.
   * @returns Promesa que resuelve a un arreglo de resúmenes de notas.
   */
  async findAll(options?: FindAllOptions): Promise<NoteSummary[]> {
    const notes = await this.store.getAll();

    let results = notes.slice();

    if (options?.search) {
      const q = options.search.toLowerCase();
      results = results.filter((n) =>
        (n.title ?? '').toLowerCase().includes(q),
      );
    }

    // Filtrado por rango de fechas (creación)
    if (options?.createdFrom) {
      const from = new Date(options.createdFrom).getTime();
      results = results.filter((n) => n.creationDate.getTime() >= from);
    }
    if (options?.createdTo) {
      const to = new Date(options.createdTo).getTime();
      results = results.filter((n) => n.creationDate.getTime() <= to);
    }

    // Filtrado por rango de fechas (modificación)
    if (options?.updatedFrom) {
      const from = new Date(options.updatedFrom).getTime();
      results = results.filter((n) => n.modificationDate.getTime() >= from);
    }
    if (options?.updatedTo) {
      const to = new Date(options.updatedTo).getTime();
      results = results.filter((n) => n.modificationDate.getTime() <= to);
    }

    // Determinar la clave de orden efectiva: si no se provee sort pero existen filtros por fecha,
    // se usa el campo de fecha correspondiente para que `order` aplique.
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
   * Recupera todas las notas incluyendo su contenido.
   * @returns Promesa que resuelve a un arreglo de notas completas.
   */
  async findAllWithContent(): Promise<Note[]> {
    return this.store.getAll();
  }

  /**
   * Busca una nota por su ID.
   * @param id - ID de la nota.
   * @returns Promesa que resuelve a la nota o null si no existe.
   */
  async findOne(id: string): Promise<Note | null> {
    const notes = await this.store.getAll();
    const note = notes.find((n) => n.id === id);
    return note || null;
  }

  /**
   * Crea una nueva nota.
   * @param title - Título de la nueva nota.
   * @param content - Contenido de la nueva nota.
   * @returns Promesa que resuelve a la nota creada.
   */
  async create(title: string, content: string): Promise<Note> {
    const notes = await this.store.getAll();
    const newNote = this.noteFactory.create(title, content);
    notes.push(newNote);
    await this.store.saveAll(notes);
    return newNote;
  }

  /**
   * Actualiza una nota existente.
   * @param id - ID de la nota a actualizar.
   * @param title - Nuevo título de la nota.
   * @param content - Nuevo contenido de la nota.
   * @returns Promesa que resuelve a la nota actualizada o null si no se encontró.
   */
  async update(
    id: string,
    title: string,
    content: string,
  ): Promise<Note | null> {
    const notes = await this.store.getAll();
    const noteIndex = notes.findIndex((n) => n.id === id);

    if (noteIndex === -1) {
      return null;
    }

    const originalNote = notes[noteIndex];
    const updatedNote: Note = this.noteFactory.update(
      originalNote,
      title,
      content,
    );

    notes[noteIndex] = updatedNote;
    await this.store.saveAll(notes);

    return updatedNote;
  }

  /**
   * Elimina una nota por su ID.
   * @param id - ID de la nota a eliminar.
   * @returns Promesa que resuelve a la nota eliminada o null si no se encontró.
   */
  async remove(id: string): Promise<Note | null> {
    const notes = await this.store.getAll();
    const noteIndex = notes.findIndex((n) => n.id === id);
    if (noteIndex === -1) {
      return null;
    }
    const [removedNote] = notes.splice(noteIndex, 1);
    await this.store.saveAll(notes);
    return removedNote;
  }

  /**
   * Elimina múltiples notas por sus IDs.
   * @param ids - Arreglo de IDs de notas a eliminar.
   * @returns Promesa que resuelve a un arreglo de notas eliminadas.
   */
  async removeMany(ids: string[]): Promise<Note[]> {
    const notes = await this.store.getAll();
    const idSet = new Set(ids);

    const remaining = notes.filter((n) => !idSet.has(n.id));
    const removed = notes.filter((n) => idSet.has(n.id));

    if (removed.length === 0) {
      return [];
    }

    await this.store.saveAll(remaining);
    return removed;
  }
}
