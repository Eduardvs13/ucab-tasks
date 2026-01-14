import { Note } from '../entities/note.entity';

/**
 * Define la interfaz para una estrategia de exportación.
 * Cualquier clase que la implemente debe proveer un método para exportar notas.
 */
export interface ExportStrategy {
  export(notes: Note[]): string;
}
