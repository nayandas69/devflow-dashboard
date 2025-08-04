/**
 * DevFlow Dashboard - Supabase Client
 * Author: Nayan Das <nayanchandradas@hotmail.com>
 * Repository: https://github.com/nayandas69/devflow-dashboard
 * License: MIT
 */

import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  // Create a supabase client on the browser with project's credentials
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
