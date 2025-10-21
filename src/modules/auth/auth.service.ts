import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  generateNumericalOtp,
  IUser,
  LoginCredentialsResponse,
  OtpEnum,
  ProviderEnum,
  TokenService,
} from 'src/common';
import {
  ConfirmEmailDto,
  LoginBodyDto,
  ResendConfirmEmailDto,
  SignupBodyDto,
} from './dto/signup.dto';
import { OtpRepository, UserDocument, UserRepository } from 'src/DB';
import { Types } from 'mongoose';
import { SecurityService } from 'src/common/services/security.service';
import { sign } from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthenticationService {
  private users: IUser[] = [];
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
    private readonly securityService: SecurityService,
    private readonly tokenService: TokenService,
  ) {}

  private async createConfirmationOtp(userId: Types.ObjectId) {
    await this.otpRepository.create({
      data: [
        {
          otp: generateNumericalOtp(),
          expiredAt: new Date(Date.now() + 2 * 60 * 1000),
          createdBy: userId,
          type: OtpEnum.ConfirmEmail,
        },
      ],
    });
  }

  async signup(data: SignupBodyDto): Promise<string> {
    const { email, password, username } = data;
    const checkUserExist = await this.userRepository.findOne({
      filter: { email },
    });
    if (checkUserExist) {
      throw new ConflictException('Email already exist');
    }
    const [user] = await this.userRepository.create({
      data: [{ username, email, password }],
    });
    if (!user) {
      throw new BadRequestException(
        'Fail to signup this Account please try again later',
      );
    }
    await this.createConfirmationOtp(user._id);
    return 'Done';
  }

  async resendConfirmEmail(data: ResendConfirmEmailDto): Promise<string> {
    const { email } = data;
    const user = await this.userRepository.findOne({
      filter: { email, confirmEmail: { $exists: false } },
      options: {
        populate: [{ path: 'otp', match: { type: OtpEnum.ConfirmEmail } }],
      },
    });
    console.log({ user });

    if (!user) {
      throw new NotFoundException('Fail to find matching account');
    }
    if (user.otp?.length) {
      throw new ConflictException(
        `sorry we cannot grant you new otp until the existing on become expired please try again after :${user.otp[0].expiredAt}`,
      );
    }
    await this.createConfirmationOtp(user._id);
    return 'Done';
  }

  async confirmEmail(data: ConfirmEmailDto): Promise<string> {
    const { email, otp } = data;
    const user = await this.userRepository.findOne({
      filter: { email, confirmEmail: { $exists: false } },
      options: {
        populate: [{ path: 'otp', match: { type: OtpEnum.ConfirmEmail } }],
      },
    });
    console.log({ user });

    if (!user) {
      throw new NotFoundException('Fail to find matching account');
    }
    if (
      !(
        user.otp?.length &&
        (await this.securityService.compareHash(otp, user.otp[0].otp))
      )
    ) {
      throw new BadRequestException('in-valid Otp');
    }
    user.confirmEmail = new Date();
    await user.save();
    await this.otpRepository.deleteOne({ filter: { _id: user.otp[0]._id } });
    return 'Done';
  }

  async login(data: LoginBodyDto): Promise<LoginCredentialsResponse> {
    const { email, password } = data;
    const user = await this.userRepository.findOne({
      filter: {
        email,
        confirmEmail: { $exists: true },
        provider: ProviderEnum.System,
      },
    });
    if (!user) {
      throw new NotFoundException('Fail to find matching account');
    }
    if (!(await this.securityService.compareHash(password, user.password))) {
      throw new NotFoundException('Fail to find matching account');
    }

    return await this.tokenService.createLoginCredentials(user as UserDocument);
  }
}
