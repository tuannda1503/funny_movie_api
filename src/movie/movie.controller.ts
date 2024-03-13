import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { MovieService } from './movie.service';
import { AuthGuard } from '../auth/auth.guard';
import { Movie } from './movie.entity';

@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @UseGuards(AuthGuard)
  @Post('share')
  async shareMovie(
    @Body('url') url: string,
    @Req() req: any,
  ): Promise<boolean> {
    const shared = await this.movieService.shareMovie(
      url,
      req.user.sub,
      req.user.email,
    );
    return shared;
  }

  @Get('')
  async getMovies(): Promise<Movie[]> {
    return await this.movieService.find();
  }
}
