/* eslint-disable @typescript-eslint/unbound-method */
import { jest } from '@jest/globals';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { ListNotesQueryDto } from './dto/list-notes.dto';
import { ExportStrategyFactory } from './strategies/export-strategy.factory';
import { ExportStrategy } from './strategies/export.strategy';

type NotesServiceMock = jest.Mocked<NotesService>;

type HeaderSetter = { setHeader: jest.Mock };

describe('NotesController', () => {
  let controller: NotesController;
  let service: NotesServiceMock;
  let factory: jest.Mocked<ExportStrategyFactory>;
  let res: HeaderSetter;

  beforeEach(() => {
    service = {
      getAllNotes: jest.fn(),
      exportNotes: jest.fn(),
      getNoteById: jest.fn(),
      createNote: jest.fn(),
      updateNote: jest.fn(),
      deleteNote: jest.fn(),
    } as unknown as NotesServiceMock;

    factory = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ExportStrategyFactory>;

    controller = new NotesController(service, factory);
    res = { setHeader: jest.fn() };
  });

  it('getAll delega en el servicio con la query', async () => {
    const query: ListNotesQueryDto = {
      search: 'abc',
      sort: 'title',
      order: 'asc',
    };
    service.getAllNotes.mockResolvedValue([]);

    const result = await controller.getAll(query);

    expect(service.getAllNotes).toHaveBeenCalledWith(query);
    expect(result).toEqual([]);
  });

  it('exportNotes usa JSON por defecto y fija el content-type', async () => {
    service.exportNotes.mockResolvedValue('json-body');

    const jsonStrategy: ExportStrategy = {
      export: jest.fn(() => 'json-export'),
    };
    factory.get.mockReturnValue({ strategy: jsonStrategy, contentType: 'application/json' });

    const result = await controller.exportNotes('', res);

    expect(factory.get).toHaveBeenCalledWith('');
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/json',
    );
    expect(service.exportNotes).toHaveBeenCalledWith(
      jsonStrategy,
    );
    expect(result).toBe('json-body');
  });

  it('exportNotes con format=csv usa CsvExportStrategy y content-type CSV', async () => {
    service.exportNotes.mockResolvedValue('csv-body');

    const csvStrategy: ExportStrategy = {
      export: jest.fn(() => 'csv-export'),
    };
    factory.get.mockReturnValue({
      strategy: csvStrategy,
      contentType: 'text/csv; charset=utf-8',
    });

    const result = await controller.exportNotes('csv', res);

    expect(factory.get).toHaveBeenCalledWith('csv');
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'text/csv; charset=utf-8',
    );
    expect(service.exportNotes).toHaveBeenCalledWith(
      csvStrategy,
    );
    expect(result).toBe('csv-body');
  });

  it('getById delega al servicio', async () => {
    const apiNote = {
      id: 'uuid',
      title: 'A',
      content: 'C',
      createdAt: '',
      updatedAt: '',
    };
    service.getNoteById.mockResolvedValue(apiNote);

    const result = await controller.getById('uuid');

    expect(service.getNoteById).toHaveBeenCalledWith('uuid');
    expect(result).toBe(apiNote);
  });

  it('create delega al servicio con DTO', async () => {
    const dto: CreateNoteDto = { title: 'T', content: 'C' };
    const apiNote = {
      id: 'uuid',
      title: 'T',
      content: 'C',
      createdAt: '',
      updatedAt: '',
    };
    service.createNote.mockResolvedValue(apiNote);

    const result = await controller.create(dto);

    expect(service.createNote).toHaveBeenCalledWith(dto);
    expect(result).toBe(apiNote);
  });

  it('update delega al servicio con id y DTO', async () => {
    const dto: UpdateNoteDto = { title: 'T2' };
    const apiNote = {
      id: 'uuid',
      title: 'T2',
      content: 'C',
      createdAt: '',
      updatedAt: '',
    };
    service.updateNote.mockResolvedValue(apiNote);

    const result = await controller.update('uuid', dto);

    expect(service.updateNote).toHaveBeenCalledWith('uuid', dto);
    expect(result).toBe(apiNote);
  });

  it('delete delega al servicio con id(s)', async () => {
    const apiNotes = [
      {
        id: 'uuid',
        title: 'T',
        content: 'C',
        createdAt: '',
        updatedAt: '',
      },
    ];
    service.deleteNote.mockResolvedValue(apiNotes);

    const result = await controller.delete('uuid');

    expect(service.deleteNote).toHaveBeenCalledWith('uuid');
    expect(result).toBe(apiNotes);
  });
});
