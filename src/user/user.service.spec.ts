import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';

describe('UserService', () => {
  let service: UserService;
  let userRepositoryMock: any;

  beforeEach(async () => {
    userRepositoryMock = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      const email = 'test@example.com';
      const user = { id: 1, email, password: 'password' };
      userRepositoryMock.findOne.mockResolvedValue(user);

      const result = await service.findOne(email);

      expect(result).toEqual(user);
      expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { email },
      });
    });

    it('should return undefined when user not found', async () => {
      const email = 'test@example.com';
      userRepositoryMock.findOne.mockResolvedValue(undefined);

      const result = await service.findOne(email);

      expect(result).toBeUndefined();
      expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { email },
      });
    });
  });
});
