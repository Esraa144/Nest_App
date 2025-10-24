import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import {
  ConfirmEmailDto,
  ForgotPasswordCodeDto,
  GmailAuthDto,
  LoginBodyDto,
  ResendConfirmEmailDto,
  ResetForgotPasswordDto,
  SignupBodyDto,
  VerifyForgotPasswordDto,
} from './dto/signup.dto';
import { LoginCredentialsResponse } from 'src/common';
import { LoginResponse } from './entities/auth.entity';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('signup')
  async signup(
    @Body()
    body: SignupBodyDto,
  ): Promise<{
    message: string;
  }> {
    console.log({ body });

    await this.authenticationService.signup(body);
    return { message: 'Done' };
  }

  @Post('resend-confirm-email')
  async resendConfirmEmail(
    @Body()
    body: ResendConfirmEmailDto,
  ): Promise<{
    message: string;
  }> {
    console.log({ body });

    await this.authenticationService.resendConfirmEmail(body);
    return { message: 'Done' };
  }

  @Patch('confirm-email')
  async confirmEmail(
    @Body()
    body: ConfirmEmailDto,
  ): Promise<{
    message: string;
  }> {
    console.log({ body });

    await this.authenticationService.confirmEmail(body);
    return { message: 'Done' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginBodyDto): Promise<LoginResponse> {
    const credentials = await this.authenticationService.login(body);
    return { message: 'Done', data: { credentials } };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body()
    body: ForgotPasswordCodeDto,
  ): Promise<{ message: string }> {
    await this.authenticationService.sendForgotPasswordCode(body); 
    return { message: 'Password reset instructions sent to your email, if the user exists.' };
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyPasswordResetOtp(
    @Body()
    body: VerifyForgotPasswordDto,
  ): Promise<{ message: string }> {
    await this.authenticationService.verifyForgotPassword(body);
    return { message: 'OTP verified successfully.' };
  }

  @Patch('reset-password')
  async resetPassword(
    @Body()
    body: ResetForgotPasswordDto,
  ): Promise<{ message: string }> {
    await this.authenticationService.resetForgotPassword(body);
    return { message: 'Password has been updated successfully.' };
  }

  @Post('gmail/signup')
  async signupWithGmail(@Body() body: GmailAuthDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const credentials = await this.authenticationService.signupWithGmail(body);

    return { 
        statusCode: 201, 
        message: 'Signup successful', 
        data: { credentials } 
    };
  }

  @Post('gmail/login')
  @HttpCode(HttpStatus.OK) 
  async loginWithGmail(@Body() body: GmailAuthDto) {
    const credentials = await this.authenticationService.loginWithGmail(body);
    
    return { 
        statusCode: 200, 
        message: 'Login successful', 
        data: { credentials } 
    };
  }
}



