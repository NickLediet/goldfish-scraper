import { Module } from '@nestjs/common'
import { GoldfishController } from './goldfish.controller'
import { NavigatorService } from './navigator.service'
import * as Puppeteer from 'puppeteer'

@Module({
  controllers: [GoldfishController],
  providers: [
    NavigatorService,
    {
      provide: 'Pupeteer',
      useFactory: async () => await Puppeteer.launch()
    }
  ],
})
export class GoldfishModule {}
