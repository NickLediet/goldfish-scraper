import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { GoldfishModule } from './goldfish/goldfish.module'


@Module({
  imports: [GoldfishModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
