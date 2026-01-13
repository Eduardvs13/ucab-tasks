/* eslint-disable @typescript-eslint/unbound-method */
import { jest } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesRepository } from './notes.repository';
import { ExportStrategy } from './strategies/export.strategy';
import { Note, NoteSummary } from './entities/note.entity';

describe('NotesService', () => {
  let repo: jest.Mocked<NotesRepository>;
  let strategy: jest.Mocked<ExportStrategy>;
  let service: NotesService;

  const baseNote: Note = {
    id: 'n-1',
    title: 'Alpha',
    content: 'Content A',
    creationDate: new Date('2026-01-01T00:00:00.000Z'),
    modificationDate: new Date('2026-01-02T00:00:00.000Z'),
  };

  beforeEach(() => {
    repo = {
      findAll: jest.fn(),
      findAllWithContent: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      removeMany: jest.fn(),
    } as unknown as jest.Mocked<NotesRepository>;

    strategy = {
      export: jest.fn(),
    } as jest.Mocked<ExportStrategy>;

    service = new NotesService(repo);
  });

  it('getAllNotes translates sort keys and maps dates to ISO', async () => {
    const summaries: NoteSummary[] = [
      {
        id: 'n-1',
        title: 'Alpha',
        creationDate: new Date('2026-01-01T00:00:00.000Z'),
        modificationDate: new Date('2026-01-02T00:00:00.000Z'),
      },
    ];
    repo.findAll.mockResolvedValue(summaries);

    const result = await service.getAllNotes({
      search: 'alp',
      sort: 'createdAt',
      order: 'desc',
    });

    expect(repo.findAll).toHaveBeenCalledWith({
      search: 'alp',
      sort: 'creationDate',
      order: 'desc',
      createdFrom: undefined,
      createdTo: undefined,
      updatedFrom: undefined,
      updatedTo: undefined,
    });
    expect(result).toEqual([
      {
        id: 'n-1',
        title: 'Alpha',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      },
    ]);
  });


  it('getNoteById returns mapped note or throws when missing', async () => {
    repo.findOne.mockResolvedValue(baseNote);
    const found = await service.getNoteById('n-1');
    expect(found).toMatchObject({
      id: 'n-1',
      title: 'Alpha',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    });

    repo.findOne.mockResolvedValue(null);
    await expect(service.getNoteById('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('createNote delegates and maps', async () => {
    const created: Note = {
      ...baseNote,
      id: 'new-id',
      title: 'New',
      content: 'Body',
      creationDate: new Date('2026-01-05T00:00:00.000Z'),
      modificationDate: new Date('2026-01-05T00:00:00.000Z'),
    };
    repo.create.mockResolvedValue(created);

    const result = await service.createNote({ title: 'New', content: 'Body' });

    expect(repo.create).toHaveBeenCalledWith('New', 'Body');
    expect(result).toEqual({
      id: 'new-id',
      title: 'New',
      content: 'Body',
      createdAt: '2026-01-05T00:00:00.000Z',
      updatedAt: '2026-01-05T00:00:00.000Z',
    });
  });

  it('updateNote throws when base note missing or update fails', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(
      service.updateNote('missing', { title: 'x', content: 'y' }),
    ).rejects.toBeInstanceOf(NotFoundException);

    repo.findOne.mockResolvedValue(baseNote);
    repo.update.mockResolvedValue(null);
    await expect(
      service.updateNote('n-1', { title: 'x', content: 'y' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updateNote merges partial payload with existing fields', async () => {
    repo.findOne.mockResolvedValue(baseNote);
    const updated: Note = {
      ...baseNote,
      content: 'Updated Body',
      modificationDate: new Date('2026-01-06T00:00:00.000Z'),
    };
    repo.update.mockResolvedValue(updated);

    const result = await service.updateNote('n-1', { content: 'Updated Body' });

    expect(repo.update).toHaveBeenCalledWith('n-1', 'Alpha', 'Updated Body');
    expect(result).toMatchObject({
      id: 'n-1',
      title: 'Alpha',
      content: 'Updated Body',
      updatedAt: '2026-01-06T00:00:00.000Z',
    });
  });

  it('deleteNote rejects empty ids and missing ids', async () => {
    await expect(service.deleteNote(' , ')).rejects.toBeInstanceOf(
      BadRequestException,
    );

    repo.findAllWithContent.mockResolvedValue([baseNote]);
    await expect(service.deleteNote('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('deleteNote removes single id via remove()', async () => {
    repo.findAllWithContent.mockResolvedValue([baseNote]);
    repo.remove.mockResolvedValue(baseNote);

    const result = await service.deleteNote('n-1');

    expect(repo.remove).toHaveBeenCalledWith('n-1');
    expect(repo.removeMany).not.toHaveBeenCalled();
    expect(result).toEqual([
      {
        id: 'n-1',
        title: 'Alpha',
        content: 'Content A',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      },
    ]);
  });

  it('deleteNote removes multiple ids via removeMany()', async () => {
    const otherNote: Note = {
      ...baseNote,
      id: 'n-2',
      title: 'Beta',
    };
    repo.findAllWithContent.mockResolvedValue([baseNote, otherNote]);
    repo.removeMany.mockResolvedValue([baseNote, otherNote]);

    const result = await service.deleteNote('n-2, n-1, n-1');

    expect(repo.remove).not.toHaveBeenCalled();
    expect(repo.removeMany).toHaveBeenCalledWith(['n-2', 'n-1']);
    expect(result.map((n) => n.id)).toEqual(['n-1', 'n-2']);
  });

  it('exportNotes delegates to strategy with full content', async () => {
    repo.findAllWithContent.mockResolvedValue([baseNote]);
    strategy.export.mockReturnValue('exported');

    const result = await service.exportNotes(strategy);

    expect(repo.findAllWithContent).toHaveBeenCalledTimes(1);
    expect(strategy.export).toHaveBeenCalledWith([baseNote]);
    expect(result).toBe('exported');
  });
});
