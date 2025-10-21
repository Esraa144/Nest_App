import { LoginCredentialsResponse } from 'src/common';

export class LoginResponse {
  message: string;
  data: { credentials: LoginCredentialsResponse };
}
