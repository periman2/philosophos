import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from 'src/types/supabase';

@Injectable()
export class Supabase {
  
  private readonly logger = new Logger(Supabase.name);
  private clientInstance: SupabaseClient<Database>;

  constructor(
    private readonly configService: ConfigService,
  ) { }

  getClient() {
    
    if (this.clientInstance) {
      return this.clientInstance;
    }

    this.clientInstance = createClient(
      this.configService.get('SUPABASE_URL') as string,
      this.configService.get('SUPABASE_SERVICE_ROLE_KEY') as string,
      {
        auth: {
          persistSession: false
        }
      }
    );

    this.logger.log('auth has been set!');

    return this.clientInstance;
  }
}
