import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { NotesStore } from './notes.store';
import { Note } from '../entities/note.entity';

const dbPath = path.resolve(__dirname, '..', '..', '..', 'database', 'notes.json');

type RawNote = {
    id: string;
    title: string;
    content: string;
    creationDate: string;
    modificationDate: string;
};

/** Adaptador basado en archivo que implementa NotesStore usando un JSON local. */
@Injectable()
export class FileNotesAdapter implements NotesStore {
    /** Carga todas las notas desde la base de datos JSON. */
    async getAll(): Promise<Note[]> {
        const data = await fs.readFile(dbPath, 'utf-8');
        const raw = JSON.parse(data) as RawNote[];
        return raw.map(
            (n): Note => ({
                id: n.id,
                title: n.title,
                content: n.content,
                creationDate: new Date(n.creationDate),
                modificationDate: new Date(n.modificationDate),
            }),
        );
    }

    /** Persiste todas las notas en la base de datos JSON. */
    async saveAll(notes: Note[]): Promise<void> {
        const raw: RawNote[] = notes.map((n) => ({
            id: n.id,
            title: n.title,
            content: n.content,
            creationDate: n.creationDate.toISOString(),
            modificationDate: n.modificationDate.toISOString(),
        }));
        await fs.writeFile(dbPath, JSON.stringify(raw, null, 2));
    }
}
