import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
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
import { LoginResponse } from './entities/auth.entity';
import { IResponse, successResponse } from 'src/common';


@UsePipes(
  new ValidationPipe({
    whitelist:true,
    forbidNonWhitelisted:true,
  }),
)
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('signup')
  async signup(
    @Body()
    body: SignupBodyDto,
  ): Promise<IResponse> {
    console.log({ body });

    await this.authenticationService.signup(body);
    return successResponse();
  }

  @Post('resend-confirm-email')
  async resendConfirmEmail(
    @Body()
    body: ResendConfirmEmailDto,
  ):Promise<IResponse> {
    console.log({ body });

    await this.authenticationService.resendConfirmEmail(body);
    return successResponse();
  }

  @Patch('confirm-email')
  async confirmEmail(
    @Body()
    body: ConfirmEmailDto,
  ): Promise<IResponse> {
    console.log({ body });

    await this.authenticationService.confirmEmail(body);
    return successResponse();
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginBodyDto): Promise<IResponse<LoginResponse>> {
    const credentials = await this.authenticationService.login(body);
    return successResponse<LoginResponse>({
       message: 'Done',
       data: { credentials }
       });
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



