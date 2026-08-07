import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { UserId } from '../../shared/common/decorators/userId.decorator';
import { JwtAuthGuard } from '../../shared/common/guards/auth.guard';
import type { AuthRequest } from '../../shared/types/auth-request.interface';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { invoicePdf } from './invoice';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  create(@UserId() userId: string, @Body() dto: CreateOrderDto) {
    return this.orders.create(userId, dto);
  }

  @Get()
  list(@UserId() userId: string, @Req() req: AuthRequest) {
    return this.orders.list(userId, req.user?.role ?? 'buyer');
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @UserId() userId: string,
    @Req() req: AuthRequest,
  ) {
    return this.orders.findOne(id, userId, req.user?.role ?? 'buyer');
  }

  @Put(':id/status')
  status(
    @Param('id') id: string,
    @UserId() userId: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.orders.updateStatus(id, userId, dto.status);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @UserId() userId: string) {
    return this.orders.cancel(id, userId);
  }

  @Get(':id/invoice')
  async invoice(
    @Param('id') id: string,
    @UserId() userId: string,
    @Req() req: AuthRequest,
    @Res() res: Response,
  ) {
    const order = await this.orders.invoice(id, userId);
    const pdf = await invoicePdf({
      reference: order.reference,
      total: order.total,
      items: order.items,
      shipping: order.shipping,
      createdAt: (order as unknown as { createdAt: Date }).createdAt,
      role: req.user?.role ?? 'buyer',
    });
    res
      .set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${order.reference}-invoice.pdf"`,
      })
      .send(pdf);
  }
}
