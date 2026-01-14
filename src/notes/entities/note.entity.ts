import { ApiProperty } from '@nestjs/swagger';

export class Note {
  @ApiProperty({ description: 'Identificador único de la nota.' })
  id: string;

  @ApiProperty({ description: 'Título de la nota.' })
  title: string;

  @ApiProperty({ description: 'Contenido de la nota.' })
  content: string;

  @ApiProperty({ description: 'Fecha de creación de la nota.' })
  creationDate: Date;

  @ApiProperty({ description: 'Fecha de última modificación de la nota.' })
  modificationDate: Date;
}

// API-facing types with English field names
export class ApiNote {
  @ApiProperty({ description: 'Identificador único de la nota.' })
  id: string;

  @ApiProperty({ description: 'Título de la nota.' })
  title: string;

  @ApiProperty({ description: 'Contenido de la nota.' })
  content: string;

  @ApiProperty({
    description: 'Fecha de creación de la nota en formato ISO.',
  })
  createdAt: string; // cadena ISO

  @ApiProperty({
    description: 'Fecha de última modificación de la nota en formato ISO.',
  })
  updatedAt: string; // cadena ISO
}

export class ApiNoteSummary implements Omit<ApiNote, 'content'> {
  @ApiProperty({ description: 'Identificador único de la nota.' })
  id: string;
  @ApiProperty({ description: 'Título de la nota.' })
  title: string;
  @ApiProperty({
    description: 'Fecha de creación de la nota en formato ISO.',
  })
  createdAt: string;
  @ApiProperty({
    description: 'Fecha de última modificación de la nota en formato ISO.',
  })
  updatedAt: string;
}

export type NoteSummary = Omit<Note, 'content'>;
