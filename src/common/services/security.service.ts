import { Injectable } from '@nestjs/common';
import { compareHash, generateHash, generateNumericalOtp } from '../utils';
@Injectable()
export class SecurityService {
  constructor() {}
  generateHash = generateHash;
  compareHash = compareHash;
  generateNumericalOtp = generateNumericalOtp;
}
