import { Injectable } from '@nestjs/common';
import { compareHash, generateHash } from '../utils';
@Injectable()
export class SecurityService {
  constructor() {}
  generateHash = generateHash;
  compareHash = compareHash;
}
