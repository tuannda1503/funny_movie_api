import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Movie } from './movie.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ShareGateway } from '../gateway/gateway';

@Injectable()
export class MovieService {
  private readonly logger = new Logger(MovieService.name);

  constructor(
    @InjectRepository(Movie) private readonly movieRepo: Repository<Movie>,
    private readonly shareGateway: ShareGateway,
  ) {}

  async find(): Promise<Movie[]> {
    const movies = await this.movieRepo.find();
    return movies;
  }

  async shareMovie(
    url: string,
    userId: number,
    email: string,
  ): Promise<boolean> {
    try {
      const videoInfo = await this.getVideoInfo(url);
      if (videoInfo) {
        const newMovie = new Movie();
        newMovie.title = videoInfo?.items[0]?.snippet?.title;
        newMovie.description = videoInfo?.items[0]?.snippet?.description;
        newMovie.url = url;
        newMovie.userId = userId;
        newMovie.like = 0;
        newMovie.dislike = 0;
        newMovie.email = email;
        newMovie.createdAt = new Date();
        newMovie.updatedAt = new Date();
        const result = await this.movieRepo.save(newMovie);
        this.shareGateway.sharedMovie(result);
      }
      return true;
    } catch (error) {
      this.logger.error(`Failed to share movie: ${error.message}`);
      return false;
    }
  }

  async getVideoInfo(url: string): Promise<any> {
    try {
      const videoId = this.getYoutubeVideoId(url);
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to fetch video info: ${error.message}`);
      throw new Error('Failed to fetch video info');
    }
  }

  getYoutubeVideoId(url) {
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  }
}
