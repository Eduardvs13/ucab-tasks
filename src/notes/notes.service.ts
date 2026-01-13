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

@Injectable()
export class NotesService {
  constructor(private readonly notesRepository: NotesRepository) {}

  private toApiNote(n: Note): ApiNote {
    return {
      id: n.id,
      title: n.title,
      content: n.content,
      createdAt: new Date(n.creationDate).toISOString(),
      updatedAt: new Date(n.modificationDate).toISOString(),
    };
  }

  private toApiSummary(n: NoteSummary): ApiNoteSummary {
    return {
      id: n.id,
      title: n.title,
      createdAt: new Date(n.creationDate).toISOString(),
      updatedAt: new Date(n.modificationDate).toISOString(),
    };
  }

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

  async getNotesByDate(
    dateStr: string,
    field: 'created' | 'modified' = 'created',
    order: 'asc' | 'desc' = 'asc',
  ): Promise<ApiNoteSummary[]> {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('date must be a valid date string');
    }

    // If user provided a full timestamp (contains 'T' or time component),
    // perform exact-match against the "last change" of each note:
    // lastChange = modificationDate !== creationDate ? modificationDate : creationDate
    const isFullTimestamp = /T/.test(dateStr) || /:\d{2}/.test(dateStr);
    if (isFullTimestamp) {
      const notes = await this.notesRepository.findAllWithContent();
      const targetIso = new Date(date).toISOString();

      const matched = notes.filter((n) => {
        const created = new Date(n.creationDate).toISOString();
        const modified = new Date(n.modificationDate).toISOString();
        const lastChange = modified !== created ? modified : created;
        if (field === 'created') {
          // match against creation date if explicitly requested
          return created === targetIso;
        }
        // field === 'modified' -> match against lastChange
        return lastChange === targetIso;
      });

      return matched.map((n) => this.toApiSummary(n));
    }

    // Otherwise treat as a whole-day query (UTC day range)
    const start = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);

    const options: FindAllOptions =
      field === 'created'
        ? {
            order,
            createdFrom: start.toISOString(),
            createdTo: end.toISOString(),
          }
        : {
            order,
            updatedFrom: start.toISOString(),
            updatedTo: end.toISOString(),
          };

    const summaries = await this.notesRepository.findAll(options);
    return summaries.map((s) => this.toApiSummary(s as Note));
  }

  async getNoteById(id: string): Promise<ApiNote> {
    const note = await this.notesRepository.findOne(id);
    if (!note) {
      throw new NotFoundException(`Note with ID "${id}" not found.`);
    }
    return this.toApiNote(note);
  }

  async createNote(createNoteDto: CreateNoteDto): Promise<ApiNote> {
    // DTO validation already applied by ValidationPipe
    const created = await this.notesRepository.create(
      createNoteDto.title,
      createNoteDto.content,
    );
    return this.toApiNote(created);
  }

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

  async exportNotes(strategy: ExportStrategy): Promise<string> {
    const notes = await this.notesRepository.findAllWithContent();
    return strategy.export(notes);
  }
}
