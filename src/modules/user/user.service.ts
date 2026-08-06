import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { messages } from '../../shared/utils/messages';
import {
  sendBadRequest,
  sendSuccess,
  sendSystemError,
} from '../../shared/utils/response';
import { User, UserDocument } from './model/user.model';
import { Role, RoleDocument } from '../role/model/role.model';
import { GetAllUsersDTO } from './dto/getall-users.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
  ) {}

  findByEmail(email: string, withPassword = false) {
    const query = this.userModel.findOne({ email: email.trim().toLowerCase() });
    if (withPassword) query.select('+password');
    return query.exec();
  }

  findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  // `user.role` is expected to be populated with the Role document.
  toPublic(user: UserDocument) {
    const role = user.role as unknown as {
      name?: string;
      permissions?: string[];
    } | null;
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: role?.name,
      permissions: role?.permissions ?? [],
      status: user.status,
      companyName: user.companyName,
      phone: user.phone,
      photo: user.photo,
    };
  }

  // ---- Admin operations (guarded by @Permissions in the controller) ----

  async getAllUsers(query: GetAllUsersDTO) {
    try {
      const filter: Record<string, unknown> = { is_deleted: false };

      if (query.role) {
        const roleDoc = await this.roleModel.findOne({ name: query.role });
        // Unknown role -> empty result set (rather than returning everyone).
        filter.role = roleDoc?._id ?? null;
      }

      const users = await this.userModel
        .find(filter)
        .sort({ createdAt: -1 })
        .populate('role');

      return sendSuccess(
        messages.user.user_get,
        users.map((u) => this.toPublic(u)),
      );
    } catch (err: unknown) {
      if (err instanceof HttpException) throw err;
      return sendSystemError(messages.shared.system_error);
    }
  }

  async getSingleUser(id: string) {
    try {
      const user = await this.userModel
        .findOne({ _id: id, is_deleted: false })
        .populate('role');
      if (!user) return sendBadRequest(messages.user.user_not_found);
      return sendSuccess(messages.user.user_get, this.toPublic(user));
    } catch (err: unknown) {
      if (err instanceof HttpException) throw err;
      return sendSystemError(messages.shared.system_error);
    }
  }

  async setActive(id: string, active: boolean) {
    try {
      const u = await this.userModel.findOne({ _id: id, is_deleted: false });
      if (!u) return sendBadRequest(messages.user.user_not_found);
      
      const isSuperAdmin = u.email === (process.env.SUPER_ADMIN_EMAIL || 'admin@loomly.com');
      if (isSuperAdmin && !active) {
        return sendBadRequest("Cannot deactivate the system generated admin.");
      }

      const user = await this.userModel
        .findOneAndUpdate(
          { _id: id, is_deleted: false },
          { $set: { status: active ? 'active' : 'inactive' } },
          { new: true },
        )
        .populate('role');
      if (!user) return sendBadRequest(messages.user.user_not_found);
      return sendSuccess(messages.user.user_status_updated, this.toPublic(user));
    } catch (err: unknown) {
      if (err instanceof HttpException) throw err;
      return sendSystemError(messages.shared.system_error);
    }
  }

  async deleteUser(id: string) {
    try {
      const u = await this.userModel.findOne({ _id: id, is_deleted: false });
      if (!u) return sendBadRequest(messages.user.user_not_found);
      
      const isSuperAdmin = u.email === (process.env.SUPER_ADMIN_EMAIL || 'admin@loomly.com');
      if (isSuperAdmin) {
        return sendBadRequest("Cannot delete the system generated admin.");
      }

      // Soft delete — never physically removed.
      const user = await this.userModel.findOneAndUpdate(
        { _id: id, is_deleted: false },
        { $set: { is_deleted: true } },
      );
      if (!user) return sendBadRequest(messages.user.user_not_found);
      return sendSuccess(messages.user.user_deleted, {});
    } catch (err: unknown) {
      if (err instanceof HttpException) throw err;
      return sendSystemError(messages.shared.system_error);
    }
  }
}
