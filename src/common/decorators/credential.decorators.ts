
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, context: ExecutionContext)=> {
   let user:any;
   switch (context.getType()) {
      case 'http':
        user = context.switchToHttp().getRequest().credentials.user;
        break;
         case 'ws':
        user = context.switchToWs().getClient().credentials.user;
        break;
      default:
        break;
    }
    return user;
  },
)




export const Decoded = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
   let decoded:any;
   switch (context.getType()) {
      case 'http':
        decoded = context.switchToHttp().getRequest().credentials.decoded;
        break;
      default:
        break;
    }
    return decoded;
  },
);
