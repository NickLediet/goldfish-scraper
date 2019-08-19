import { Test, TestingModule } from '@nestjs/testing';
import { GoldfishController } from './goldfish.controller';

describe('Goldfish Controller', () => {
  let controller: GoldfishController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoldfishController],
    }).compile();

    controller = module.get<GoldfishController>(GoldfishController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
