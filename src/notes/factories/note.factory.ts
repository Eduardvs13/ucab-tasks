import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Note } from '../entities/note.entity';

/** Centraliza la creación de notas y el manejo de invariantes. */
@Injectable()
export class NoteFactory {
    /** Crea una nueva nota con ID generado y marcas de tiempo. */
    create(title: string, content: string): Note {
        const now = new Date();
        return {
            id: randomUUID(),
            title,
            content,
            creationDate: now,
            modificationDate: now,
        };
    }

    /** Devuelve una copia actualizada de una nota, refrescando la fecha de modificación. */
    update(existing: Note, title: string, content: string): Note {
        return {
            ...existing,
            title,
            content,
            modificationDate: new Date(),
        };
    }
}
