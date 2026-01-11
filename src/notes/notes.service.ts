import { Injectable, NotFoundException } from '@nestjs/common';
import { Note } from './entities/note.entity';
import { NotesRepository } from './notes.repository';
import { ExportStrategy } from './strategies/export.strategy';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private readonly notesRepository: NotesRepository) {}

  async getAllNotes(): Promise<Note[]> {
    return this.notesRepository.findAll();
  }

  async getNoteById(id: string): Promise<Note> {
    const note = await this.notesRepository.findOne(id);
    if (!note) {
      throw new NotFoundException(`Nota con ID "${id}" no encontrada.`);
    }
    return note;
  }

  async createNote(createNoteDto: CreateNoteDto): Promise<Note> {
    // La validación del DTO ya ocurrió gracias al ValidationPipe
    return this.notesRepository.create(createNoteDto.titulo, createNoteDto.contenido);
  }

  async updateNote(id: string, updateNoteDto: UpdateNoteDto): Promise<Note> {
    // 1. Verificamos que la nota exista. Si no, esto lanza un NotFoundException.
    const existingNote = await this.getNoteById(id);

    // 2. Determinamos los nuevos valores, usando los existentes como fallback.
    const nuevoTitulo = updateNoteDto.titulo ?? existingNote.titulo;
    const nuevoContenido = updateNoteDto.contenido ?? existingNote.contenido;

    // 3. Llamamos al repositorio para que actualice los datos con los valores correctos.
    const updatedNote = await this.notesRepository.update(
      id,
      nuevoTitulo,
      nuevoContenido,
    );

    // 4. Verificamos el resultado del repositorio.
    if (!updatedNote) {
      // Este caso no debería ocurrir si la lógica es correcta, pero es una salvaguarda.
      throw new NotFoundException(`No se pudo actualizar la nota con ID "${id}".`);
    }

    // 5. Devolvemos la nota actualizada.
    return updatedNote;
  }

  async deleteNote(id: string): Promise<Note> {
    const note = await this.notesRepository.remove(id);
    if (!note) {
      throw new NotFoundException(`Nota con ID "${id}" no encontrada.`);
    }
    return note;
  }

  async exportNotes(strategy: ExportStrategy): Promise<string> {
    const notes = await this.getAllNotes();
    return strategy.export(notes);
  }
}