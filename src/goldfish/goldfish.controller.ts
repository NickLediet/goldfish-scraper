import { Controller, Get } from '@nestjs/common';
import { NavigatorService } from './navigator.service';

@Controller('goldfish')
export class GoldfishController {
  public constructor(private readonly navigator: NavigatorService){}

  @Get('/')
  public getTest() {
    this.navigator.test()
  }
}
