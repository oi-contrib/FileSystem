import { Module } from '@nestjs/common'
import { VerificationController } from './index.controller'
import { EmailService } from './email.service'
import { SecurityService } from './security.service'

@Module({
  controllers: [VerificationController],
  providers: [EmailService, SecurityService]
})
export class VerificationModule { }
