import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@UseGuards(ClerkAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getMine(@CurrentUser() userId: string) {
    return this.settingsService.getForUser(userId);
  }

  @Patch()
  update(@CurrentUser() userId: string, @Body() dto: UpdateSettingsDto) {
    return this.settingsService.update(userId, dto);
  }
}
