export class Note {
  id: string;
  title: string;
  content: string;
  creationDate: Date;
  modificationDate: Date;
}

// API-facing types with English field names
export interface ApiNote {
  id: string;
  title: string;
  content: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export type ApiNoteSummary = Omit<ApiNote, 'content'>;

export type NoteSummary = Omit<Note, 'content'>;