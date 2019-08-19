import { Test, TestingModule } from '@nestjs/testing';
import { NavigatorService } from './navigator.service';

describe('NavigatorService', () => {
  let service: NavigatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NavigatorService],
    }).compile();

    service = module.get<NavigatorService>(NavigatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
