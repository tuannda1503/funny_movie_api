import { Test, TestingModule } from '@nestjs/testing';
import { ShareGateway } from './gateway';
import { Server } from 'socket.io';

describe('ShareGateway', () => {
  let gateway: ShareGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShareGateway],
    }).compile();

    gateway = module.get<ShareGateway>(ShareGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should emit new message when receiving new message', () => {
    const mockServer = {
      emit: jest.fn(),
    } as unknown as Server;

    gateway.server = mockServer;

    const message = { content: 'Test message' };
    gateway.onNewMessage(message);

    expect(mockServer.emit).toHaveBeenCalledWith('onMessage', {
      msg: 'New Message',
      content: message,
    });
  });

  it('should emit message when sharing movie', () => {
    const mockServer = {
      emit: jest.fn(),
    } as unknown as Server;

    gateway.server = mockServer;

    const movie = { title: 'Test movie', description: 'Test description' };
    gateway.sharedMovie(movie);

    expect(mockServer.emit).toHaveBeenCalledWith('onMessage', { body: movie });
  });
});
