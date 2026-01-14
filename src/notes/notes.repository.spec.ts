import { jest } from '@jest/globals';
import { randomUUID } from 'crypto';
import { NotesRepository } from './notes.repository';
import { NotesStore } from './stores/notes.store';
import { Note } from './entities/note.entity';
import { NoteFactory } from './factories/note.factory';

jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'mock-uuid'),
}));

describe('NotesRepository', () => {
  const uuidMock = randomUUID as jest.Mock;
  let repo: NotesRepository;
  let store: jest.Mocked<NotesStore>;
  let storeData: Note[];

  const baseNotes = (): Note[] => [
    {
      id: 'n-1',
      title: 'Alpha',
      content: 'Content A',
      creationDate: new Date('2026-01-01T00:00:00.000Z'),
      modificationDate: new Date('2026-01-01T00:00:00.000Z'),
    },
    {
      id: 'n-2',
      title: 'Beta',
      content: 'Content B',
      creationDate: new Date('2026-01-02T12:00:00.000Z'),
      modificationDate: new Date('2026-01-02T12:00:00.000Z'),
    },
    {
      id: 'n-3',
      title: 'Gamma',
      content: 'Content C',
      creationDate: new Date('2026-01-03T06:00:00.000Z'),
      modificationDate: new Date('2026-01-04T06:00:00.000Z'),
    },
  ];

  const cloneNote = (n: Note): Note => ({
    ...n,
    creationDate: new Date(n.creationDate),
    modificationDate: new Date(n.modificationDate),
  });

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-10T10:00:00.000Z'));
    storeData = baseNotes();
    store = {
      getAll: jest.fn(async () => storeData.map(cloneNote)),
      saveAll: jest.fn(async (notes: Note[]) => {
        storeData = notes.map(cloneNote);
      }),
    } as jest.Mocked<NotesStore>;

    repo = new NotesRepository(store, new NoteFactory());
    uuidMock.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('findAll returns summaries without content and applies search + order', async () => {
    const summaries = await repo.findAll({
      search: 'a',
      sort: 'title',
      order: 'asc',
    });
    expect(
      summaries.map((s) => ({
        id: s.id,
        title: s.title,
      })),
    ).toEqual([
      { id: 'n-1', title: 'Alpha' },
      { id: 'n-2', title: 'Beta' },
      { id: 'n-3', title: 'Gamma' },
    ]);
    // content must not be present in summaries
    summaries.forEach((s) => {
      expect((s as Partial<{ content: unknown }>).content).toBeUndefined();
    });
  });

  it('findAll filters by created range and infers creation sort when order provided', async () => {
    const summaries = await repo.findAll({
      createdFrom: '2026-01-02T00:00:00.000Z',
      order: 'desc',
    });
    expect(summaries.map((s) => s.id)).toEqual(['n-3', 'n-2']);
  });

  it('findAll filters by updated range', async () => {
    const summaries = await repo.findAll({
      updatedFrom: '2026-01-04T00:00:00.000Z',
    });
    expect(summaries.map((s) => s.id)).toEqual(['n-3']);
  });

  it('findAll leaves order intact when no sort or filters are provided', async () => {
    const summaries = await repo.findAll();
    expect(summaries.map((s) => s.id)).toEqual(['n-1', 'n-2', 'n-3']);
  });

  it('findAll respects sort by modificationDate and order desc', async () => {
    const summaries = await repo.findAll({
      sort: 'modificationDate',
      order: 'desc',
    });
    expect(summaries.map((s) => s.id)).toEqual(['n-3', 'n-2', 'n-1']);
  });

  it('findAll ignores empty search and keeps full list', async () => {
    const summaries = await repo.findAll({ search: '' });
    expect(summaries.map((s) => s.id)).toEqual(['n-1', 'n-2', 'n-3']);
  });

  it('findOne returns note or null', async () => {
    expect((await repo.findOne('n-2'))?.id).toBe('n-2');
    expect(await repo.findOne('missing')).toBeNull();
  });

  it('create writes a new note with fresh ids and timestamps', async () => {
    uuidMock.mockReturnValue('new-id');

    const created = await repo.create('New Title', 'New Content');

    expect(created).toMatchObject({
      id: 'new-id',
      title: 'New Title',
      content: 'New Content',
    });
    expect(created.creationDate.toISOString()).toBe('2026-01-10T10:00:00.000Z');
    expect(created.modificationDate.toISOString()).toBe(
      '2026-01-10T10:00:00.000Z',
    );
    expect(store.saveAll).toHaveBeenCalledTimes(1);
  });

  it('update modifies title/content and bumps modificationDate; null when missing', async () => {
    const updated = await repo.update('n-2', 'Beta Updated', 'Content B+');

    expect(updated?.title).toBe('Beta Updated');
    expect(updated?.content).toBe('Content B+');
    expect(updated?.modificationDate.toISOString()).toBe(
      '2026-01-10T10:00:00.000Z',
    );
    expect(updated?.creationDate.toISOString()).toBe(
      '2026-01-02T12:00:00.000Z',
    );
    expect(store.saveAll).toHaveBeenCalledTimes(1);

    store.saveAll.mockClear();
    const missing = await repo.update('missing', 'T', 'C');
    expect(missing).toBeNull();
    expect(store.saveAll).not.toHaveBeenCalled();
  });

  it('remove deletes a note by id or returns null when missing', async () => {
    const removed = await repo.remove('n-1');
    expect(removed?.id).toBe('n-1');
    expect(store.saveAll).toHaveBeenCalledTimes(1);

    store.saveAll.mockClear();
    const missing = await repo.remove('missing');
    expect(missing).toBeNull();
    expect(store.saveAll).not.toHaveBeenCalled();
  });

  it('removeMany deletes multiple and skips write when none found', async () => {
    const removed = await repo.removeMany(['n-2', 'n-3']);
    expect(removed.map((n) => n.id)).toEqual(['n-2', 'n-3']);
    expect(store.saveAll).toHaveBeenCalledTimes(1);

    store.saveAll.mockClear();
    const none = await repo.removeMany(['missing']);
    expect(none).toEqual([]);
    expect(store.saveAll).not.toHaveBeenCalled();
  });

  it('removeMany deletes only existing IDs when mixed', async () => {
    const removed = await repo.removeMany(['n-1', 'missing', 'n-3']);
    expect(removed.map((n) => n.id)).toEqual(['n-1', 'n-3']);
    expect(store.saveAll).toHaveBeenCalledTimes(1);
  });

  it('findAllWithContent returns full notes including content', async () => {
    const notes = await repo.findAllWithContent();
    expect(notes).toHaveLength(3);
    expect(notes[0].content).toBeDefined();
    expect(notes[1].content).toBeDefined();
  });

  it('findAll handles createdTo without createdFrom and title sort desc', async () => {
    const summaries = await repo.findAll({
      createdTo: '2026-01-02T23:59:59.000Z',
      sort: 'title',
      order: 'desc',
    });
    expect(summaries.map((s) => s.id)).toEqual(['n-2', 'n-1']);
  });

  it('create appends note preserving previous entries', async () => {
    uuidMock.mockReturnValue('new-id-2');
    const created = await repo.create('Extra', 'More');
    expect(created.id).toBe('new-id-2');
    expect(store.saveAll).toHaveBeenCalledTimes(1);
    // ensure previous notes remain
    expect(storeData).toHaveLength(4);
    expect(storeData.find((n) => n.id === 'n-1')).toBeDefined();
  });
});
