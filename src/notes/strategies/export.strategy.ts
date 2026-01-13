import { Note } from '../entities/note.entity';

/**
 * Defines the interface for an export strategy.
 * Any class that implements this interface must provide a method to export notes.
 */
export interface ExportStrategy {
  export(notes: Note[]): string;
}
