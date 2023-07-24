import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SupabaseStrategy } from './supabase.strategy';
import { SupabaseGuard } from './supabase.guard';
import { Supabase } from './supabase';
import { SupabaseRequest } from './supabase.request';

@Module({
  imports: [ConfigModule],
  providers: [Supabase, SupabaseStrategy, SupabaseGuard, SupabaseRequest],
  exports: [Supabase, SupabaseStrategy, SupabaseGuard, SupabaseRequest],
})
export class SupabaseModule {}
