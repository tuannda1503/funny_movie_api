import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  //   let jwtService: JwtService;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest
              .fn()
              .mockResolvedValue({ sub: 1, email: 'test@example.com' }),
          },
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn().mockReturnValue(false),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    // jwtService = module.get<JwtService>(JwtService);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true for public route', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const context: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: jest.fn(),
      }),
    };
    const result = await guard.canActivate(context);
    expect(result).toBeTruthy();
  });

  it('should throw UnauthorizedException if token is not provided', async () => {
    const context: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: jest.fn().mockReturnValue({
          headers: {},
        }),
      }),
    };
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should set user payload to request object if token is valid', async () => {
    const context: any = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: jest.fn().mockReturnValue({
          headers: { authorization: 'Bearer token' },
        }),
      }),
    };
    const result = await guard.canActivate(context);
    expect(result).toBe({ email: 'test@example.com', sub: 1 });
    expect(context.switchToHttp().getRequest().user).toEqual({
      sub: 1,
      email: 'test@example.com',
    });
  });
});
