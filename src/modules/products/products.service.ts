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

  async create(product: Partial<Product>): Promise<ProductDocument> {
    return this.productModel.create(product);
  }

  async update(id: string, product: Partial<Product>): Promise<ProductDocument | null> {
    return this.productModel.findByIdAndUpdate(id, product, { new: true }).exec();
  }

  async remove(id: string): Promise<ProductDocument | null> {
    return this.productModel.findByIdAndDelete(id).exec();
  }
}
