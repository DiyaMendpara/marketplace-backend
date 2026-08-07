import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { Model } from 'mongoose';

import { messages } from '../../shared/utils/messages';
import {
  sendBadRequest,
  sendSuccess,
  sendSystemError,
} from '../../shared/utils/response';
import { User, UserDocument } from '../user/model/user.model';
import { Role, RoleDocument } from '../role/model/role.model';
import { EmailService } from '../notifications/email.service';
import { LoginDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { SavePreferencesDTO } from './dto/save-preferences.dto';
import { GoogleAuthDTO } from './dto/google-auth.dto';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
  );

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async googleAuth(body: GoogleAuthDTO) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: body.credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload?.email) {
        return sendBadRequest(messages.auth.google_failed);
      }

      const email = payload.email.trim().toLowerCase();
      let user = await this.userModel.findOne({ email }).populate('role');

      if (!user) {
        // First-time Google sign-in -> create the account with the given role.
        const roleName = body.role === 'supplier' ? 'supplier' : 'buyer';
        const roleDoc = await this.roleModel.findOne({
          name: roleName,
          is_deleted: false,
        });
        if (!roleDoc) {
          return sendSystemError(messages.role.role_not_found);
        }

        user = await this.userModel.create({
          name: payload.name || email.split('@')[0],
          email,
          role: roleDoc._id,
          status: 'active',
          googleId: payload.sub,
          authProvider: 'google',
          photo: payload.picture,
        });
        await user.populate('role');
      } else if (
        user.is_deleted ||
        user.is_disabled ||
        user.status === 'inactive'
      ) {
        return sendBadRequest(messages.auth.account_deactivated);
      }

      const token = this.jwtService.sign({ user_id: user._id });
      return sendSuccess(messages.user.user_login, {
        token,
        user: this.toPublic(user),
      });
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw err;
      }
      return sendSystemError(messages.auth.google_failed);
    }
  }

  async register(body: RegisterDTO) {
    try {
      const emailNormalized = body.email ? body.email.trim().toLowerCase() : '';

      const existing = await this.userModel.findOne({ email: emailNormalized });
      if (existing) {
        return sendBadRequest(messages.user.email_exists);
      }

      // Self-registration is limited to the seeded buyer / supplier roles.
      const roleDoc = await this.roleModel.findOne({
        name: body.role,
        is_deleted: false,
      });
      if (!roleDoc) {
        return sendSystemError(messages.role.role_not_found);
      }

      const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);
      const hashedPassword = await bcrypt.hash(body.password, saltRounds);

      const user = await this.userModel.create({
        name: body.name,
        email: emailNormalized,
        password: hashedPassword,
        role: roleDoc._id,
        status: 'active',
        companyName: body.companyName,
        phone: body.phone,
      });
      await user.populate('role');

      const token = this.jwtService.sign({ user_id: user._id });
      return sendSuccess(messages.user.user_registered, {
        token,
        user: this.toPublic(user),
      });
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw err;
      }
      return sendSystemError(messages.shared.system_error);
    }
  }

  async login(body: LoginDTO) {
    try {
      const emailNormalized = body.email ? body.email.trim().toLowerCase() : '';

      const user = await this.userModel
        .findOne({ email: emailNormalized })
        .select('+password')
        .populate('role');

      if (!user || !user.password) {
        return sendBadRequest(messages.user.user_login_failed);
      }

      if (user.is_deleted || user.is_disabled || user.status === 'inactive') {
        return sendBadRequest(messages.auth.account_deactivated);
      }

      const isMatch = await bcrypt.compare(body.password, user.password);
      if (!isMatch) {
        return sendBadRequest(messages.user.user_login_failed);
      }

      const token = this.jwtService.sign({ user_id: user._id });
      return sendSuccess(messages.user.user_login, {
        token,
        user: this.toPublic(user),
      });
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw err;
      }
      return sendSystemError(messages.shared.system_error);
    }
  }

  async getProfile(user_id: string) {
    try {
      const user = await this.userModel.findById(user_id).populate('role');
      if (!user) {
        return sendBadRequest(messages.user.user_not_found);
      }
      return sendSuccess(messages.user.profile_fetched, this.toPublic(user));
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw err;
      }
      return sendSystemError(messages.shared.system_error);
    }
  }

  async updateProfile(user_id: string, body: UpdateProfileDTO) {
    try {
      const update: Record<string, unknown> = {};
      if (body.name !== undefined) update.name = body.name;
      if (body.companyName !== undefined) update.companyName = body.companyName;
      if (body.phone !== undefined) update.phone = body.phone;
      if (body.photo !== undefined) update.photo = body.photo;

      const user = await this.userModel
        .findByIdAndUpdate(user_id, { $set: update }, { new: true })
        .populate('role');

      if (!user) {
        return sendBadRequest(messages.user.user_not_found);
      }
      return sendSuccess(messages.user.profile_updated, this.toPublic(user));
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw err;
      }
      return sendSystemError(messages.shared.system_error);
    }
  }

  async changePassword(user_id: string, body: ChangePasswordDTO) {
    try {
      const user = await this.userModel.findById(user_id).select('+password');

      if (!user) {
        return sendBadRequest(messages.user.user_not_found);
      }

      if (!user.password) {
        return sendBadRequest(messages.auth.invalid_current_password);
      }

      const matches = await bcrypt.compare(body.currentPassword, user.password);
      if (!matches) {
        return sendBadRequest(messages.auth.invalid_current_password);
      }

      if (body.currentPassword === body.newPassword) {
        return sendBadRequest(messages.auth.password_same);
      }

      const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);
      user.password = await bcrypt.hash(body.newPassword, saltRounds);
      await user.save();

      return sendSuccess(messages.auth.password_changed, {});
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw err;
      }
      return sendSystemError(messages.shared.system_error);
    }
  }

  async savePreferences(user_id: string, body: SavePreferencesDTO) {
    try {
      const user = await this.userModel
        .findByIdAndUpdate(user_id, { $set: { preferences: body } }, { new: true })
        .populate('role');

      if (!user) {
        return sendBadRequest(messages.user.user_not_found);
      }
      return sendSuccess(messages.user.profile_updated, this.toPublic(user));
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw err;
      }
      return sendSystemError(messages.shared.system_error);
    }
  }

  async forgotPassword(body: ForgotPasswordDTO) {
    try {
      const email = body.email ? body.email.trim().toLowerCase() : '';
      const user = await this.userModel.findOne({ email });

      // Always return success message to prevent email enumeration
      if (!user) {
        return sendSuccess(messages.auth.forgot_password_sent, {});
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      user.resetOtp = otp;
      user.resetOtpExpires = expires;
      await user.save();

      // Send email
      await this.emailService.sendNotificationEmail(
        user.email,
        user.name || 'User',
        'Password Reset Code',
        `Your password reset code is ${otp}. This code is valid for 15 minutes.`,
      );

      return sendSuccess(messages.auth.forgot_password_sent, {});
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw err;
      }
      return sendSystemError(messages.shared.system_error);
    }
  }

  async resetPassword(body: ResetPasswordDTO) {
    try {
      const email = body.email ? body.email.trim().toLowerCase() : '';
      const user = await this.userModel
        .findOne({ email })
        .select('+resetOtp +resetOtpExpires');

      if (!user || !user.resetOtp || !user.resetOtpExpires) {
        return sendBadRequest(messages.auth.invalid_otp);
      }

      if (user.resetOtp !== body.otp.trim() || user.resetOtpExpires < new Date()) {
        return sendBadRequest(messages.auth.invalid_otp);
      }

      const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);
      user.password = await bcrypt.hash(body.newPassword, saltRounds);
      user.resetOtp = undefined;
      user.resetOtpExpires = undefined;
      await user.save();

      return sendSuccess(messages.auth.password_reset_success, {});
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw err;
      }
      return sendSystemError(messages.shared.system_error);
    }
  }

  // `user.role` is expected to be populated with the Role document.
  private toPublic(user: UserDocument) {
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
      preferences: user.preferences,
    };
  }
}
