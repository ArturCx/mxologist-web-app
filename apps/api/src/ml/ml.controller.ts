import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CronSecretGuard } from './cron-secret.guard';
import { MlService } from './ml.service';

@UseGuards(CronSecretGuard)
@Controller('ml')
export class MlController {
  constructor(private readonly mlService: MlService) {}

  // Hit by Vercel Cron (see vercel.json) — crons are always GET requests.
  //   /ml/train                 retrain on real ratings
  //   /ml/train?synthetic=1     pipeline test on generated users (not served)
  @Get('train')
  train(
    @Query('synthetic') synthetic?: string,
    @Query('activate') activate?: string,
  ) {
    return this.mlService.train({
      synthetic: synthetic === '1',
      activate: activate === undefined ? undefined : activate === '1',
    });
  }

  @Get('status')
  status() {
    return this.mlService.status();
  }
}
