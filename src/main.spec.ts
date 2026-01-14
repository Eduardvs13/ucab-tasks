import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

jest.mock('@nestjs/core', () => ({
    NestFactory: {
        create: jest.fn(),
    },
}));

jest.mock('@nestjs/swagger', () => {
    const actual = jest.requireActual('@nestjs/swagger');
    return {
        ...actual,
        SwaggerModule: {
            createDocument: jest.fn(() => ({})),
            setup: jest.fn(),
        },
    };
});

describe('main bootstrap', () => {
    it('creates app, configures swagger and global pipes, and listens', async () => {
        process.env.NODE_ENV = 'test';
        const listen = jest.fn();
        const useGlobalPipes = jest.fn();
        (NestFactory.create as jest.Mock).mockResolvedValue({
            useGlobalPipes,
            listen,
        });

        // require after mocks to avoid dynamic import flags
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { bootstrap } = require('./main');

        await bootstrap();

        expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
        expect(SwaggerModule.createDocument).toHaveBeenCalled();
        expect(SwaggerModule.setup).toHaveBeenCalledWith('api', expect.anything(), {});
        expect(useGlobalPipes).toHaveBeenCalledWith(expect.any(ValidationPipe));
        expect(listen).toHaveBeenCalledWith(expect.any(Number));
    });
});
