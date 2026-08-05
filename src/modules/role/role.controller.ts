import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
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
import { UserId } from '../../shared/common/decorators/userId.decorator';
import { JwtAuthGuard } from '../../shared/common/guards/auth.guard';
import { PermissionsGuard } from '../../shared/common/guards/permissions.guard';
import { messages } from '../../shared/utils/messages';
import { CreateRoleDTO } from './dto/create-role.dto';
import { UpdateRoleDTO } from './dto/update-role.dto';
import { GetAllRolesDTO } from './dto/getall-roles.dto';
import { RoleService } from './role.service';

@Controller('role')
@ApiTags('Role')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiResponse({ status: 403, description: 'Insufficient permissions' })
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @Permissions('role.create')
  @ApiBody({ type: CreateRoleDTO })
  @ApiOkResponse({ description: messages.role.role_create })
  async createRole(@Body() body: CreateRoleDTO, @UserId() user_id: string) {
    return await this.roleService.createRole(body, user_id);
  }

  @Get()
  @Permissions('role.view')
  @ApiOkResponse({ description: messages.role.role_get })
  async getAllRoles(@Query() query: GetAllRolesDTO) {
    return await this.roleService.getAllRoles(query);
  }

  @Get(':role_id')
  @Permissions('role.view')
  @ApiOkResponse({ description: messages.role.role_get })
  async getSingleRole(@Param('role_id') role_id: string) {
    return await this.roleService.getSingleRole(role_id);
  }

  @Put(':role_id')
  @Permissions('role.edit')
  @ApiBody({ type: UpdateRoleDTO })
  @ApiOkResponse({ description: messages.role.role_update })
  async updateRole(
    @Param('role_id') role_id: string,
    @Body() body: UpdateRoleDTO,
    @UserId() user_id: string,
  ) {
    return await this.roleService.updateRole(role_id, body, user_id);
  }

  @Delete(':role_id')
  @Permissions('role.delete')
  @ApiOkResponse({ description: messages.role.role_delete })
  async deleteRole(@Param('role_id') role_id: string) {
    return await this.roleService.deleteRole(role_id);
  }
}
