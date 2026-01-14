import { promises as fs } from 'fs';
import { FileNotesAdapter } from './file-notes.adapter';
import { Note } from '../entities/note.entity';

type FsMock = {
    readFile: jest.MockedFunction<typeof fs.readFile>;
    writeFile: jest.MockedFunction<typeof fs.writeFile>;
};

describe('FileNotesAdapter', () => {
    const fsMock = fs as unknown as FsMock;
    let adapter: FileNotesAdapter;

    beforeEach(() => {
        adapter = new FileNotesAdapter();
        fsMock.readFile = jest.fn();
        fsMock.writeFile = jest.fn();
    });

    it('getAll maps raw notes to entities with Date objects', async () => {
        fsMock.readFile.mockResolvedValue(
            JSON.stringify([
                {
                    id: 'n-1',
                    title: 'A',
                    content: 'C',
                    creationDate: '2026-01-01T00:00:00.000Z',
                    modificationDate: '2026-01-02T00:00:00.000Z',
                },
            ]),
        );

        const notes = await adapter.getAll();

        expect(notes).toHaveLength(1);
        expect(notes[0].creationDate).toBeInstanceOf(Date);
        expect(notes[0].modificationDate.toISOString()).toBe(
            '2026-01-02T00:00:00.000Z',
        );
    });

    it('saveAll writes ISO strings with all fields', async () => {
        const notes: Note[] = [
            {
                id: 'id-1',
                title: 'T',
                content: 'C',
                creationDate: new Date('2026-01-01T00:00:00.000Z'),
                modificationDate: new Date('2026-01-02T00:00:00.000Z'),
            },
        ];

        fsMock.writeFile.mockResolvedValue();

        await adapter.saveAll(notes);

        expect(fsMock.writeFile).toHaveBeenCalledTimes(1);
        const [_path, payload] = fsMock.writeFile.mock.calls[0];
        const normalized = String(_path).replace(/\\/g, '/');
        expect(normalized).toContain('database/notes.json');
        const parsed = JSON.parse(payload as string);
        expect(parsed[0]).toEqual({
            id: 'id-1',
            title: 'T',
            content: 'C',
            creationDate: '2026-01-01T00:00:00.000Z',
            modificationDate: '2026-01-02T00:00:00.000Z',
        });
    });
});
