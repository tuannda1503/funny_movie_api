import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';
import { SignUpDto } from './dto/signup.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async signUp(dto: SignUpDto): Promise<any> {
    const { email, password } = dto;
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);
    try {
      const user = await this.userRepo.save({
        email,
        password: hashedPassword,
      });
      return {
        access_token: await this.jwtService.signAsync({
          sub: user.id,
          email: user.email,
        }),
      };
    } catch (error) {
      console.log(error);
    }
  }

  async signIn(
    email: string,
    password: string,
  ): Promise<{ access_token: string; email: string }> {
    const user = await this.userService.findOne(email);
    const payload = { sub: user.id, email: user.email };
    const pass = await bcrypt.compare(password, user.password);
    if (!pass) {
      throw new UnauthorizedException();
    }
    return {
      access_token: await this.jwtService.signAsync(payload),
      email,
    };
  }
}
