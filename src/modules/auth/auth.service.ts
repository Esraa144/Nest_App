import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  emailEvent,
  generateNumericalOtp,
  IUser,
  LoginCredentialsResponse,
  OtpEnum,
  parseObjectId,
  ProviderEnum,
  TokenService,
} from 'src/common';
import {
  ConfirmEmailDto,
  ForgotPasswordCodeDto,
  GmailAuthDto,
  LoginBodyDto,
  ResendConfirmEmailDto,
  ResetForgotPasswordDto,
  SignupBodyDto,
  UpdatePasswordDto,
  VerifyForgotPasswordDto,
} from './dto/signup.dto';
import { OtpRepository, UserDocument, UserRepository } from 'src/DB';
import { Types } from 'mongoose';
import { SecurityService } from 'src/common/services/security.service';
import { OAuth2Client, TokenPayload } from 'google-auth-library';

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

  private async verifyGmailAccount(idToken: string): Promise<TokenPayload> {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.WEB_CLIENT_IDS?.split(',') || [],
    });
    const payload = ticket.getPayload();
    if (!payload?.email_verified) {
      throw new BadRequestException('Fail to verify this google account');
    }
    return payload;
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

  async sendForgotPasswordCode(data: ForgotPasswordCodeDto): Promise<void> {
    const { email } = data;

    const user = await this.userRepository.findOne({
      filter: {
        email,
        provider: ProviderEnum.System,
        confirmedAt: { $exists: true },
      },
    });

    if (!user) {
      throw new NotFoundException(
        'Invalid Account [not registered, invalid provider, or not confirmed]',
      );
    }

    const otp = this.securityService.generateNumericalOtp();
    const hashedOtp = await this.securityService.generateHash(String(otp));

    const result = await this.userRepository.updateOne({
      filter: { email },
      update: {
        resetPasswordOtp: hashedOtp,
      },
    });

    if (!result.matchedCount) {
      throw new BadRequestException(
        'Fail to send the reset code, please try again later',
      );
    }

    emailEvent.emit('Reset_Password', { to: email, otp });
  }

  async verifyForgotPassword(data: VerifyForgotPasswordDto): Promise<void> {
    const { email, otp } = data;

    const user = await this.userRepository.findOne({
      filter: {
        email,
        provider: ProviderEnum.System,
        resetPasswordOtp: { $exists: true },
      },
    });

    if (!user) {
      throw new NotFoundException(
        'Invalid Account [not registered, invalid provider, or not confirmed]',
      );
    }

    if (
      !(await this.securityService.compareHash(
        otp,
        user.resetPasswordOtp as string,
      ))
    ) {
      throw new ConflictException('invalid otp');
    }
  }

  async resetForgotPassword(data: ResetForgotPasswordDto): Promise<void> {
    const { email, otp, password } = data;

    const user = await this.userRepository.findOne({
      filter: {
        email,
        provider: ProviderEnum.System,
        resetPasswordOtp: { $exists: true },
      },
    });

    if (!user) {
      throw new NotFoundException(
        'Invalid Account [not registered, invalid provider, or not confirmed]',
      );
    }

    // التحقق من الـ OTP
    if (
      !(await this.securityService.compareHash(
        otp,
        user.resetPasswordOtp as string,
      ))
    ) {
      throw new ConflictException('invalid otp');
    }

    const newHashedPassword = await this.securityService.generateHash(password);

    const result = await this.userRepository.updateOne({
      filter: { email },
      update: {
        password: newHashedPassword,
        changeCredentialsTime: new Date(),
        $unset: { resetPasswordOtp: 1 },
      },
    });

    if (!result.matchedCount) {
      throw new BadRequestException('Fail to reset account password');
    }
  }

  async updatePassword(userId: string, data: UpdatePasswordDto): Promise<void> {
    const { oldPassword, newPassword, confirmPassword } = data;
    const objectId = parseObjectId(userId);

    const user = await this.userRepository.findById({ id: objectId });
    if (!user) {
      throw new NotFoundException('Invalid Account: user not found');
    }

    if (
      !(await this.securityService.compareHash(
        oldPassword,
        user.password as string,
      ))
    ) {
      throw new ConflictException('Old password is incorrect');
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Password mismatch confirm-password');
    }

    const newHashedPassword =
      await this.securityService.generateHash(newPassword);

    const result = await this.userRepository.findByIdAndUpdate({
      id: objectId,
      update: {
        password: newHashedPassword,
        changeCredentialsTime: new Date(),
      },
    });

    if (!result) {
      throw new BadRequestException('Fail to update account password');
    }
  }

  async signupWithGmail(data: GmailAuthDto): Promise<LoginCredentialsResponse> {
    const { idToken } = data;

    const gmailAccount = await this.verifyGmailAccount(idToken);
    const { email, family_name, given_name, picture } = gmailAccount;

    const user = await this.userRepository.findOne({ filter: { email } });

    if (user) {
      if (user.provider === ProviderEnum.Google) {
        return await this.tokenService.createLoginCredentials(
          user as UserDocument,
        );
      }
      throw new ConflictException(
        `Email exists with another provider: ${user.provider}`,
      );
    }

    const [newUser] =
      (await this.userRepository.create({
        data: [
          {
            firstName: given_name as string,
            lastName: family_name as string,
            email: email as string,

            provider: ProviderEnum.Google,

            confirmEmail: new Date(),

            // password: null,
          },
        ],
      })) || [];

    if (!newUser) {
      throw new BadRequestException(
        'Fail to signup gmail, please try again later',
      );
    }

    return await this.tokenService.createLoginCredentials(newUser);
  }

  async loginWithGmail(data: GmailAuthDto): Promise<LoginCredentialsResponse> {
    const { idToken } = data;

    const { email } = await this.verifyGmailAccount(idToken);

    const user = await this.userRepository.findOne({
      filter: {
        email,
        provider: ProviderEnum.Google,
      },
    });

    if (!user) {
      throw new NotFoundException(
        'Not registered account or registered with another provider',
      );
    }

    return await this.tokenService.createLoginCredentials(user as UserDocument);
  }
}
