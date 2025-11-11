import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { roleName } from 'src/common/decorators/roles.decorators';
import { RoleEnum } from 'src/common/enums';

@Injectable()
export class AuthorizationGuard implements CanActivate {
   constructor(
      private readonly reflector: Reflector,
    ) {}
     canActivate(context: ExecutionContext):boolean {
      const accessRoles: RoleEnum[] = this.reflector.getAllAndOverride<RoleEnum[]>(
        roleName,
        [context.getClass(),
          context.getHandler()
        ],
      )??[];
     
    let  role:RoleEnum=RoleEnum.user
      switch (context.getType()) {
        case 'http':
         role=context.switchToHttp().getRequest().credentials.user.role;
          break;
           case 'http':
         role=context.switchToWs().getClient().credentials.user.role;
          break;
        default:
          break;
      }
      return accessRoles.includes(role);
    }
}
