import { Test, TestingModule } from '@nestjs/testing';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { Movie } from './movie.entity';

describe('MovieController', () => {
  let controller: MovieController;
  let service: MovieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieController],
      providers: [
        {
          provide: MovieService,
          useValue: {
            shareMovie: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MovieController>(MovieController);
    service = module.get<MovieService>(MovieService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('shareMovie', () => {
    it('should call movieService.shareMovie', async () => {
      const url = 'example.com';
      const req = { user: { sub: 1, email: 'test@example.com' } };
      const result = true;

      jest.spyOn(service, 'shareMovie').mockResolvedValueOnce(result);

      expect(await controller.shareMovie(url, req)).toEqual(result);
      expect(service.shareMovie).toHaveBeenCalledWith(
        url,
        req.user.sub,
        req.user.email,
      );
    });
  });

  describe('getMovies', () => {
    it('should call movieService.find', async () => {
      const movies: Movie[] = [
        { id: 1, title: 'Movie 1' },
        { id: 2, title: 'Movie 2' },
      ];

      jest.spyOn(service, 'find').mockResolvedValueOnce(movies);

      expect(await controller.getMovies()).toEqual(movies);
      expect(service.find).toHaveBeenCalled();
    });
  });
});
