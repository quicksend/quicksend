import { Test, TestingModule } from "@nestjs/testing";

import { TransmitService } from "./transmit.service";

describe("TransmitService", () => {
  let service: TransmitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransmitService]
    }).compile();

    service = module.get<TransmitService>(TransmitService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
