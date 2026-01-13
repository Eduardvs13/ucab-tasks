/* eslint-disable @typescript-eslint/unbound-method */
import { jest } from '@jest/globals';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { JsonExportStrategy } from './strategies/json-export.strategy';
import { CsvExportStrategy } from './strategies/csv-export.strategy';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { ListNotesQueryDto } from './dto/list-notes.dto';

jest.mock('./strategies/json-export.strategy', () => {
  const exportFn = jest.fn().mockReturnValue('json-export');
  const MockStrategy = jest
    .fn()
    .mockImplementation(() => ({ export: exportFn }));
  return { JsonExportStrategy: MockStrategy };
});

jest.mock('./strategies/csv-export.strategy', () => {
  const exportFn = jest.fn().mockReturnValue('csv-export');
  const MockStrategy = jest
    .fn()
    .mockImplementation(() => ({ export: exportFn }));
  return { CsvExportStrategy: MockStrategy };
});

type NotesServiceMock = jest.Mocked<NotesService>;

type HeaderSetter = { setHeader: jest.Mock };

describe('NotesController', () => {
  let controller: NotesController;
  let service: NotesServiceMock;
  let res: HeaderSetter;

  const jsonStrategyMock = JsonExportStrategy as unknown as jest.Mock;
  const csvStrategyMock = CsvExportStrategy as unknown as jest.Mock;

  beforeEach(() => {
    service = {
      getAllNotes: jest.fn(),
      exportNotes: jest.fn(),
      getNoteById: jest.fn(),
      createNote: jest.fn(),
      updateNote: jest.fn(),
      deleteNote: jest.fn(),
    } as unknown as NotesServiceMock;

    controller = new NotesController(service);
    res = { setHeader: jest.fn() };

    jsonStrategyMock.mockClear();
    csvStrategyMock.mockClear();
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

    const result = await controller.exportNotes('', res);

    expect(jsonStrategyMock).toHaveBeenCalledTimes(1);
    expect(csvStrategyMock).not.toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/json',
    );
    expect(service.exportNotes).toHaveBeenCalledWith(
      expect.objectContaining({ export: expect.any(Function) }),
    );
    expect(result).toBe('json-body');
  });

  it('exportNotes con format=csv usa CsvExportStrategy y content-type CSV', async () => {
    service.exportNotes.mockResolvedValue('csv-body');

    const result = await controller.exportNotes('csv', res);

    expect(jsonStrategyMock).toHaveBeenCalledTimes(1); // se instancia por defecto antes de evaluar el formato
    expect(csvStrategyMock).toHaveBeenCalledTimes(1);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'text/csv; charset=utf-8',
    );
    expect(service.exportNotes).toHaveBeenCalledWith(
      expect.objectContaining({ export: expect.any(Function) }),
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
