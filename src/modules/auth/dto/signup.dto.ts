import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';
import { IsMatch } from 'src/common';

export class ResendConfirmEmailDto {
  @IsEmail()
  email: string;
}
export class ConfirmEmailDto extends ResendConfirmEmailDto {
  @Matches(/^\d{6}$/)
  otp: string;
}
export class LoginBodyDto extends ResendConfirmEmailDto {
  @IsStrongPassword({ minUppercase: 1 })
  password: string;
}
export class SignupBodyDto extends LoginBodyDto {
  @Length(2, 20, {
    message: 'username min length is 2 char and max length is 52 char,',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ValidateIf((data: SignupBodyDto) => {
    return Boolean(data.password);
  })
  @IsMatch<string>(['password'], {
    message: 'confirm password not identical with password',
  })
  confirmPassword: string;
}

export class EmailDto {
  @IsEmail()
  email: string;
}

export class ForgotPasswordCodeDto extends EmailDto {}

export class VerifyForgotPasswordDto extends EmailDto {
  @IsNotEmpty()
  @IsString()
  otp: string;
}

export class ResetForgotPasswordDto extends VerifyForgotPasswordDto {
  @IsStrongPassword({ minUppercase: 1 }) 
  newPassword: string;
}

export class UpdatePasswordDto {
  @IsStrongPassword({ minUppercase: 1 })
  oldPassword: string;

  @IsStrongPassword({ minUppercase: 1 })
  newPassword: string;

  @IsStrongPassword({ minUppercase: 1 })
  confirmPassword: string;
}

export class GmailAuthDto {
  @IsNotEmpty()
  @IsString()
  idToken: string;
}
// export class SignupQueryDto {
//   @MaxLength(20)
//   @MinLength(2)
//   @IsString()
//   flag: string;
// }
