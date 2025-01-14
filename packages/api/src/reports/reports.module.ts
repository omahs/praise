import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ConstantsProvider } from '../constants/constants.provider';
import { MongooseModule } from '@nestjs/mongoose';
import { Praise, PraiseSchema } from '../praise/schemas/praise.schema';
import {
  UserAccount,
  UserAccountSchema,
} from '../useraccounts/schemas/useraccounts.schema';
import { User, UserSchema } from '../users/schemas/users.schema';
import { ReportsCacheService } from './reports-cache.service';
import {
  ReportCacheItem,
  ReportCacheItemSchema,
} from './schemas/report-cache-item.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Praise.name, schema: PraiseSchema },
      { name: UserAccount.name, schema: UserAccountSchema },
      { name: ReportCacheItem.name, schema: ReportCacheItemSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, ReportsCacheService, ConstantsProvider],
})
export class ReportsModule {}
