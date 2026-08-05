import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async findAll(): Promise<ProductDocument[]> {
    return this.productModel.find().exec();
  }

  async findOne(id: string): Promise<ProductDocument | null> {
    return this.productModel.findById(id).exec();
  }

  async seed(products: Partial<Product>[]): Promise<{ insertedCount: number }> {
    await this.productModel.deleteMany({});
    const inserted = await this.productModel.insertMany(products);
    return { insertedCount: inserted.length };
  }
}
