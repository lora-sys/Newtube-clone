import { drizzle } from "drizzle-orm/neon-http";

import { neon } from "@neondatabase/serverless";

// Force IPv4 to avoid IPv6 timeout in WSL2
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });
