import { SettingsModule } from '@/settings/settings.module';
import { MongooseModule } from '@nestjs/mongoose';
import { QuantificationsService } from './services/quantifications.service';
import {
  Quantification,
  QuantificationsSchema,
} from './schemas/quantifications.schema';
import { UserAccountsModule } from '@/useraccounts/useraccounts.module';
import { UsersModule } from '@/users/users.module';
import { PraiseModule } from '@/praise/praise.module';
import { PeriodsModule } from '@/periods/periods.module';
import { Module, forwardRef } from '@nestjs/common';
import { QuantificationsController } from './quantitifcations.controller';
import { QuantificationsExportService } from './services/quantifications-export.service';
import { AuthModule } from '@/auth/auth.module';
import { ApiKeyModule } from '@/api-key/api-key.module';
import { ConstantsProvider } from '@/constants/constants.provider';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quantification.name, schema: QuantificationsSchema },
    ]),
    forwardRef(() => PraiseModule),
    forwardRef(() => SettingsModule),
    forwardRef(() => PeriodsModule),
    forwardRef(() => UsersModule),
    UserAccountsModule,
    forwardRef(() => AuthModule),
    ApiKeyModule,
  ],
  controllers: [QuantificationsController],
  providers: [
    QuantificationsService,
    QuantificationsExportService,
    ConstantsProvider,
  ],
  exports: [
    QuantificationsService,
    MongooseModule.forFeature([
      { name: Quantification.name, schema: QuantificationsSchema },
    ]),
  ],
})
export class QuantificationsModule {}
