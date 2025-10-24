import { Global, Module } from '@nestjs/common';
import { TokenModel, UserModel } from 'src/DB/model';
import { TokenRepository, UserRepository } from 'src/DB';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from 'src/common';


@Global()
@Module({
  imports: [UserModel, TokenModel],
  exports: [
    UserRepository,
    JwtService,
    TokenService,
    TokenRepository,
    TokenModel,
    UserModel,
  ],
  providers: [
    UserRepository,
    JwtService,
    TokenService,
    TokenRepository,
  ],
  controllers: [],
})
export class SharedAuthenticationModule {}