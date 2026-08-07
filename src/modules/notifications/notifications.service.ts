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
import { User, UserDocument } from '../user/model/user.model';
import { Role, RoleDocument } from '../role/model/role.model';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly model: Model<NotificationDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,
    private readonly gateway: NotificationsGateway,
    private readonly emailService: EmailService,
    private readonly userService: UserService,
  ) {}

  private async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const user = await this.userModel.findById(userId).populate('role').exec();
      if (!user || !user.role) return false;
      const role = user.role as unknown as { name?: string };
      return role?.name === 'admin' || role?.name === 'super admin';
    } catch {
      return false;
    }
  }

  async create(
    userId: Types.ObjectId,
    title: string,
    body: string,
    link?: string,
    isForAdminCopy = false,
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

    // Send email notification if user has enabled email notifications
    try {
      const user = await this.userService.findById(userId.toString());
      if (user && user.email && user.emailNotifications !== false) {
        await this.emailService.sendNotificationEmail(
          user.email,
          user.name || 'User',
          title,
          body,
          link,
        );
      }
    } catch (err) {
      // Ignore background notification user lookup failure
    }

    // Forward notification to all admins & super admins if target user is buyer or supplier
    if (!isForAdminCopy) {
      try {
        const isAdmin = await this.isUserAdmin(userId.toString());
        if (!isAdmin) {
          const adminRoles = await this.roleModel.find({
            name: { $in: ['admin', 'super admin'] },
            is_deleted: false,
          }).exec();

          const adminRoleIds = adminRoles.map((r) => r._id);
          const adminUsers = await this.userModel.find({
            role: { $in: adminRoleIds },
            is_deleted: false,
            is_disabled: false,
            _id: { $ne: userId },
          }).exec();

          for (const adminUser of adminUsers) {
            await this.create(
              adminUser._id as unknown as Types.ObjectId,
              title,
              body,
              link,
              true, // isForAdminCopy flag to avoid recursion
            );
          }
        }
      } catch (e) {
        // Ignore forwarding failure
      }
    }

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
    const isAdmin = await this.isUserAdmin(userId);
    if (isAdmin) {
      return this.model
        .find({})
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
    }

    return this.model
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
  }

  async read(id: string, userId: string) {
    const isAdmin = await this.isUserAdmin(userId);
    const filter = isAdmin ? { _id: id } : { _id: id, userId };

    return this.model
      .findOneAndUpdate(
        filter,
        { read: true },
        { new: true },
      )
      .lean();
  }

  async markAllRead(userId: string) {
    const isAdmin = await this.isUserAdmin(userId);
    const filter = isAdmin ? { read: false } : { userId, read: false };

    await this.model.updateMany(
      filter,
      { read: true },
    );
    return { success: true };
  }

  async unreadCount(userId: string): Promise<{ count: number }> {
    const isAdmin = await this.isUserAdmin(userId);
    const filter = isAdmin ? { read: false } : { userId, read: false };

    const count = await this.model.countDocuments(filter);
    return { count };
  }

  async delete(id: string, userId: string) {
    const isAdmin = await this.isUserAdmin(userId);
    const filter = isAdmin ? { _id: id } : { _id: id, userId };

    const result = await this.model.findOneAndDelete(filter);

    if (!result) {
      throw new NotFoundException('Notification not found');
    }

    return { success: true };
  }
}
