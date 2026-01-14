import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { NotesRepository } from './notes.repository';
import { FileNotesAdapter } from './stores/file-notes.adapter';
import { NOTES_STORE } from './tokens';
import { NoteFactory } from './factories/note.factory';
import { JsonExportStrategy } from './strategies/json-export.strategy';
import { CsvExportStrategy } from './strategies/csv-export.strategy';
import { ExportStrategyFactory } from './strategies/export-strategy.factory';

@Module({
  controllers: [NotesController],
  providers: [
    NotesService,
    NotesRepository,
    NoteFactory,
    JsonExportStrategy,
    CsvExportStrategy,
    ExportStrategyFactory,
    {
      provide: NOTES_STORE,
      useClass: FileNotesAdapter,
    },
  ],
})
export class NotesModule { }
