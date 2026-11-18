import "server-only";
import { getDatabase } from "@netlify/database";

// On Netlify the connection is configured automatically.
// For local development outside `netlify dev`, set LOCAL_DATABASE_URL in .env.local.
export function db() {
  const local = process.env.LOCAL_DATABASE_URL;
  return local ? getDatabase({ connectionString: local }) : getDatabase();
}
