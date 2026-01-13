import { Note } from '../entities/note.entity';
import { ExportStrategy } from './export.strategy';

/**
 * Represents a strategy for exporting notes to JSON format.
 * This class provides a method to convert an array of notes into a JSON string.
 */
export class JsonExportStrategy implements ExportStrategy {
  /** Serializes notes into a formatted JSON string. */
  export(notes: Note[]): string {
    return JSON.stringify(notes, null, 2);
  }
}
