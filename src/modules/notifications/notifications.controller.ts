import {
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserId } from '../../shared/common/decorators/userId.decorator';
import { JwtAuthGuard } from '../../shared/common/guards/auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@UserId() userId: string) {
    return this.notifications.list(userId);
  }

  @Get('unread-count')
  unreadCount(@UserId() userId: string) {
    return this.notifications.unreadCount(userId);
  }

  @Put(':id/read')
  read(@Param('id') id: string, @UserId() userId: string) {
    return this.notifications.read(id, userId);
  }

  @Put('read-all')
  markAllRead(@UserId() userId: string) {
    return this.notifications.markAllRead(userId);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @UserId() userId: string) {
    return this.notifications.delete(id, userId);
  }
}
