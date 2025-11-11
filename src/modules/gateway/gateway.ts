import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Types } from 'mongoose';
import {  Server } from 'socket.io';
import { Auth, RoleEnum, TokenEnum, TokenService, User } from 'src/common';
import { type ISocketAuth } from 'src/common/interfaces/socket.interface';
import { getSocketAuth } from 'src/common/utils/socket';
import { ConnectedSockets, type UserDocument } from 'src/DB';

@WebSocketGateway(80, {
  cors: {
    origin: '*',
  },
  // namespace:'public'
})
export class RealTimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private readonly server: Server;
  constructor(private readonly tokenService: TokenService) {}

  afterInit(server: Server) {
    console.log(`Realtime gateway started`);
  }
  async handleConnection(client: ISocketAuth) {
    try {
      const authorization = getSocketAuth(client);
      const { user, decoded } = await this.tokenService.decodeToken({
        authorization,
        tokenType: TokenEnum.access,
      });
      const userTapes = ConnectedSockets.get(user._id.toString()) || [];
      console.log({ userTapes });
      userTapes.push(client.id);
      ConnectedSockets.set(user._id.toString(), userTapes);
      client.credentials = { user, decoded };
      console.log({ ConnectedSockets });
    } catch (error) {
      client.emit('exception', error.message || 'Something is went wrong');
    }
  }
  handleDisconnect(client: ISocketAuth) {
    const userId = client.credentials?.user._id?.toString() as string;
    let remainingTabs =
      ConnectedSockets.get(userId)?.filter((tab: string) => {
        return tab !== client.id;
      }) || [];
    if (remainingTabs.length) {
      ConnectedSockets.set(userId, remainingTabs);
    } else {
      ConnectedSockets.delete(userId);
      this.server.emit('offline_user', userId);
    }
    console.log(`LogOut From::: ${client.id}`);
    console.log({ after_Disconnect: ConnectedSockets });
  }

 @Auth([RoleEnum.admin,RoleEnum.user])
  @SubscribeMessage('sayHi')
  sayHi(
    @MessageBody() data: any,
    @ConnectedSocket() client: ISocketAuth,
    @User() user :UserDocument
  ): string {
    this.server.emit('sayHi', 'Nest To FE');
    return 'Received data';
  }


  changeProductStock(products:{productId:Types.ObjectId,stock:number}[]){
    this.server.emit('changeProductStock',products)
  }
}
