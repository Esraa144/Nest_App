import { Injectable } from '@nestjs/common';
import { S3Service, StorageEnum } from 'src/common';
import { UserDocument, UserRepository } from 'src/DB';

@Injectable()
export class UserService {
  constructor(private readonly s3Service: S3Service,
    private readonly userRepository: UserRepository
  ) {}

  async profileImage(
    file: Express.Multer.File,
    user: UserDocument,
  ): Promise<UserDocument> {
    user.profilePicture = await this.s3Service.uploadFile({
      file,
      storageApproach: StorageEnum.disk,
      path: `user/${user._id.toString()}`,
    });
    await user.save();
    return user;
  }


  async profile(
    user: UserDocument,
  ): Promise<UserDocument> {
   const profile = await this.userRepository.findOne({filter:{_id:user._id},options:{populate:[{path:'wishlist'}]}
   }) as UserDocument
    return profile;
  }
}
