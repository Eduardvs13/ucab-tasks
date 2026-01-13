import { CsvExportStrategy } from './csv-export.strategy';
import { Note } from '../entities/note.entity';

describe('CsvExportStrategy', () => {
  const baseNote: Note = {
    id: '1',
    title: 'Hello, "world"',
    content: 'Body with, comma',
    creationDate: new Date('2026-01-01T00:00:00.000Z'),
    modificationDate: new Date('2026-01-02T00:00:00.000Z'),
  };

  it('retorna solo cabeceras cuando no hay notas', () => {
    const strategy = new CsvExportStrategy();

    const csv = strategy.export([]);

    expect(csv).toBe('id,title,content,creationDate,modificationDate');
  });

  it('escapa comillas y comas y formatea fechas ISO', () => {
    const strategy = new CsvExportStrategy();
    const note: Note = baseNote;

    const csv = strategy.export([note]);
    const [headers, row] = csv.split('\n');

    expect(headers).toBe('id,title,content,creationDate,modificationDate');
    expect(row).toBe(
      '1,"Hello, ""world""","Body with, comma",2026-01-01T00:00:00.000Z,2026-01-02T00:00:00.000Z',
    );
  });

  it('convierte valores no string usando JSON.stringify o toString', () => {
    const strategy = new CsvExportStrategy();
    const customNote: Note = {
      ...baseNote,
      id: 123 as unknown as string,
      content: { meta: true } as unknown as string,
      creationDate: new Date('2026-01-03T03:00:00.000Z'),
      modificationDate: new Date('2026-01-03T04:00:00.000Z'),
    };

    const csv = strategy.export([customNote]);
    const [, row] = csv.split('\n');

    expect(row).toBe(
      '123,"Hello, ""world""","{""meta"":true}",2026-01-03T03:00:00.000Z,2026-01-03T04:00:00.000Z',
    );
  });
});
