import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import sql from '@/app/lib/db';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    return new Response('Missing webhook secret', { status: 500 });
  }

  // Obtener los headers nativos de la request
  const svix_id = req.headers.get('svix-id');
  const svix_timestamp = req.headers.get('svix-timestamp');
  const svix_signature = req.headers.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing Svix headers', { status: 400 });
  }

  // Extraer el body como texto crudo para no romper la firma de Svix
  const rawBody = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent; // <-- Type Safety agregado

  try {
    evt = wh.verify(rawBody, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response('Invalid signature', { status: 400 });
  }

  // Filtrar solo el evento de creación
  if (evt.type === 'user.created') {
    const data = evt.data;
    const clientId = data.id;
    const email = data.email_addresses?.[0]?.email_address;
    
    // ARREGLO CRÍTICO: Evitamos que envíe NULL a la DB
    const rawName = [data.first_name, data.last_name].filter(Boolean).join(' ').trim();
    const name = rawName || "Usuario"; // Fallback por si solo usa el email

    if (!clientId || !email) {
        return new Response('Missing user id or email in payload', { status: 400 });
    }
    console.log(`Procesando evento de creación de usuario: ${clientId} - ${email} - ${name}`);
    try {
    await sql`
        INSERT INTO users (client_id, name, email, role)
        VALUES (${clientId}, ${name}, ${email}, 'buyer')
        ON CONFLICT (client_id) DO NOTHING
        `;
    } catch (dbErr) {
      console.error('Database Error:', dbErr);
      return new Response('DB error', { status: 500 });
    }
  }

  return new Response('Webhook procesado exitosamente', { status: 200 });
}