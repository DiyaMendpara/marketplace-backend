import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';
import { NotificationsGateway } from './notifications.gateway';
import { EmailService } from './email.service';
import { UserService } from '../user/user.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly model: Model<NotificationDocument>,
    private readonly gateway: NotificationsGateway,
    private readonly emailService: EmailService,
    private readonly userService: UserService,
  ) {}

  async create(
    userId: Types.ObjectId,
    title: string,
    body: string,
    link?: string,
  ) {
    const notification = await this.model.create({ userId, title, body, link });

    // Push real-time notification via WebSocket
    this.gateway.sendToUser(userId.toString(), {
      id: notification._id.toString(),
      title,
      body,
      link,
      read: false,
      createdAt: (notification as unknown as { createdAt: Date }).createdAt,
    });

    // Send email notification asynchronously if user has enabled email notifications
    this.userService
      .findById(userId.toString())
      .then((user) => {
        if (user && user.email && user.emailNotifications !== false) {
          this.emailService.sendNotificationEmail(
            user.email,
            user.name || 'User',
            title,
            body,
            link,
          );
        }
      })
      .catch(() => {});

    return notification;
  }

  async notifySubscribedBuyers(title: string, body: string, link?: string) {
    try {
      const result = await this.userService.getAllUsers({ role: 'buyer' });
      if (result && result.data && Array.isArray(result.data)) {
        for (const buyer of result.data) {
          if (buyer._id) {
            await this.create(buyer._id as unknown as Types.ObjectId, title, body, link);
          }
        }
      }
    } catch (e) {
      // Ignore background notification failure
    }
  }

  async list(userId: string) {
    return this.model
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
  }

  async read(id: string, userId: string) {
    return this.model
      .findOneAndUpdate(
        { _id: id, userId },
        { read: true },
        { new: true },
      )
      .lean();
  }

  async markAllRead(userId: string) {
    await this.model.updateMany(
      { userId, read: false },
      { read: true },
    );
    return { success: true };
  }

  async unreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.model.countDocuments({
      userId,
      read: false,
    });
    return { count };
  }

  async delete(id: string, userId: string) {
    const result = await this.model.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!result) {
      throw new NotFoundException('Notification not found');
    }

    return { success: true };
  }
}
