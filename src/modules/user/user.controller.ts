import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { IUser } from 'src/common';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  allUsers(): { message: string; data: { users: IUser[] } } {
    const users: IUser[] = this.userService.allUsers();
    return { message: 'Done', data: { users } };
  }
}
