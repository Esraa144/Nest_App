import { Module } from '@nestjs/common';
import { AuthenticationController } from './auth.controller';
import { AuthenticationService } from './auth.service';
import { OtpModel } from 'src/DB/model';
import { OtpRepository } from 'src/DB';
import { SecurityService } from 'src/common/services/security.service';

@Module({
  imports: [ OtpModel],
  exports: [],
  providers: [AuthenticationService, OtpRepository, SecurityService],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
