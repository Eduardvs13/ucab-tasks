import { Module } from '@nestjs/common';
import { NotesModule } from './notes/notes.module';

@Module({
  imports: [
    NotesModule, // Importas el módulo de notas, que contiene toda su lógica.
  ],
})
export class AppModule {}
