"use strict";

const KEY = "wedding:guests";
// Vercel's Upstash integration injects KV_REST_API_*; Upstash's own dashboard
// calls the same pair UPSTASH_REDIS_REST_*. Accept whichever is present.
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function redis(path, init) {
  const res = await fetch(`${REDIS_URL}/${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, ...(init && init.headers) },
  });
  if (!res.ok) throw new Error(`upstash ${res.status}: ${await res.text()}`);
  return res.json();
}

async function readGuests() {
  const { result } = await redis(`get/${KEY}`);
  if (!result) return null;
  const parsed = JSON.parse(result);
  return Array.isArray(parsed) ? parsed : null;
}

async function writeGuests(guests) {
  await redis(`set/${KEY}`, { method: "POST", body: JSON.stringify(guests) });
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (!REDIS_URL || !REDIS_TOKEN) {
    return res.status(503).json({ error: "Storage not configured. Add Upstash Redis in Vercel and redeploy." });
  }

  try {
    if (req.method === "GET") {
      const guests = await readGuests();
      // `seeded` false means the store has never been written, which is what lets a
      // fresh device seed it from guests.json without resurrecting deleted guests.
      return res.status(200).json({ guests: guests || [], seeded: guests !== null });
    }

    if (req.method === "PUT") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (!body || !Array.isArray(body.guests)) {
        return res.status(400).json({ error: "Expected { guests: [...] }" });
      }
      await writeGuests(body.guests);
      return res.status(200).json({ ok: true, count: body.guests.length });
    }

    res.setHeader("Allow", "GET, PUT");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
