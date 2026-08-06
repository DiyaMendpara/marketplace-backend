import {
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  Body,
  Query,
  UseGuards,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { JwtAuthGuard } from '../../shared/common/guards/auth.guard';
import { UserId } from '../../shared/common/decorators/userId.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(@Query() query: QueryProductsDto) {
    const result = await this.productsService.findAll(query);
    return {
      data: result.data.map((p) => {
        const { _id, ...rest } = p.toObject();
        return { id: _id.toString(), ...rest };
      }),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const { _id, ...rest } = product.toObject();
    return { id: _id.toString(), ...rest };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() dto: CreateProductDto,
    @UserId() userId: string,
  ) {
    const created = await this.productsService.create(dto, userId);
    const { _id, ...rest } = created.toObject();
    return { id: _id.toString(), ...rest };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @UserId() userId: string,
  ) {
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.supplier.toString() !== userId.toString()) {
      throw new ForbiddenException('You can only update your own products');
    }
    const updated = await this.productsService.update(id, dto);
    if (!updated) {
      throw new NotFoundException('Product not found');
    }
    const { _id, ...rest } = updated.toObject();
    return { id: _id.toString(), ...rest };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id') id: string,
    @UserId() userId: string,
  ) {
    const product = await this.productsService.findOne(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.supplier.toString() !== userId.toString()) {
      throw new ForbiddenException('You can only delete your own products');
    }
    await this.productsService.remove(id);
    return { id };
  }
}
