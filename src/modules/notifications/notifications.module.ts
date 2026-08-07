import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';
import { EmailService } from './email.service';
import { UserModule } from '../user/user.module';

import { User, UserSchema } from '../user/model/user.model';
import { Role, RoleSchema } from '../role/model/role.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
    UserModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsGateway, NotificationsService, EmailService],
  exports: [NotificationsService, EmailService],
})
export class NotificationsModule {}
