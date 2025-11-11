import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, OrderParamDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { endpoint } from './authorization';
import { Auth, IResponse, RoleEnum, successResponse, User } from 'src/common';
import type { UserDocument } from 'src/DB';
import { OrderResponse } from './entities/order.entity';
import type{ Request } from 'express';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Auth(endpoint.create)
  @Post()
  async create(
    @User() user: UserDocument,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<IResponse<OrderResponse>> {
    const order = await this.orderService.create(createOrderDto, user);
    return successResponse<OrderResponse>({ status: 201, data: { order } });
  }

  @Auth([RoleEnum.admin,RoleEnum.superAdmin])
  @Patch()
   async cancel(
    @User() user: UserDocument,
    @Param() params: OrderParamDto,
  ): Promise<IResponse<OrderResponse>> {
    const order = await this.orderService.cancel(user,params.orderId);
    return successResponse<OrderResponse>({ data: { order } });
  }

  @Auth(endpoint.create)
  @Post(':orderId')
  async checkout(
    @Param() params: OrderParamDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {
    const session = await this.orderService.checkout(params.orderId, user);
    return successResponse({ status: 201, data: { session } });
  }

  @Post('webhook')
  async webhook(@Req() req: Request) {
    await this.orderService.webhook(req);
    return successResponse();
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
