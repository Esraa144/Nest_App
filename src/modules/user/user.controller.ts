import {
  Controller,
  Get,
  Headers,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  type IMulterFile,
  IResponse,
  IUser,
  PreferredLanguageInterceptor,
  RoleEnum,
  StorageEnum,
  successResponse,
  User,
} from 'src/common';
import { Auth } from 'src/common/decorators/auth.decorators';
import type { UserDocument } from 'src/DB';
import { delay, Observable, of } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudFileUpload, fileValidation } from 'src/common/utils/multer';
import { ProfileResponse } from './entities/user.entity';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth([RoleEnum.admin, RoleEnum.superAdmin, RoleEnum.user])
  @Get()
  async Profile(
    @User() user: UserDocument,
  ): Promise<IResponse<ProfileResponse>> {
  const profile = await this.userService.profile(user)
    return successResponse<ProfileResponse>({ data: { profile } });
  }

  @UseInterceptors(PreferredLanguageInterceptor)
  @Auth([RoleEnum.admin, RoleEnum.user])
  @Get()
  profile(@Headers() header: any, @User() user: UserDocument): Observable<any> {
    return of([{ message: 'Done' }]).pipe(delay(200));
  }

  @UseInterceptors(
    FileInterceptor(
      'profileImage',
      cloudFileUpload({
        storageApproach: StorageEnum.disk,
        validation: fileValidation.image,
        fileSize: 2,
      }),
    ),
  )
  @Auth([RoleEnum.user])
  @Patch('profile-image')
  async profileImage(
    @User() user: UserDocument,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 })],
        fileIsRequired: false,
      }),
    )
    file: IMulterFile,
  ): Promise<IResponse<ProfileResponse>> {
    const profile = await this.userService.profileImage(file, user);
    return successResponse<ProfileResponse>({ data: { profile } });
  }
}
