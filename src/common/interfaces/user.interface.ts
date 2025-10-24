export interface IUser {
  username: string;
  email: string;
  password: string;
  id: number;
}


export interface VerifiedGmailPayload {
  email: string;
  family_name: string;
  given_name: string;
  picture: string;
}