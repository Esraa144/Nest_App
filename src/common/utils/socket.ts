import { BadRequestException } from "@nestjs/common";
import { Socket } from "socket.io";

export const getSocketAuth=(client:Socket):string=>{
const authorization = client.handshake.auth.authorization?? client.handshake.auth.authorization;

if (!authorization) {
    client.emit('exception','missing authorization')
}
return authorization
}