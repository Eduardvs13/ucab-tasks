import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  Note,
  NoteSummary,
  ApiNote,
  ApiNoteSummary,
} from './entities/note.entity';
import { NotesRepository, FindAllOptions } from './notes.repository';
import { ExportStrategy } from './strategies/export.strategy';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

/**
 * Servicio para gestionar operaciones relacionadas con notas.
 */
@Injectable()
export class NotesService {
  constructor(private readonly notesRepository: NotesRepository) { }

  /**
   * Convierte un objeto `Note` interno a un objeto expuesto por la API.
   * @param n - Objeto interno `Note`.
   * @returns Objeto expuesto por la API.
   */
  private toApiNote(n: Note): ApiNote {
    return {
      id: n.id,
      title: n.title,
      content: n.content,
      createdAt: new Date(n.creationDate).toISOString(),
      updatedAt: new Date(n.modificationDate).toISOString(),
    };
  }

  /**
   * Convierte un objeto `NoteSummary` interno a un objeto expuesto por la API.
   * @param n - Objeto interno `NoteSummary`.
   * @returns Objeto expuesto por la API.
   */
  private toApiSummary(n: NoteSummary): ApiNoteSummary {
    return {
      id: n.id,
      title: n.title,
      createdAt: new Date(n.creationDate).toISOString(),
      updatedAt: new Date(n.modificationDate).toISOString(),
    };
  }

  /**
   * Obtiene todas las notas con filtros y orden opcionales.
   * @param options - Opciones de búsqueda, orden y filtros.
   * @returns Promesa que resuelve a un arreglo de resúmenes de notas.
   */
  async getAllNotes(options?: {
    search?: string;
    sort?: 'title' | 'createdAt' | 'updatedAt';
    order?: 'asc' | 'desc';
    createdFrom?: string;
    createdTo?: string;
    updatedFrom?: string;
    updatedTo?: string;
  }): Promise<ApiNoteSummary[]> {
    // traducir claves de orden de la API a claves internas de almacenamiento
    const internalSort =
      options?.sort === 'title'
        ? 'title'
        : options?.sort === 'createdAt'
          ? 'creationDate'
          : options?.sort === 'updatedAt'
            ? 'modificationDate'
            : undefined;

    const internalOptions: FindAllOptions = {
      search: options?.search,
      sort: internalSort,
      order: options?.order,
      createdFrom: options?.createdFrom,
      createdTo: options?.createdTo,
      updatedFrom: options?.updatedFrom,
      updatedTo: options?.updatedTo,
    };

    const summaries = await this.notesRepository.findAll(internalOptions);
    return summaries.map((s) => this.toApiSummary(s));
  }

  /**
   * Obtiene una nota por su ID.
   * @param id - ID de la nota a obtener.
   * @returns Promesa que resuelve a la nota.
   */
  async getNoteById(id: string): Promise<ApiNote> {
    const note = await this.notesRepository.findOne(id);
    if (!note) {
      throw new NotFoundException(`Nota con ID "${id}" no encontrada.`);
    }
    return this.toApiNote(note);
  }

  /**
   * Crea una nueva nota.
   * @param createNoteDto - Datos para crear la nota.
   * @returns Promesa que resuelve a la nota creada.
   */
  async createNote(createNoteDto: CreateNoteDto): Promise<ApiNote> {
    // La validación del DTO ya es aplicada por el ValidationPipe
    const created = await this.notesRepository.create(
      createNoteDto.title,
      createNoteDto.content,
    );
    return this.toApiNote(created);
  }

  /**
   * Actualiza una nota existente.
   * @param id - ID de la nota a actualizar.
   * @param updateNoteDto - Datos para actualizar la nota.
   * @returns Promesa que resuelve a la nota actualizada.
   */
  async updateNote(id: string, updateNoteDto: UpdateNoteDto): Promise<ApiNote> {
    const existing = await this.notesRepository.findOne(id);
    if (!existing) {
      throw new NotFoundException(`Nota con ID "${id}" no encontrada.`);
    }

    const newTitle = updateNoteDto.title ?? existing.title;
    const newContent = updateNoteDto.content ?? existing.content;

    const updated = await this.notesRepository.update(id, newTitle, newContent);
    if (!updated) {
      throw new NotFoundException(`No se pudo actualizar la nota con ID "${id}".`);
    }
    return this.toApiNote(updated);
  }

  /**
   * Elimina una o varias notas por sus IDs.
   * @param id - Cadena con IDs de notas separados por coma.
   * @returns Promesa que resuelve a un arreglo de notas eliminadas.
   */
  async deleteNote(id: string): Promise<ApiNote[]> {
    const ids = id
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    if (ids.length === 0) {
      throw new BadRequestException('Se requiere al menos un ID de nota.');
    }

    const uniqueIds = Array.from(new Set(ids));

    const allNotes = await this.notesRepository.findAllWithContent();
    const missing = uniqueIds.filter(
      (uuid) => !allNotes.some((n) => n.id === uuid),
    );
    if (missing.length > 0) {
      throw new NotFoundException(`Notas no encontradas: ${missing.join(', ')}`);
    }

    // If only one id, use remove to reuse existing logic; otherwise removeMany
    if (uniqueIds.length === 1) {
      const note = await this.notesRepository.remove(uniqueIds[0]);
      if (!note) {
        throw new NotFoundException(
          `Nota con ID "${uniqueIds[0]}" no encontrada.`,
        );
      }
      return [this.toApiNote(note)];
    }

    const removed = await this.notesRepository.removeMany(uniqueIds);
    return removed.map((n) => this.toApiNote(n));
  }

  /**
   * Exporta todas las notas usando una estrategia indicada.
   * @param strategy - Estrategia de exportación a utilizar.
   * @returns Promesa que resuelve a los datos exportados como cadena.
   */
  async exportNotes(strategy: ExportStrategy): Promise<string> {
    const notes = await this.notesRepository.findAllWithContent();
    return strategy.export(notes);
  }
}
