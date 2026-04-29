import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly config: ConfigService) {
    this.logger.log(`DATABASE_URL loaded`);
  }
  getHello(): string {
    return 'Hello World!';
  }
}
