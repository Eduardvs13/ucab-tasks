import { JsonExportStrategy } from './json-export.strategy';
import { Note } from '../entities/note.entity';

describe('JsonExportStrategy', () => {
  it('serializes notes with 2-space indentation', () => {
    const strategy = new JsonExportStrategy();
    const notes: Note[] = [
      {
        id: '1',
        title: 'A',
        content: 'Body',
        creationDate: new Date('2026-01-01T00:00:00.000Z'),
        modificationDate: new Date('2026-01-02T00:00:00.000Z'),
      },
    ];

    const json = strategy.export(notes);

    expect(json).toBe(JSON.stringify(notes, null, 2));
  });
});
