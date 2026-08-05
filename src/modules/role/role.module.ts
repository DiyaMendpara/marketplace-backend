import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SharedModule } from '../../shared/shared.module';
import { Role, RoleSchema } from './model/role.model';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    SharedModule,
  ],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService, MongooseModule],
})
export class RoleModule {}
