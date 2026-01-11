import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JsonExportStrategy } from './strategies/json-export.strategy';
import { CsvExportStrategy } from './strategies/csv-export.strategy';
import { NotesRepository } from './notes.repository';

@Controller('notes')
export class NotesController {
  private readonly notesService: NotesService;

  constructor() {
    const notesRepository = new NotesRepository();
    this.notesService = new NotesService(notesRepository);
  }

  @Get()
  async getAll() {
    console.log('--- Obteniendo todas las notas ---');
    const notes = await this.notesService.getAllNotes();
    console.log(notes);
    return notes;
  }

  @Get('export')
  async exportNotes(@Query('format') format: string) {
    if (format === 'csv') {
      return this.notesService.exportNotes(new CsvExportStrategy());
    }
    return this.notesService.exportNotes(new JsonExportStrategy());
  }

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.notesService.getNoteById(id);
  }

  @Post()
  create(@Body() createNoteDto: CreateNoteDto) {
    return this.notesService.createNote(createNoteDto);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateNoteDto: UpdateNoteDto) {
    return this.notesService.updateNote(id, updateNoteDto);
  }

  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.notesService.deleteNote(id);
  }
}