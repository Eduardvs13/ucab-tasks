import { Note } from '../entities/note.entity';
import { ExportStrategy } from './export.strategy';

/**
 * Represents a strategy for exporting notes to CSV format.
 * This class provides a method to convert an array of notes into a CSV string.
 */
export class CsvExportStrategy implements ExportStrategy {
  /** Serializes notes into CSV with escaped values and headers. */
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
