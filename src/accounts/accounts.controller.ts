import { Body, Controller, Post } from '@nestjs/common';
import { AccountsService, type AccountWithProfile } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  async create(
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<AccountWithProfile> {
    return this.accountsService.create(createAccountDto);
  }
}
