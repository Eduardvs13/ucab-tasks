import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { promises as fs } from 'fs';
import * as path from 'path';

// Use the root-level database file (shared with the repository)
const dbPath = path.resolve(__dirname, '..', 'database', 'notes.json');

const seedNotes = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    title: 'Alpha',
    content: 'Content A',
    creationDate: '2026-01-01T00:00:00.000Z',
    modificationDate: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    title: 'Beta',
    content: 'Content B',
    creationDate: '2026-01-02T12:00:00.000Z',
    modificationDate: '2026-01-02T12:00:00.000Z',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    title: 'Gamma',
    content: 'Content C',
    creationDate: '2026-01-03T06:00:00.000Z',
    modificationDate: '2026-01-04T06:00:00.000Z',
  },
];

type ApiNote = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  content?: string;
};

const assertIsApiNote: (value: unknown) => asserts value is ApiNote = (
  value: unknown,
) => {
  if (!value || typeof value !== 'object') {
    throw new Error('Response is not an object');
  }
  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.title !== 'string' ||
    typeof candidate.createdAt !== 'string' ||
    typeof candidate.updatedAt !== 'string'
  ) {
    throw new Error('Response does not match ApiNote');
  }
};

const assertIsApiNotes: (value: unknown) => asserts value is ApiNote[] = (
  value: unknown,
) => {
  if (!Array.isArray(value)) {
    throw new Error('Response is not an array');
  }
  value.forEach(assertIsApiNote);
};

const toApiNote = (value: unknown): ApiNote => {
  assertIsApiNote(value);
  return value;
};

const toApiNotes = (value: unknown): ApiNote[] => {
  assertIsApiNotes(value);
  return value;
};

describe('Notes e2e', () => {
  let app: INestApplication;
  let server: import('http').Server;
  let originalDb: string;

  const resetDb = async () => {
    await fs.writeFile(dbPath, JSON.stringify(seedNotes, null, 2));
  };

  beforeAll(async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-10T10:00:00.000Z'));

    // Backup the original content to restore it afterward
    originalDb = await fs.readFile(dbPath, 'utf-8');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    server = app.getHttpServer() as unknown as import('http').Server;
    await app.init();
  });

  afterAll(async () => {
    jest.useRealTimers();
    await fs.writeFile(dbPath, originalDb);
    await app.close();
  });

  beforeEach(async () => {
    await resetDb();
  });

  it('GET /notes returns summaries without content', async () => {
    const res = await request(server).get('/notes').expect(200);

    const notes = toApiNotes(res.body);
    expect(notes).toHaveLength(3);
    notes.forEach((note) => {
      expect(typeof note.id).toBe('string');
      expect(typeof note.title).toBe('string');
      expect(typeof note.createdAt).toBe('string');
      expect(typeof note.updatedAt).toBe('string');
      expect(note).not.toHaveProperty('content');
    });
  });

  it('GET /notes with search filters by title', async () => {
    const res = await request(server)
      .get('/notes')
      .query({ search: 'bet' })
      .expect(200);

    const notes = toApiNotes(res.body);

    expect(notes.map((n: ApiNote) => n.id)).toEqual([
      '22222222-2222-4222-8222-222222222222',
    ]);
  });

  it('GET /notes/:id returns 404 when not found', async () => {
    await request(server)
      .get('/notes/99999999-9999-4999-8999-999999999999')
      .expect(404);
  });

  it('GET /notes/:id returns 400 for invalid UUID', async () => {
    await request(server).get('/notes/not-a-uuid').expect(400);
  });

  it('POST /notes creates a note and GET /notes/:id returns it', async () => {
    const created = await request(server)
      .post('/notes')
      .send({ title: 'New', content: 'Content' })
      .expect(201);

    const createdBody = toApiNote(created.body);

    expect(typeof createdBody.id).toBe('string');
    expect(createdBody.title).toBe('New');
    expect(createdBody.content).toBe('Content');
    expect(createdBody.createdAt).toBe('2026-01-10T10:00:00.000Z');
    expect(createdBody.updatedAt).toBe('2026-01-10T10:00:00.000Z');

    const fetched = await request(server)
      .get(`/notes/${createdBody.id}`)
      .expect(200);

    const fetchedBody = toApiNote(fetched.body);
    expect(fetchedBody.title).toBe('New');
    expect(fetchedBody.content).toBe('Content');
  });

  it('POST /notes rejects payload without title', async () => {
    const res = await request(server)
      .post('/notes')
      .send({ content: 'Only content' })
      .expect(400);

    expect(res.body.message).toBeDefined();
  });

  it('PUT /notes/:id updates title and content', async () => {
    const res = await request(server)
      .put('/notes/11111111-1111-4111-8111-111111111111')
      .send({ title: 'Alpha Edit', content: 'Content A+' })
      .expect(200);

    const updated = toApiNote(res.body);

    expect(updated.title).toBe('Alpha Edit');
    expect(updated.content).toBe('Content A+');
    expect(updated.updatedAt).toBe('2026-01-10T10:00:00.000Z');
  });

  it('DELETE /notes/:id deletes single or multiple ids', async () => {
    const single = await request(server)
      .delete('/notes/22222222-2222-4222-8222-222222222222')
      .expect(200);

    const singleNotes = toApiNotes(single.body);
    expect(singleNotes.map((n: ApiNote) => n.id)).toEqual([
      '22222222-2222-4222-8222-222222222222',
    ]);

    const multiple = await request(server)
      .delete(
        '/notes/11111111-1111-4111-8111-111111111111,33333333-3333-4333-8333-333333333333',
      )
      .expect(200);

    const multipleNotes = toApiNotes(multiple.body);
    expect(multipleNotes.map((n: ApiNote) => n.id).sort()).toEqual([
      '11111111-1111-4111-8111-111111111111',
      '33333333-3333-4333-8333-333333333333',
    ]);
  });

  it('DELETE /notes/:id returns 404 when mix of valid and invalid ids', async () => {
    await request(server)
      .delete(
        '/notes/11111111-1111-4111-8111-111111111111,99999999-9999-4999-8999-999999999999',
      )
      .expect(404);
  });

  it('GET /notes/export returns JSON by default', async () => {
    const res = await request(server).get('/notes/export');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
    const parsed = JSON.parse(res.text) as unknown;
    if (!Array.isArray(parsed)) {
      throw new Error('Export response is not an array');
    }
    parsed.forEach((row) => {
      if (!row || typeof row !== 'object') {
        throw new Error('Export row is not an object');
      }
    });
    const records = parsed as Array<Record<string, unknown>>;
    expect(records).toHaveLength(3);
    expect(records).toEqual(
      expect.arrayContaining(
        seedNotes.map((n) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          creationDate: n.creationDate,
          modificationDate: n.modificationDate,
        })),
      ),
    );
  });

  it('GET /notes/export?format=csv returns CSV with headers', async () => {
    const res = await request(server)
      .get('/notes/export')
      .query({ format: 'csv' })
      .expect(200);

    expect(res.headers['content-type']).toContain('text/csv');
    const lines = res.text.trim().split('\n');
    expect(lines[0]).toBe('id,title,content,creationDate,modificationDate');
    expect(lines).toHaveLength(4);
    const dataLines = lines.slice(1);
    const expectedLines = seedNotes.map(
      (n) =>
        `${n.id},${n.title},${n.content},${n.creationDate},${n.modificationDate}`,
    );
    expect(dataLines.sort()).toEqual(expectedLines.sort());
  });

  it('GET /notes/export returns empty outputs when there is no data', async () => {
    await fs.writeFile(dbPath, JSON.stringify([], null, 2));

    const jsonRes = await request(server).get('/notes/export').expect(200);
    const parsed = JSON.parse(jsonRes.text) as unknown;
    expect(Array.isArray(parsed)).toBe(true);
    expect((parsed as unknown[]).length).toBe(0);

    const csvRes = await request(server)
      .get('/notes/export')
      .query({ format: 'csv' })
      .expect(200);
    const lines = csvRes.text.trim().split('\n');
    expect(lines[0]).toBe('id,title,content,creationDate,modificationDate');
    expect(lines.length).toBe(1);
  });
});
