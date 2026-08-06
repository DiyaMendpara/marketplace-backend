import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async createReview(
    buyerId: string,
    productId: string,
    rating: number,
    comment?: string,
  ) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    // 1. Check if the buyer has already reviewed this product
    const existingReview = await this.reviewModel.findOne({
      buyerId: new Types.ObjectId(buyerId),
      productId: new Types.ObjectId(productId),
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product');
    }

    // 2. Check if the buyer has a Completed order for this product
    const order = await this.orderModel.findOne({
      buyerId: new Types.ObjectId(buyerId),
      status: 'Completed',
      'items.productId': new Types.ObjectId(productId),
    });

    if (!order) {
      throw new BadRequestException(
        'You can only review products from delivered orders',
      );
    }

    // 3. Create the review
    const review = await this.reviewModel.create({
      buyerId: new Types.ObjectId(buyerId),
      productId: new Types.ObjectId(productId),
      rating,
      comment,
    });

    // 4. Update the product's average rating and review count
    const allReviews = await this.reviewModel.find({
      productId: new Types.ObjectId(productId),
    });

    const reviewCount = allReviews.length;
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / reviewCount;

    await this.productModel.findByIdAndUpdate(productId, {
      reviewCount,
      averageRating,
    });

    return review;
  }

  async getProductReviews(productId: string) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    return this.reviewModel
      .find({ productId: new Types.ObjectId(productId) })
      .populate('buyerId', 'name email company')
      .sort({ createdAt: -1 })
      .exec();
  }
}
