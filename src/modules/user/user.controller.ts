import { Controller, Get, Headers, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import {  PreferredLanguageInterceptor, RoleEnum, User } from 'src/common';
import { Auth } from 'src/common/decorators/auth.decorators';
import type{ UserDocument } from 'src/DB';
import { delay, Observable, of } from 'rxjs';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseInterceptors(PreferredLanguageInterceptor)
  @Auth([RoleEnum.admin, RoleEnum.user])
  @Get()
  profile(
    @Headers()header:any,
    @User() user: UserDocument): Observable<any> {
return of([{message:'Done'}]).pipe(delay(200))
  }
 
}
