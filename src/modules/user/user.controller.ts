import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Permissions } from '../../shared/common/decorators/permissions.decorator';
import { JwtAuthGuard } from '../../shared/common/guards/auth.guard';
import { PermissionsGuard } from '../../shared/common/guards/permissions.guard';
import { messages } from '../../shared/utils/messages';
import { GetAllUsersDTO } from './dto/getall-users.dto';
import { SetActiveDTO } from './dto/set-active.dto';
import { UserService } from './user.service';

// Every route requires the caller to hold the relevant user.* permission
// (admins have them; buyers/suppliers do not, so they get 403).
@Controller('user')
@ApiTags('User (Admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiResponse({ status: 403, description: 'Insufficient permissions' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Permissions('user.view')
  @ApiOkResponse({ description: messages.user.user_get })
  async getAllUsers(@Query() query: GetAllUsersDTO) {
    return await this.userService.getAllUsers(query);
  }

  @Get(':id')
  @Permissions('user.view')
  @ApiOkResponse({ description: messages.user.user_get })
  async getSingleUser(@Param('id') id: string) {
    return await this.userService.getSingleUser(id);
  }

  @Put(':id/status')
  @Permissions('user.edit')
  @ApiBody({ type: SetActiveDTO })
  @ApiOkResponse({ description: messages.user.user_status_updated })
  async setActive(@Param('id') id: string, @Body() body: SetActiveDTO) {
    return await this.userService.setActive(id, body.active);
  }

  @Delete(':id')
  @Permissions('user.delete')
  @ApiOkResponse({ description: messages.user.user_deleted })
  async deleteUser(@Param('id') id: string) {
    return await this.userService.deleteUser(id);
  }
}
