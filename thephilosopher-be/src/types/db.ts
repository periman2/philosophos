import { Database } from './supabase'
export type DBTables = Database['public']['Tables'];

export type DBTableInsert<T extends keyof DBTables> = DBTables[T]['Insert'];
export type DBTableRow<T extends keyof DBTables> = DBTables[T]['Row'];
export type DBTableUpdate<T extends keyof DBTables> = DBTables[T]['Update'];

export type ResolveOptionalParameter<T extends object> = { [Property in keyof T]: T[Property] extends typeof Array<infer K> ? K : T[Property] }

export type ExcludeArrayTypes<T> = T extends (infer U)[]
  ? U
  : T extends object
  ? {
      [K in keyof T]: ExcludeArrayTypes<T[K]>;
    }
  : T;