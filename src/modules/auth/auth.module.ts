import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SharedModule } from '../../shared/shared.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { User, UserSchema } from '../user/model/user.model';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    SharedModule,
    NotificationsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
