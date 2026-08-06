import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../../shared/common/guards/auth.guard';
import { RolesGuard } from '../../shared/common/guards/roles.guard';
import { Roles } from '../../shared/common/decorators/roles.decorator';

@Controller('products/:productId/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('buyer')
  async createReview(
    @Req() req,
    @Param('productId') productId: string,
    @Body() body: { rating: number; comment?: string },
  ) {
    return this.reviewsService.createReview(
      req.user.userId,
      productId,
      body.rating,
      body.comment,
    );
  }

  @Get()
  async getProductReviews(@Param('productId') productId: string) {
    return this.reviewsService.getProductReviews(productId);
  }
}
