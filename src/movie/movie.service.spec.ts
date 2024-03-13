import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { MovieService } from './movie.service';
import { DeepPartial, Repository } from 'typeorm';
import { ShareGateway } from '../gateway/gateway';
import { Movie } from './movie.entity';

jest.mock('axios');

describe('MovieService', () => {
  let service: MovieService;
  let movieRepo: Repository<Movie>;
  let shareGateway: ShareGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: 'MovieRepository',
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: ShareGateway,
          useValue: {
            sharedMovie: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MovieService>(MovieService);
    movieRepo = module.get('MovieRepository');
    shareGateway = module.get<ShareGateway>(ShareGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('shareMovie', () => {
    it('should share movie and return true', async () => {
      const url = 'example.com';
      const userId = 1;
      const email = 'test@example.com';
      const videoInfo = {
        items: [
          { snippet: { title: 'Test title', description: 'Test description' } },
        ],
      };
      jest.spyOn(service, 'getVideoInfo').mockResolvedValue(videoInfo);
      jest
        .spyOn(movieRepo, 'save')
        .mockResolvedValue(Promise.resolve({} as DeepPartial<Movie> & Movie));

      const result = await service.shareMovie(url, userId, email);

      expect(result).toBe(true);
      expect(shareGateway.sharedMovie).toHaveBeenCalled();
    });

    it('should catch error and return false', async () => {
      const url = 'example.com';
      const userId = 1;
      const email = 'test@example.com';
      jest
        .spyOn(service, 'getVideoInfo')
        .mockRejectedValue(new Error('Test error'));

      const result = await service.shareMovie(url, userId, email);

      expect(result).toBe(false);
    });
  });

  describe('getVideoInfo', () => {
    it('should fetch video info and return data', async () => {
      const url = 'example.com';
      const videoId = 'abcd1234';
      const response = { data: 'test data' };
      jest.spyOn(service, 'getYoutubeVideoId').mockReturnValue(videoId);
      (axios.get as jest.Mock).mockResolvedValue(response);

      const result = await service.getVideoInfo(url);

      expect(result).toEqual(response.data);
    });

    it('should catch error and throw', async () => {
      const url = 'example.com';
      jest.spyOn(service, 'getYoutubeVideoId').mockReturnValue(null);
      (axios.get as jest.Mock).mockRejectedValue(new Error('Test error'));

      await expect(service.getVideoInfo(url)).rejects.toThrowError(
        'Failed to fetch video info',
      );
    });
  });

  describe('getYoutubeVideoId', () => {
    it('should extract video ID from YouTube URL', () => {
      const url = 'https://www.youtube.com/watch?v=abcd1234';

      const result = service.getYoutubeVideoId(url);

      expect(result).toEqual('abcd1234');
    });

    it('should return null if URL is invalid', () => {
      const url = 'invalid_url';

      const result = service.getYoutubeVideoId(url);

      expect(result).toBeNull();
    });
  });
});
