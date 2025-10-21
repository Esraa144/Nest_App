import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { JwtPayload, sign } from 'jsonwebtoken';
import { RoleEnum, SignatureLevelEnum, TokenEnum } from '../enums';
import {
  TokenDocument,
  TokenRepository,
  UserDocument,
  UserRepository,
} from 'src/DB';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import { parseObjectId } from '../utils';
import { LoginCredentialsResponse } from '../entities';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
  ) {}
  generateToken = async ({
    payload,
    options = {
      secret: process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
      expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
    },
  }: {
    payload: object;
    options?: JwtSignOptions;
  }): Promise<string> => {
    return await this.jwtService.signAsync(payload, options);
  };

  verifyToken = async ({
    token,
    options = {
      secret: process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
    },
  }: {
    token: string;
    options?: JwtVerifyOptions;
  }): Promise<JwtPayload> => {
    return (await this.jwtService.verifyAsync(
      token,
      options,
    )) as unknown as JwtPayload;
  };

  detectSignatureLevel = async (
    role: RoleEnum,
  ): Promise<SignatureLevelEnum> => {
    let signatureLevel: SignatureLevelEnum = SignatureLevelEnum.Bearer;

    switch (role) {
      case RoleEnum.admin:
      case RoleEnum.superAdmin:
        signatureLevel = SignatureLevelEnum.System;

        break;

      default:
        signatureLevel = SignatureLevelEnum.Bearer;
        break;
    }
    return signatureLevel;
  };

  getSignatures = async (
    signatureLevel: SignatureLevelEnum = SignatureLevelEnum.Bearer,
  ): Promise<{ access_signature: string; refresh_signature: string }> => {
    let signatures: { access_signature: string; refresh_signature: string } = {
      access_signature: '',
      refresh_signature: '',
    };

    switch (signatureLevel) {
      case SignatureLevelEnum.System:
        signatures.access_signature = process.env
          .ACCESS_SYSTEM_TOKEN_SIGNATURE as string;

        signatures.refresh_signature = process.env
          .REFRESH_SYSTEM_TOKEN_SIGNATURE as string;
        break;

      default:
        signatures.access_signature = process.env
          .ACCESS_USER_TOKEN_SIGNATURE as string;

        signatures.refresh_signature = process.env
          .REFRESH_USER_TOKEN_SIGNATURE as string;
        break;
    }
    return signatures;
  };

  createLoginCredentials = async (user: UserDocument):Promise<LoginCredentialsResponse> => {
    const signatureLevel = await this.detectSignatureLevel(user.role);
    const signatures = await this.getSignatures(signatureLevel);
    console.log({ signatures });
    const jwtid = randomUUID();

    const access_token = await this.generateToken({
      payload: { _id: user._id },
      options: {
        expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
        jwtid,
        secret: signatures.access_signature,
      },
    });
    const refresh_token = await this.generateToken({
      payload: { _id: user._id },
      options: {
        expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
        jwtid,
        secret: signatures.refresh_signature,
      },
    });
    return { access_token, refresh_token };
  };

  decodeToken = async ({
    authorization,
    tokenType = TokenEnum.access,
  }: {
    authorization: string;
    tokenType?: TokenEnum;
  }):Promise<{user:UserDocument;decoded:JwtPayload}> => {
   try {
     const [bearerKey, token] = authorization.split(' ');
    if (!bearerKey || !token) {
      throw new UnauthorizedException('Missing Token Parts');
    }

    const signatures = await this.getSignatures(
      bearerKey as SignatureLevelEnum,
    );
    const decoded = await this.verifyToken({
      token,
      options: {
        secret:
          tokenType === TokenEnum.refresh
            ? signatures.refresh_signature
            : signatures.access_signature,
      },
    });
    if (!decoded?.sub || !decoded?.iat) {
      throw new BadRequestException('In_valid token payload ');
    }

    if (
      decoded.jti &&
      (await this.tokenRepository.findOne({ filter: { jti: decoded.jti } }))
    ) {
      throw new UnauthorizedException('invalid or old login credentials');
    }

    const user = (await this.userRepository.findOne({
      filter: { _id: decoded.sub },
    })) as UserDocument;

    if (!user) {
      throw new BadRequestException('Not register account');
    }

    if (user.changeCredentialsTime?.getTime() || 0 > decoded.iat * 1000) {
      throw new UnauthorizedException('invalid or old login credentials');
    }

    return { user, decoded };
   } catch (error) {
    throw new InternalServerErrorException(error.message||'something went wrong')
   }
  };

  createRevokeToken = async (decoded: JwtPayload): Promise<TokenDocument> => {
    const [result] =
      (await this.tokenRepository.create({
        data: [
          {
            jti: decoded.jti as string,
            expiredAt: new Date(
              (decoded.iat as number) +
                Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
            ),
            createdBy: parseObjectId(decoded.sub as string),
          },
        ],
      })) || [];
    if (!result) {
      throw new BadRequestException('Fail to Revoke this token');
    }
    return result;
  };
}
