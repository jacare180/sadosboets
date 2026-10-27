import { getStore } from "@netlify/blobs";

const BOETS = ["Ben", "Guigo", "Tho", "Beny"];
const KEY_RE = /^(ideas|stays|log|config)\/[A-Za-z0-9_\-.]{1,80}$/;
const COLL_RE = /^(ideas|stays|log)$/;
const store = () => getStore({ name: "trip", consistency: "strong" });

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

const rid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const SEED = {
  "stays/stay1": { order: 1, name: "Stay 1", url: "https://www.airbnb.com/rooms/1030877886371134693?adults=4&check_in=2027-03-15&check_out=2027-03-24", currency: "USD", priceTotal: null, amenities: {}, photos: [], booked: false, note: "Details not filled in yet. Tap Edit and paste from the listing." },
  "stays/stay2": { order: 2, name: "Stay 2 (wishlist link)", url: "https://www.airbnb.com/l/WuCTssTn", currency: "USD", priceTotal: null, amenities: {}, photos: [], booked: false, note: "This link opens the wishlist 'Cape Town, South Africa 2027' (4 saved), not a single listing. Replace it with the listing link in Edit." },
  "stays/stay3": { order: 3, name: "Stay 3", url: "https://www.airbnb.com/rooms/1302224065750272399?adults=4&check_in=2027-03-15&check_out=2027-03-24", currency: "USD", priceTotal: null, amenities: {}, photos: [], booked: false, note: "Details not filled in yet. Tap Edit and paste from the listing." },
  "stays/stay4": { order: 4, name: "Stay 4", url: "https://www.airbnb.com/rooms/29028839?adults=4&check_in=2027-03-15&check_out=2027-03-24", currency: "USD", priceTotal: null, amenities: {}, photos: [], booked: false, note: "Details not filled in yet. Tap Edit and paste from the listing." },
  "ideas/table-mountain": { title: "Jike up Table Mountain", type: "Jike", duration: "Half day", area: "Platteklip Gorge, Table Mountain", priceZAR: 300, note: "The hike up is free (about 2 to 3 h). The price is the optional one-way cable car down, online rate. Return ticket is R475 if we skip the jike.", source: "https://www.tablemountain.net/plan-your-visit/ticket-prices/", sourceLabel: "tablemountain.net, rates Jul 2026–Jun 2027", by: "Beny", createdAt: 1793116600000, plan: null, deleted: false },
  "ideas/cape-agulhas": { title: "Cape Agulhas, southernmost tip of Africa", type: "Road trip", duration: "Full day (about 3 h drive each way)", area: "Agulhas National Park", priceZAR: null, note: "Where the Atlantic and Indian oceans officially meet, with the restored lighthouse precinct that reopened in April 2026. Park fee still to confirm, plus car rental and fuel.", source: "https://atcnews.org/travelcomments-com-agulhas-lighthouse-precinct-opens-14-april-2026-a-new-must-visit-at-africas-southern-tip", sourceLabel: "ATC News, lighthouse precinct reopening", by: "Beny", createdAt: 1793116600001, plan: null, deleted: false },
  "ideas/cape-point": { title: "Cape Point & Cape of Good Hope", type: "Road trip", duration: "Full day (about 1h30 drive each way)", area: "Table Mountain National Park", priceZAR: 592, note: "The classic 'two oceans' viewpoint, closer than Agulhas. Price is the SANParks fee for foreign adults from 1 Nov 2026. Boulders penguins on the way is R282 more.", source: "https://www.riotimesonline.com/kruger-cape-point-park-fees-1-november-2026/", sourceLabel: "Rio Times, SANParks fees from 1 Nov 2026", by: "Beny", createdAt: 1793116600002, plan: null, deleted: false },
  "votes/cape-agulhas/Beny": { v: 1 },
};

async function state() {
  const s = store();
  let { blobs } = await s.list();
  let keys = blobs.map((b) => b.key).filter((k) => !k.startsWith("photos/"));
  if (!keys.includes("meta/seeded")) {
    await Promise.all(Object.entries(SEED).map(([k, v]) => s.setJSON(k, v)));
    await s.setJSON("meta/seeded", { at: Date.now() });
    keys = [...new Set([...keys, ...Object.keys(SEED)])];
  }
  // one-time: Bachelors is USD 200 per person (USD 1 = R16.60), unless someone already set a cost
  if (!keys.includes("meta/bach200")) {
    const cfg = (await s.get("config/trip", { type: "json" }).catch(() => null)) || {};
    if (cfg.bachelorsZAR == null) {
      await s.setJSON("config/trip", { ...cfg, bachelorsZAR: 3320, bachelorsNote: cfg.bachelorsNote || "USD 200 per person" });
      if (!keys.includes("config/trip")) keys.push("config/trip");
    }
    await s.setJSON("meta/bach200", { at: Date.now() });
  }
  // keep the log short
  const logKeys = keys.filter((k) => k.startsWith("log/")).sort().reverse();
  const old = logKeys.slice(60);
  if (old.length) await Promise.all(old.map((k) => s.delete(k)));
  const wanted = keys.filter((k) => !k.startsWith("meta/") && !old.includes(k));
  const vals = await Promise.all(wanted.map((k) => s.get(k, { type: "json" }).catch(() => null)));
  const out = { ideas: {}, stays: {}, log: [], config: {}, votes: {}, comments: {} };
  wanted.forEach((k, i) => {
    const v = vals[i];
    if (!v) return;
    const [c, a, b] = k.split("/");
    if (c === "ideas" || c === "stays") out[c][a] = { id: a, ...v };
    else if (c === "log") out.log.push({ id: a, ...v });
    else if (c === "config" && a === "trip") out.config = v;
    else if (c === "votes") (out.votes[a] ||= {})[b] = v.v;
    else if (c === "comments") (out.comments[a] ||= {})[b] = v;
  });
  const merge = (doc) => ({ ...doc, votes: out.votes[doc.id] || {}, comments: out.comments[doc.id] || {} });
  return json({
    ideas: Object.values(out.ideas).map(merge),
    stays: Object.values(out.stays).map(merge),
    log: out.log.sort((x, y) => (y.at || 0) - (x.at || 0)).slice(0, 40),
    config: out.config,
  });
}

async function splitWrites(s, id, data) {
  const { votes, comments, id: _ignore, ...rest } = data || {};
  if (votes && typeof votes === "object") {
    for (const [name, v] of Object.entries(votes)) {
      if (!BOETS.includes(name)) continue;
      const k = `votes/${id}/${name}`;
      if (v === 0 || v == null) await s.delete(k);
      else await s.setJSON(k, { v: v > 0 ? 1 : -1 });
    }
  }
  if (comments && typeof comments === "object") {
    for (const [cid, c] of Object.entries(comments)) {
      if (!/^[A-Za-z0-9]{1,40}$/.test(cid) || !c || !BOETS.includes(c.by)) continue;
      await s.setJSON(`comments/${id}/${cid}`, { by: c.by, text: String(c.text || "").slice(0, 2000), at: Date.now() });
    }
  }
  return rest;
}

async function write(req) {
  const body = await req.json().catch(() => null);
  if (!body || JSON.stringify(body).length > 200000) return json({ error: "bad request" }, 400);
  const { op, path, data } = body;
  const s = store();
  if (op === "add") {
    if (!COLL_RE.test(path)) return json({ error: "bad path" }, 400);
    const id = rid();
    const rest = await splitWrites(s, id, data);
    await s.setJSON(`${path}/${id}`, rest);
    return json({ id });
  }
  if (!KEY_RE.test(path || "")) return json({ error: "bad path" }, 400);
  const id = path.split("/")[1];
  const rest = await splitWrites(s, id, data);
  if (op === "set") {
    await s.setJSON(path, rest);
    return json({ ok: true });
  }
  if (op === "update") {
    if (!Object.keys(rest).length) return json({ ok: true });
    const cur = await s.get(path, { type: "json" });
    if (!cur) return json({ error: "not found" }, 404);
    await s.setJSON(path, { ...cur, ...rest });
    return json({ ok: true });
  }
  return json({ error: "bad op" }, 400);
}

async function uploadPhoto(req) {
  const type = req.headers.get("content-type") || "";
  if (!type.startsWith("image/")) return json({ error: "images only" }, 400);
  const buf = await req.arrayBuffer();
  if (buf.byteLength > 4.5 * 1024 * 1024) return json({ error: "too big" }, 413);
  const id = rid();
  await store().set(`photos/${id}`, buf, { metadata: { type } });
  return json({ id, url: `/api/photo/${id}` });
}

async function getPhoto(id) {
  if (!/^[A-Za-z0-9]{1,40}$/.test(id)) return new Response("Not found", { status: 404 });
  const r = await store().getWithMetadata(`photos/${id}`, { type: "arrayBuffer" });
  if (!r) return new Response("Not found", { status: 404 });
  return new Response(r.data, {
    headers: { "content-type": r.metadata?.type || "image/jpeg", "cache-control": "public, max-age=31536000, immutable" },
  });
}

export default async (req) => {
  const path = new URL(req.url).pathname.replace(/^\/api\/?/, "");
  try {
    if (req.method === "GET" && path === "state") return await state();
    if (req.method === "POST" && path === "write") return await write(req);
    if (req.method === "POST" && path === "photo") return await uploadPhoto(req);
    if (req.method === "GET" && path.startsWith("photo/")) return await getPhoto(path.slice(6));
    return json({ error: "not found" }, 404);
  } catch (e) {
    console.error(e);
    return json({ error: "server error" }, 500);
  }
};

export const config = { path: "/api/*" };
