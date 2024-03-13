import { Test, TestingModule } from '@nestjs/testing';
import { GatewayModule } from './gateway.module';
import { ShareGateway } from './gateway';

describe('GatewayModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [GatewayModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should export ShareGateway', () => {
    const shareGateway = module.get<ShareGateway>(ShareGateway);
    expect(shareGateway).toBeDefined();
  });
});
