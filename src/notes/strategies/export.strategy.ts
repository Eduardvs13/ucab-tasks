import { Note } from '../entities/note.entity';

export interface ExportStrategy {
  export(notes: Note[]): string;
}