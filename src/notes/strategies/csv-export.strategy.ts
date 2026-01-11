import { Note } from '../entities/note.entity';
import { ExportStrategy } from './export.strategy';

export class CsvExportStrategy implements ExportStrategy {
  export(notes: Note[]): string {
    if (notes.length === 0) {
      return 'id,titulo,contenido,fechaCreacion,fechaModificacion';
    }

    const headers = Object.keys(notes[0]).join(',');
    const rows = notes.map(note => {
      return Object.values(note)
        .map(value => {
          const stringValue = String(value);
          // Escapa las comas y las comillas dobles dentro de los valores
          const escapedValue = stringValue.replace(/"/g, '""');
          return stringValue.includes(',') || stringValue.includes('"') ? `"${escapedValue}"` : stringValue;
        })
        .join(',');
    });

    return [headers, ...rows].join('\n');
  }
}