import { Note } from '../entities/note.entity';

/** Abstracción para la persistencia de notas, desacoplando almacenamiento de la lógica de dominio. */
export interface NotesStore {
    /** Devuelve todas las notas con contenido. */
    getAll(): Promise<Note[]>;
    /** Persiste el conjunto de notas de forma atómica. */
    saveAll(notes: Note[]): Promise<void>;
}
