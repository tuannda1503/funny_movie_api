import { Test } from '@nestjs/testing';
import { NestApplication } from '@nestjs/core';
import { AppModule } from './app.module';

describe('Bootstrap function', () => {
  let app: NestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should create NestJS application', async () => {
    expect(app).toBeDefined();
  });

  it('should enable CORS', async () => {
    const server = app.getHttpServer();
    const appConfig = server.getInstance().getApp();
    expect(appConfig.enableCors).toHaveBeenCalled();
  });

  it('should listen on port 3001', async () => {
    const server = app.getHttpServer();
    const serverAddress = await server.address();
    expect(serverAddress.port).toBe(3001);
  });
});
