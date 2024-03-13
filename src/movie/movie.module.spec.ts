import { Test, TestingModule } from '@nestjs/testing';
import { MovieModule } from './movie.module';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './movie.entity';
import { GatewayModule } from '../gateway/gateway.module';

describe('MovieModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Movie],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Movie]),
        GatewayModule,
        MovieModule,
      ],
    }).compile();
  });

  it('should be defined', async () => {
    expect(module).toBeDefined();
  });

  it('should import MovieController', async () => {
    const controller = module.get<MovieController>(MovieController);
    expect(controller).toBeDefined();
  });

  it('should import MovieService', async () => {
    const service = module.get<MovieService>(MovieService);
    expect(service).toBeDefined();
  });
});
