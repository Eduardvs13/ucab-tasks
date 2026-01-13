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
 * Service for handling note-related operations.
 */
@Injectable()
export class NotesService {
  constructor(private readonly notesRepository: NotesRepository) {}

  /**
   * Converts an internal Note object to an API-facing Note object.
   * @param n - The internal Note object.
   * @returns The API-facing Note object.
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
   * Converts an internal NoteSummary object to an API-facing NoteSummary object.
   * @param n - The internal NoteSummary object.
   * @returns The API-facing NoteSummary object.
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
   * Retrieves all notes with optional filtering and sorting.
   * @param options - Options for searching, sorting, and filtering.
   * @returns A promise that resolves to an array of note summaries.
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
    // translate API sort keys to internal storage keys
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
   * Retrieves a single note by its ID.
   * @param id - The ID of the note to retrieve.
   * @returns A promise that resolves to the note.
   */
  async getNoteById(id: string): Promise<ApiNote> {
    const note = await this.notesRepository.findOne(id);
    if (!note) {
      throw new NotFoundException(`Note with ID "${id}" not found.`);
    }
    return this.toApiNote(note);
  }

  /**
   * Creates a new note.
   * @param createNoteDto - The data for creating the note.
   * @returns A promise that resolves to the created note.
   */
  async createNote(createNoteDto: CreateNoteDto): Promise<ApiNote> {
    // DTO validation already applied by ValidationPipe
    const created = await this.notesRepository.create(
      createNoteDto.title,
      createNoteDto.content,
    );
    return this.toApiNote(created);
  }

  /**
   * Updates an existing note.
   * @param id - The ID of the note to update.
   * @param updateNoteDto - The data for updating the note.
   * @returns A promise that resolves to the updated note.
   */
  async updateNote(id: string, updateNoteDto: UpdateNoteDto): Promise<ApiNote> {
    const existing = await this.notesRepository.findOne(id);
    if (!existing) {
      throw new NotFoundException(`Note with ID "${id}" not found.`);
    }

    const newTitle = updateNoteDto.title ?? existing.title;
    const newContent = updateNoteDto.content ?? existing.content;

    const updated = await this.notesRepository.update(id, newTitle, newContent);
    if (!updated) {
      throw new NotFoundException(`Unable to update note with ID "${id}".`);
    }
    return this.toApiNote(updated);
  }

  /**
   * Deletes one or more notes by their IDs.
   * @param id - A comma-separated string of note IDs.
   * @returns A promise that resolves to an array of the deleted notes.
   */
  async deleteNote(id: string): Promise<ApiNote[]> {
    const ids = id
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    if (ids.length === 0) {
      throw new BadRequestException('At least one note id is required.');
    }

    const uniqueIds = Array.from(new Set(ids));

    const allNotes = await this.notesRepository.findAllWithContent();
    const missing = uniqueIds.filter(
      (uuid) => !allNotes.some((n) => n.id === uuid),
    );
    if (missing.length > 0) {
      throw new NotFoundException(`Notes not found: ${missing.join(', ')}`);
    }

    // If only one id, use remove to reuse existing logic; otherwise removeMany
    if (uniqueIds.length === 1) {
      const note = await this.notesRepository.remove(uniqueIds[0]);
      if (!note) {
        throw new NotFoundException(
          `Note with ID "${uniqueIds[0]}" not found.`,
        );
      }
      return [this.toApiNote(note)];
    }

    const removed = await this.notesRepository.removeMany(uniqueIds);
    return removed.map((n) => this.toApiNote(n));
  }

  /**
   * Exports all notes using a given strategy.
   * @param strategy - The export strategy to use.
   * @returns A promise that resolves to the exported data as a string.
   */
  async exportNotes(strategy: ExportStrategy): Promise<string> {
    const notes = await this.notesRepository.findAllWithContent();
    return strategy.export(notes);
  }
}
