import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';

const mockAuthService = {
  signUp: jest.fn(),
  signIn: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockImplementation(() => {
    return 'mockedJwtToken';
  }),
  verify: jest.fn().mockImplementation((token: string) => {
    if (token === 'mockedValidJwtToken') {
      return { sub: 1, email: 'testuser' };
    } else {
      throw new Error('Invalid token');
    }
  }),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: JwtService, useValue: mockJwtService },
        AuthGuard,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('should call authService.signUp with signUpDto', async () => {
      const signUpDto: SignUpDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      await controller.signUp(signUpDto);

      expect(mockAuthService.signUp).toHaveBeenCalledWith(signUpDto);
    });
  });

  describe('signIn', () => {
    it('should call authService.signIn with email and password', async () => {
      const signInDto = {
        email: 'testuser',
        password: 'password123',
      };

      await controller.signIn(signInDto);

      expect(mockAuthService.signIn).toHaveBeenCalledWith(
        signInDto.email,
        signInDto.password,
      );
    });
  });

  // Add more test cases as needed
});
