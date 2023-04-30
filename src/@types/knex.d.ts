// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    meals: {
      id: string
      name: string
      description: string
      created_at: string
      user_id: string
      onTheDiet: string
    }
    users: {
      id: string
      name: string
      email: string
      session_id: string
    }
  }
}
