import { Module } from '@nestjs/common';
import { ShareGateway } from './gateway';

@Module({
  providers: [ShareGateway],
  exports: [ShareGateway],
})
export class GatewayModule {}
