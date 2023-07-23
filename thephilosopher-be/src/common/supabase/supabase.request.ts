import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { ExtractJwt } from 'passport-jwt';
import { Database } from 'src/types/supabase';

@Injectable({ scope: Scope.REQUEST })
export class SupabaseRequest {
  
  private readonly logger = new Logger(SupabaseRequest.name);
  private clientInstance: SupabaseClient<Database>;

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly configService: ConfigService,
  ) { }

  getClient() {
    this.logger.log('getting supabase client...');
    if (this.clientInstance) {
      this.logger.log('client exists - returning for current Scope.REQUEST');
      return this.clientInstance;
    }

    this.logger.log('initialising new supabase client for new Scope.REQUEST');

    this.clientInstance = createClient(
      this.configService.get('SUPABASE_URL') as string,
      this.configService.get('SUPABASE_KEY') as string,
      {
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: false,
          persistSession: false
        },
        global: {
          headers: {
            Authorization: `Bearer ${ExtractJwt.fromAuthHeaderAsBearerToken()(this.request)}`
          }
        }
      },
    );

    this.logger.log('auth has been set!');

    return this.clientInstance;
  }
}
