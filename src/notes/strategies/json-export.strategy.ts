import { Note } from '../entities/note.entity';
import { ExportStrategy } from './export.strategy';

export class JsonExportStrategy implements ExportStrategy {
  export(notes: Note[]): string {
    return JSON.stringify(notes, null, 2);
  }
}