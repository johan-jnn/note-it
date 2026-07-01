import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AccountsService, type AccountWithProfile } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  async create(
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<AccountWithProfile> {
    return this.accountsService.create(createAccountDto);
  }

  @Get()
  async findAll(
    @Query('directorsOnly') directorsOnly?: string,
  ): Promise<AccountWithProfile[]> {
    return this.accountsService.findAll({
      directorsOnly: directorsOnly === 'true',
    });
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AccountWithProfile> {
    return this.accountsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<AccountWithProfile> {
    return this.accountsService.update(id, updateAccountDto);
  }
}
