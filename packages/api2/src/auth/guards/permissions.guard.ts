import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Permission } from '../enums/permission.enum';
import { RolePermissions } from '../role-permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(private reflector: Reflector) {}

  /**
   * Checks if the user has the required permissions to access the route.
   */
  canActivate(context: ExecutionContext): boolean {
    // Get the required permissions from the route handler or controller.
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions are required, allow access.
    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      this.logger.error(
        "No user found in request. Make sure you're using the JwtAuthGuard before the PermissionsGuard.",
      );
      return false;
    }

    // Check if the user has any of the required permissions.
    for (const role of user.roles) {
      const rolePermissions = RolePermissions[role];
      if (
        requiredPermissions.some((permission) =>
          rolePermissions.includes(permission),
        )
      ) {
        return true;
      }
    }
    return false;
  }
}
