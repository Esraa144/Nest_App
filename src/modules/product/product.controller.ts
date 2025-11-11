import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  UsePipes,
  ValidationPipe,
  Query,
  Inject,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import {
  ProductParamDto,
  UpdateProductAttachmentDto,
  UpdateProductDto,
} from './dto/update-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { cloudFileUpload, fileValidation } from 'src/common/utils/multer';
import {
  Auth,
  GetAllDto,
  GetAllResponse,
  IProduct,
  IResponse,
  RoleEnum,
  StorageEnum,
  successResponse,
  TTL,
  User,
} from 'src/common';
import { endpoint } from './authorization';
import type { UserDocument } from 'src/DB';
import { ProductResponse } from './entities/product.entity';
import { Cache, CACHE_MANAGER, CacheTTL } from '@nestjs/cache-manager';
import { type RedisClientType } from '@redis/client';
import { RedisCacheInterceptor } from 'src/common/interceptor/cache.interceptor';
import { Observable, of } from 'rxjs';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
  ) {}

  @Get('test')
  async test() {
    let user = JSON.parse((await this.redisClient.get('user')) as string);
    if (!user) {
      user = { message: `Done at ${Date.now()}`, name: 'esraa' };
      await this.redisClient.set('user', JSON.stringify(user), { EX: 1000 });
    }
    return user;
  }

  @UseInterceptors(
    FilesInterceptor(
      'attachments',
      5,
      cloudFileUpload({
        validation: fileValidation.image,
        storageApproach: StorageEnum.disk,
      }),
    ),
  )
  @Auth([RoleEnum.user])
  @Post()
  async create(
    @UploadedFiles(ParseFilePipe) files: Express.Multer.File[],
    @User() user: UserDocument,
    @Body() createProductDto: CreateProductDto,
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.create(
      createProductDto,
      files,
      user,
    );
    return successResponse<ProductResponse>({ status: 201, data: { product } });
  }

  @Auth(endpoint.create)
  @Patch(':productId')
  async update(
    @User() user: UserDocument,
    @Param() params: ProductParamDto,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.update(
      params.productId,
      updateProductDto,
      user,
    );
    return successResponse<ProductResponse>({ data: { product } });
  }

  @UseInterceptors(
    FilesInterceptor(
      'attachments',
      5,
      cloudFileUpload({
        validation: fileValidation.image,
        storageApproach: StorageEnum.disk,
      }),
    ),
  )
  @Auth(endpoint.create)
  @Patch(':productId/attachment')
  async updateAttachment(
    @User() user: UserDocument,
    @Param() params: ProductParamDto,
    @Body() updateProductAttachmentDto: UpdateProductAttachmentDto,
    @UploadedFiles(new ParseFilePipe({ fileIsRequired: false }))
    files?: Express.Multer.File[],
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.updateAttachment(
      params.productId,
      updateProductAttachmentDto,
      user,
      files,
    );
    return successResponse<ProductResponse>({ data: { product } });
  }

  @Auth(endpoint.create)
  @Delete(':productId/freeze')
  async freeze(
    @Param() params: ProductParamDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {
    await this.productService.freeze(params.productId, user);
    return successResponse();
  }

  @Auth(endpoint.create)
  @Patch(':productId/restore')
  async restore(
    @Param() params: ProductParamDto,
    @User() user: UserDocument,
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.restore(params.productId, user);
    return successResponse<ProductResponse>({ data: { product } });
  }
  @Auth(endpoint.create)
  @Delete('productId')
  async remove(@Param() params: ProductParamDto, @User() user: UserDocument) {
    await this.productService.remove(params.productId, user);
    return successResponse();
  }

  @TTL(50)
  @UseInterceptors(RedisCacheInterceptor)
  @Get()
  async findAll(
    @Query() query: GetAllDto,
  ): Promise<Observable<IResponse<GetAllResponse<IProduct>>>> {
    const result = await this.productService.findAll(query);
    return of(successResponse<GetAllResponse<IProduct>>({ data: { result } }));
  }

  @Auth(endpoint.create)
  @Get('/archive ')
  async findAllArchives(
    @Query() query: GetAllDto,
  ): Promise<IResponse<GetAllResponse<IProduct>>> {
    const result = await this.productService.findAll(query, true);
    return successResponse<GetAllResponse<IProduct>>({ data: { result } });
  }

  @Get(':productId')
  async findOne(
    @Param() params: ProductParamDto,
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.findOne(params.productId);
    return successResponse<ProductResponse>({ data: { product } });
  }

  @Auth(endpoint.create)
  @Get(':productId/archive')
  async findOneArchive(
    @Param() params: ProductParamDto,
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.findOne(params.productId, true);
    return successResponse<ProductResponse>({ data: { product } });
  }

  @Auth([RoleEnum.user])
  @Patch(':productId/add-to-wishlist')
  async addToWishlist(
    @User() user: UserDocument,
    @Param() params: ProductParamDto,
  ): Promise<IResponse<ProductResponse>> {
    const product = await this.productService.addToWishlist(
      params.productId,
      user,
    );
    return successResponse<ProductResponse>({ data: { product } });
  }

  @Auth([RoleEnum.user])
  @Patch(':productId/remove-from-wishlist')
  async removeFromWishlist(
    @User() user: UserDocument,
    @Param() params: ProductParamDto,
  ): Promise<IResponse> {
    await this.productService.removeFromWishlist(params.productId, user);
    return successResponse();
  }
}
