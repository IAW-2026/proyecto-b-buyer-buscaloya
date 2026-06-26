// app/lib/db.ts
import { neon } from '@neondatabase/serverless';

// Usamos POSTGRES_URL que es la que Vercel inyecta por defecto
const sql = neon(process.env.POSTGRES_URL!);

export default sql;