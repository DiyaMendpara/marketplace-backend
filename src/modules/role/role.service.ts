import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { messages } from '../../shared/utils/messages';
import {
  sendBadRequest,
  sendSuccess,
  sendSystemError,
} from '../../shared/utils/response';
import { Role, RoleDocument } from './model/role.model';
import { CreateRoleDTO } from './dto/create-role.dto';
import { UpdateRoleDTO } from './dto/update-role.dto';
import { GetAllRolesDTO } from './dto/getall-roles.dto';

// System roles that cannot be edited or deleted through the API.
const PROTECTED_ROLES = ['super admin', 'admin', 'buyer', 'supplier'];

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
  ) {}

  async createRole(body: CreateRoleDTO, created_by?: string) {
    try {
      const name = body.name.trim().toLowerCase();
      const existing = await this.roleModel.findOne({ name, is_deleted: false });
      if (existing) return sendBadRequest(messages.role.role_exists);

      const role = await this.roleModel.create({ ...body, name, created_by });
      return sendSuccess(messages.role.role_create, role);
    } catch (err: unknown) {
      if (err instanceof HttpException) throw err;
      return sendSystemError(messages.shared.system_error);
    }
  }

  async getAllRoles(query: GetAllRolesDTO) {
    try {
      const page = Math.max(1, parseInt(query.page || '1', 10));
      const limit = Math.max(1, parseInt(query.limit || '10', 10));
      const filter: Record<string, unknown> = { is_deleted: false };
      if (query.search) {
        filter.name = { $regex: query.search.trim(), $options: 'i' };
      }

      const [data, total] = await Promise.all([
        this.roleModel
          .find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        this.roleModel.countDocuments(filter),
      ]);

      return sendSuccess(messages.role.role_get, data, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      });
    } catch (err: unknown) {
      if (err instanceof HttpException) throw err;
      return sendSystemError(messages.shared.system_error);
    }
  }

  async getSingleRole(role_id: string) {
    try {
      const role = await this.roleModel.findOne({
        _id: role_id,
        is_deleted: false,
      });
      if (!role) return sendBadRequest(messages.role.role_not_found);
      return sendSuccess(messages.role.role_get, role);
    } catch (err: unknown) {
      if (err instanceof HttpException) throw err;
      return sendSystemError(messages.shared.system_error);
    }
  }

  async updateRole(role_id: string, body: UpdateRoleDTO, updated_by?: string) {
    try {
      const role = await this.roleModel.findOne({
        _id: role_id,
        is_deleted: false,
      });
      if (!role) return sendBadRequest(messages.role.role_not_found);
      if (PROTECTED_ROLES.includes(role.name)) {
        return sendBadRequest(messages.role.role_protected);
      }

      const update: Record<string, unknown> = { updated_by };
      if (body.name !== undefined) update.name = body.name.trim().toLowerCase();
      if (body.description !== undefined) update.description = body.description;
      if (body.permissions !== undefined) update.permissions = body.permissions;

      const updated = await this.roleModel.findByIdAndUpdate(
        role_id,
        { $set: update },
        { new: true },
      );
      return sendSuccess(messages.role.role_update, updated);
    } catch (err: unknown) {
      if (err instanceof HttpException) throw err;
      return sendSystemError(messages.shared.system_error);
    }
  }

  async deleteRole(role_id: string) {
    try {
      const role = await this.roleModel.findOne({
        _id: role_id,
        is_deleted: false,
      });
      if (!role) return sendBadRequest(messages.role.role_not_found);
      if (PROTECTED_ROLES.includes(role.name)) {
        return sendBadRequest(messages.role.role_protected);
      }

      await this.roleModel.findByIdAndUpdate(role_id, {
        $set: { is_deleted: true },
      });
      return sendSuccess(messages.role.role_delete, {});
    } catch (err: unknown) {
      if (err instanceof HttpException) throw err;
      return sendSystemError(messages.shared.system_error);
    }
  }
}
