import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from '../modules/user/model/user.model';
import { Role, RoleSchema } from '../modules/role/model/role.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (process.env.JWT_EXPIRY || '7d') as unknown as number,
        },
      }),
    }),
  ],
  providers: [ConfigService],
  exports: [JwtModule, MongooseModule, ConfigService],
})
export class SharedModule {}
