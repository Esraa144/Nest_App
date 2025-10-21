import { Module } from '@nestjs/common';
import { AuthenticationController } from './auth.controller';
import { AuthenticationService } from './auth.service';
import { OtpModel, TokenModel, UserModel } from 'src/DB/model';
import { OtpRepository, TokenRepository, UserRepository } from 'src/DB';
import { SecurityService } from 'src/common/services/security.service';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from 'src/common';

@Module({
  imports: [UserModel, OtpModel,TokenModel],
  exports: [AuthenticationService],
  providers: [
    AuthenticationService,
    UserRepository,
    OtpRepository,
    SecurityService,
    JwtService,
    TokenService,
    TokenRepository,
  ],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
