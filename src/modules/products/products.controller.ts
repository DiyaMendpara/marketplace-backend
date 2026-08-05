import { Controller, Get, Param, Post, Put, Delete, Body, NotFoundException } from '@nestjs/common';
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

  @Post()
  async create(@Body() product: Partial<Product>) {
    const created = await this.productsService.create(product);
    const { _id, ...rest } = created.toObject();
    return { id: _id.toString(), ...rest };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() product: Partial<Product>) {
    const updated = await this.productsService.update(id, product);
    if (!updated) throw new NotFoundException('Product not found');
    const { _id, ...rest } = updated.toObject();
    return { id: _id.toString(), ...rest };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deleted = await this.productsService.remove(id);
    if (!deleted) throw new NotFoundException('Product not found');
    return { id };
  }
}
