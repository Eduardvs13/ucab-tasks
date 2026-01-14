import { Note } from '../entities/note.entity';
import { ExportStrategy } from './export.strategy';

/**
 * Estrategia para exportar notas en formato CSV.
 * Esta clase proporciona un método para convertir un arreglo de notas en una cadena CSV.
 */
export class CsvExportStrategy implements ExportStrategy {
  /** Serializa notas en CSV con encabezados y valores escapados. */
  export(notes: Note[]): string {
    const headers = [
      'id',
      'title',
      'content',
      'creationDate',
      'modificationDate',
    ];

    const formatValue = (value: unknown): string => {
      if (value === null || value === undefined) {
        return '';
      }
      let stringValue: string;
      if (value instanceof Date) {
        stringValue = value.toISOString();
      } else if (typeof value === 'string') {
        stringValue = value;
      } else if (
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        typeof value === 'bigint'
      ) {
        stringValue = String(value);
      } else if (typeof value === 'symbol') {
        stringValue = value.toString();
      } else {
        stringValue = JSON.stringify(value);
      }
      const escapedValue = stringValue.replace(/"/g, '""');
      return /[",\n\r]/.test(stringValue) ? `"${escapedValue}"` : escapedValue;
    };

    if (notes.length === 0) {
      return headers.join(',');
    }

    const rows = notes.map((note) => {
      const values = [
        note.id,
        note.title,
        note.content,
        note.creationDate,
        note.modificationDate,
      ];
      return values.map(formatValue).join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}
