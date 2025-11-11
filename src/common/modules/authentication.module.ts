import { Global, Module } from '@nestjs/common';
import { TokenModel, UserModel } from 'src/DB/model';
import { TokenRepository, UserRepository } from 'src/DB';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from 'src/common';
import { createClient } from 'redis';

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
    'REDIS_CLIENT',
  ],
  providers: [
    UserRepository,
    JwtService,
    TokenService,
    TokenRepository,
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const client = createClient({
          url: 'redis://localhost:6379', // or your VPS URL
        });

        client.on('error', (err) => console.error('Redis Client Error', err));

        await client.connect();
        console.log('✅ Redis connected');

        return client;
      },
    },
  ],
  controllers: [],
})
export class SharedAuthenticationModule {}
