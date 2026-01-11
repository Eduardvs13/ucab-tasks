import { promises as fs } from 'fs';
import * as path from 'path';
import { Note } from './entities/note.entity';
import { randomUUID } from 'crypto';

const dbPath = path.join(process.cwd(), 'database', 'notes.json');

export class NotesRepository {
  async findAll(): Promise<Note[]> {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  }

  async findOne(id: string): Promise<Note | null> {
    const notes = await this.findAll();
    const note = notes.find((n) => n.id === id);
    return note || null;
  }

  async create(titulo: string, contenido: string): Promise<Note> {
    const notes = await this.findAll();
    const newNote: Note = {
      id: randomUUID(),
      titulo,
      contenido,
      fechaCreacion: new Date(),
      fechaModificacion: new Date(),
    };
    notes.push(newNote);
    await fs.writeFile(dbPath, JSON.stringify(notes, null, 2));
    return newNote;
  }

  async update(id: string, titulo: string, contenido: string): Promise<Note | null> {
    const notes = await this.findAll();
    const noteIndex = notes.findIndex((n) => n.id === id);

    if (noteIndex === -1) {
      // Esta condición no debería ocurrir si el servicio funciona bien,
      // pero es una buena práctica mantenerla como salvaguarda.
      return null;
    }

    // Asegúrate de mantener los datos que no se modifican
    const originalNote = notes[noteIndex];
    const updatedNote: Note = {
      ...originalNote,
      titulo: titulo,
      contenido: contenido,
      fechaModificacion: new Date(),
    };

    notes[noteIndex] = updatedNote;
    await fs.writeFile(dbPath, JSON.stringify(notes, null, 2));
    
    // Devuelve la nota completamente actualizada.
    return updatedNote;
  }

  async remove(id: string): Promise<Note | null> {
    const notes = await this.findAll();
    const noteIndex = notes.findIndex((n) => n.id === id);
    if (noteIndex === -1) {
      return null;
    }
    const [removedNote] = notes.splice(noteIndex, 1);
    await fs.writeFile(dbPath, JSON.stringify(notes, null, 2));
    return removedNote;
  }
}