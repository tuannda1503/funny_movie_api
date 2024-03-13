import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let userRepositoryMock: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserService,
        JwtService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    userRepositoryMock = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('should create a new user and return access token', async () => {
      const signUpDto: SignUpDto = {
        email: 'xxx1',
        password: 'xxx',
      };
      const hashedPassword = await bcrypt.hash(
        signUpDto.password,
        service['saltRounds'],
      );
      const user = { id: 1, ...signUpDto, password: hashedPassword };
      jest.spyOn(userRepositoryMock, 'save').mockResolvedValue(user);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('access_token');

      const result = await service.signUp(signUpDto);

      expect(result).toEqual({ access_token: 'access_token' });
      expect(userRepositoryMock.save).toHaveBeenCalledWith({
        email: signUpDto.email,
        password: hashedPassword,
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
    });

    it('should throw error when save user fails', async () => {
      const signUpDto: SignUpDto = {
        email: 'xxx1',
        password: 'xxx',
      };
      jest.spyOn(userRepositoryMock, 'save').mockRejectedValue(new Error());

      await expect(service.signUp(signUpDto)).rejects.toThrowError();
    });
  });

  describe('signIn', () => {
    it('should return access token when user signs in successfully', async () => {
      const email = 'xxx1';
      const password = 'xxx';
      const user = { id: 1, email, password: await bcrypt.hash(password, 10) };
      jest.spyOn(userService, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('access_token');

      const result = await service.signIn(email, password);

      expect(result).toEqual({ access_token: 'access_token', email });
      expect(userService.findOne).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: user.id,
        email,
      });
    });

    it('should throw UnauthorizedException when user signs in with invalid credentials', async () => {
      const email = 'xxx1';
      const password = 'password';
      const user = {
        id: 1,
        email,
        password: await bcrypt.hash('wrong_password', 10),
      };
      jest.spyOn(userService, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.signIn(email, password)).rejects.toThrowError(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      const email = 'xxx1';
      jest.spyOn(userService, 'findOne').mockResolvedValue(undefined);

      await expect(service.signIn(email, 'password')).rejects.toThrowError(
        UnauthorizedException,
      );
    });
  });
});
