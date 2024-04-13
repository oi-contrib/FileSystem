import { Module } from '@nestjs/common'
import { HandlerController } from './index.controller'
import { DistService } from './dist.service'
import { SecurityService } from '../verification/security.service'

@Module({
  controllers: [HandlerController],
  providers: [DistService, SecurityService]
})
export class HandlerModule { }
