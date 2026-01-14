import { Note } from '../entities/note.entity';
import { ExportStrategy } from './export.strategy';

/**
 * Estrategia para exportar notas en formato JSON.
 * Convierte un arreglo de notas en una cadena JSON.
 */
export class JsonExportStrategy implements ExportStrategy {
  /** Serializa notas en una cadena JSON formateada. */
  export(notes: Note[]): string {
    return JSON.stringify(notes, null, 2);
  }
}
