import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './schemas/product.schema';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll() {
    const products = await this.productsService.findAll();
    // To maintain compatibility with frontend expected 'id' instead of '_id', map it
    return products.map(p => {
      const { _id, ...rest } = p.toObject();
      return { id: _id.toString(), ...rest };
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    if (!product) return null;
    const { _id, ...rest } = product.toObject();
    return { id: _id.toString(), ...rest };
  }

  @Post('seed')
  async seed(@Body() products: Partial<Product>[]) {
    return this.productsService.seed(products);
  }
}
