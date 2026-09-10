/**
 * Subly Cloudflare Worker — Serverless API & Static Assets Router
 * Powered by Cloudflare D1 Serverless Database
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders()
      });
    }

    // 1. API Routes
    if (url.pathname.startsWith('/api/')) {
      try {
        const response = await handleApiRoute(request, env, url);
        return addCorsHeaders(response);
      } catch (err) {
        console.error('API Error:', err);
        return addCorsHeaders(new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }));
      }
    }

    // 2. Fall back to Cloudflare Static Assets (dist/)
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Asset router unavailable', { status: 404 });
  }
};

function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400'
  };
}

function addCorsHeaders(response) {
  const newHeaders = new Headers(response.headers);
  const cors = getCorsHeaders();
  for (const [k, v] of Object.entries(cors)) {
    newHeaders.set(k, v);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

async function handleApiRoute(request, env, url) {
  const db = env.DB;
  if (!db) {
    return new Response(JSON.stringify({ error: 'D1 database binding DB not found' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const path = url.pathname;
  const method = request.method;

  // --- /api/customers ---
  if (path === '/api/customers') {
    if (method === 'GET') {
      // Fetch all customers and join their subscriptions
      const { results: customers } = await db.prepare(
        `SELECT id, name, whatsapp, email, password, registered_at AS registeredAt FROM customers ORDER BY registered_at DESC`
      ).all();

      const { results: subs } = await db.prepare(
        `SELECT id, customer_whatsapp AS customerWhatsapp, service_id AS serviceId, service_name AS serviceName, 
                logo_url AS logoUrl, plan_price AS planPrice, period, start_date AS startDate, 
                expiry_date AS expiryDate, status FROM subscriptions ORDER BY expiry_date ASC`
      ).all();

      // Group subscriptions by customer
      const subsMap = new Map();
      subs.forEach(s => {
        const phone = s.customerWhatsapp;
        if (!subsMap.has(phone)) subsMap.set(phone, []);
        subsMap.get(phone).push(s);
      });

      const fullCustomers = customers.map(c => ({
        ...c,
        subscriptions: subsMap.get(c.whatsapp) || []
      }));

      return new Response(JSON.stringify({ success: true, customers: fullCustomers }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (method === 'POST') {
      const data = await request.json();
      const { id, name, whatsapp, email, password, registeredAt, subscriptions } = data;
      const cleanPhone = (whatsapp || '').replace(/[\s\-\(\)\+]/g, '');

      if (!name || !cleanPhone) {
        return new Response(JSON.stringify({ error: 'Name and WhatsApp phone number are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const custId = id || ('cust-' + Date.now());
      const regAt = registeredAt || new Date().toISOString();

      // Upsert customer
      await db.prepare(
        `INSERT INTO customers (id, name, whatsapp, email, password, registered_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(whatsapp) DO UPDATE SET
           name = excluded.name,
           email = COALESCE(excluded.email, customers.email),
           password = COALESCE(excluded.password, customers.password)`
      ).bind(custId, name, cleanPhone, email || '', password || '', regAt).run();

      // If initial subscriptions passed, insert/upsert them
      if (Array.isArray(subscriptions) && subscriptions.length > 0) {
        for (const sub of subscriptions) {
          const subId = sub.id || ('sub-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6));
          await db.prepare(
            `INSERT INTO subscriptions (id, customer_whatsapp, service_id, service_name, logo_url, plan_price, period, start_date, expiry_date, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
               plan_price = excluded.plan_price,
               period = excluded.period,
               expiry_date = excluded.expiry_date,
               status = excluded.status`
          ).bind(
            subId,
            cleanPhone,
            sub.serviceId || '',
            sub.serviceName || 'Subscription',
            sub.logoUrl || '/logos/spotify.svg',
            sub.planPrice || '₦800',
            sub.period || 'Individual',
            sub.startDate || new Date().toISOString(),
            sub.expiryDate || new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString(),
            sub.status || 'Active'
          ).run();
        }
      }

      return new Response(JSON.stringify({ success: true, customerId: custId, whatsapp: cleanPhone }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (method === 'DELETE') {
      const { searchParams } = url;
      const phone = searchParams.get('phone');
      if (!phone) {
        return new Response(JSON.stringify({ error: 'Phone parameter is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
      await db.prepare(`DELETE FROM subscriptions WHERE customer_whatsapp = ?`).bind(cleanPhone).run();
      await db.prepare(`DELETE FROM customers WHERE whatsapp = ?`).bind(cleanPhone).run();

      return new Response(JSON.stringify({ success: true, deleted: cleanPhone }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // --- /api/subscriptions ---
  if (path === '/api/subscriptions') {
    if (method === 'POST') {
      const data = await request.json();
      const { id, customerWhatsapp, serviceId, serviceName, logoUrl, planPrice, period, startDate, expiryDate, status } = data;
      const cleanPhone = (customerWhatsapp || '').replace(/[\s\-\(\)\+]/g, '');

      if (!cleanPhone || !serviceName || !expiryDate) {
        return new Response(JSON.stringify({ error: 'Customer phone, service name, and expiry date are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const subId = id || ('sub-' + Date.now());
      await db.prepare(
        `INSERT INTO subscriptions (id, customer_whatsapp, service_id, service_name, logo_url, plan_price, period, start_date, expiry_date, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           service_name = excluded.service_name,
           service_id = excluded.service_id,
           logo_url = excluded.logo_url,
           plan_price = excluded.plan_price,
           period = excluded.period,
           expiry_date = excluded.expiry_date,
           status = excluded.status`
      ).bind(
        subId,
        cleanPhone,
        serviceId || '',
        serviceName,
        logoUrl || '/logos/spotify.svg',
        planPrice || '₦800',
        period || 'Individual',
        startDate || new Date().toISOString(),
        expiryDate,
        status || 'Active'
      ).run();

      return new Response(JSON.stringify({ success: true, subscriptionId: subId }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (method === 'DELETE') {
      const subId = url.searchParams.get('id');
      if (!subId) {
        return new Response(JSON.stringify({ error: 'Subscription ID is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      await db.prepare(`DELETE FROM subscriptions WHERE id = ?`).bind(subId).run();
      return new Response(JSON.stringify({ success: true, deleted: subId }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // --- /api/orders ---
  if (path === '/api/orders') {
    if (method === 'GET') {
      const phone = url.searchParams.get('phone');
      const email = url.searchParams.get('email');

      if (phone || email) {
        const cleanPhone = (phone || '').replace(/[\s\-\(\)\+]/g, '');
        const normPhone = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
        const cleanEmail = (email || '').toLowerCase().trim();

        let query = `SELECT id, customer_name AS customerName, whatsapp, email, service_id AS serviceId, 
                            service_name AS serviceName, price, period, logo_url AS logoUrl, status, 
                            created_at AS createdAt, created_at AS date 
                     FROM orders 
                     WHERE (REPLACE(REPLACE(REPLACE(REPLACE(whatsapp, ' ', ''), '-', ''), '+', ''), '(', '') LIKE ?)`;
        const params = [`%${normPhone}%`];

        if (cleanEmail && cleanEmail !== 'n/a') {
          query += ` OR (email != '' AND LOWER(email) = ?)`;
          params.push(cleanEmail);
        }

        query += ` ORDER BY created_at DESC LIMIT 50`;

        const { results: orders } = await db.prepare(query).bind(...params).all();
        return new Response(JSON.stringify({ success: true, orders: orders || [] }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // If no filter (Admin view)
      const { results: orders } = await db.prepare(
        `SELECT id, customer_name AS customerName, whatsapp, email, service_id AS serviceId, 
                service_name AS serviceName, price, period, logo_url AS logoUrl, status, 
                created_at AS createdAt, created_at AS date 
         FROM orders ORDER BY created_at DESC LIMIT 100`
      ).all();

      return new Response(JSON.stringify({ success: true, orders: orders || [] }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (method === 'POST') {
      const data = await request.json();
      const { id, customerName, whatsapp, email, serviceId, serviceName, price, period, logoUrl, status, createdAt } = data;

      if (!id || !customerName || !whatsapp) {
        return new Response(JSON.stringify({ error: 'Order ID, Customer Name, and WhatsApp are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      await db.prepare(
        `INSERT INTO orders (id, customer_name, whatsapp, email, service_id, service_name, price, period, logo_url, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET status = excluded.status`
      ).bind(
        id,
        customerName,
        whatsapp,
        email || '',
        serviceId || '',
        serviceName || 'Plan',
        price || '₦0',
        period || 'Individual',
        logoUrl || '/logos/spotify.svg',
        status || 'Dispatched to WhatsApp',
        createdAt || new Date().toISOString()
      ).run();

      return new Response(JSON.stringify({ success: true, orderId: id }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (method === 'PATCH') {
      const data = await request.json();
      const { id, status } = data;
      if (!id || !status) {
        return new Response(JSON.stringify({ error: 'Order ID and status required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      await db.prepare(`UPDATE orders SET status = ? WHERE id = ?`).bind(status, id).run();
      return new Response(JSON.stringify({ success: true, updated: id, status }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // --- /api/feedback ---
  if (path === '/api/feedback') {
    if (method === 'GET') {
      const { results: feedbackList } = await db.prepare(
        `SELECT id, customer_name AS customerName, whatsapp, rating, category, message, status, created_at AS createdAt 
         FROM feedback ORDER BY created_at DESC LIMIT 100`
      ).all();

      return new Response(JSON.stringify({ success: true, feedback: feedbackList || [] }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (method === 'POST') {
      const data = await request.json();
      const { id, customerName, whatsapp, rating, category, message, status, createdAt } = data;

      if (!customerName || !message) {
        return new Response(JSON.stringify({ error: 'Customer Name and message are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const fbId = id || ('fb-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6));
      const cleanPhone = (whatsapp || '').replace(/[\s\-\(\)\+]/g, '');
      const parsedRating = Math.min(5, Math.max(1, parseInt(rating || '5', 10)));
      const created = createdAt || new Date().toISOString();

      await db.prepare(
        `INSERT INTO feedback (id, customer_name, whatsapp, rating, category, message, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        fbId,
        customerName.trim(),
        cleanPhone,
        parsedRating,
        (category || 'General Experience').trim(),
        message.trim(),
        status || 'New',
        created
      ).run();

      return new Response(JSON.stringify({ success: true, feedbackId: fbId }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (method === 'PATCH') {
      const data = await request.json();
      const { id, status } = data;
      if (!id || !status) {
        return new Response(JSON.stringify({ error: 'Feedback ID and status are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      await db.prepare(`UPDATE feedback SET status = ? WHERE id = ?`).bind(status, id).run();
      return new Response(JSON.stringify({ success: true, updated: id, status }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (method === 'DELETE') {
      const { searchParams } = url;
      const id = searchParams.get('id');
      if (!id) {
        return new Response(JSON.stringify({ error: 'Feedback ID required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      await db.prepare(`DELETE FROM feedback WHERE id = ?`).bind(id).run();
      return new Response(JSON.stringify({ success: true, deleted: id }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}
