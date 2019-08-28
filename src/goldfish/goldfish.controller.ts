import { Controller, Get, Query } from '@nestjs/common';
import { NavigatorService } from './navigator.service';
import { INavigatorParams } from './navigatorParams.interface';

@Controller('goldfish')
export class GoldfishController {
  public constructor(private readonly navigator: NavigatorService){}

  @Get('/today')
  public async getToday(@Query() params): Promise<any> {
    const config = this.createConfig(params)

    if(Object.keys(config).length > 0) {
      this.navigator.setConfig(config)
    }

    return await this.navigator.today()
  }

  private createConfig(params): INavigatorParams {
    const config: INavigatorParams = {}

    config.numberOfTopRows = params.top ? parseInt(params.top): 5
    config.numberOfBottomRows = params.bottom ? parseInt(params.bottom): 5

    return config
  }
}
