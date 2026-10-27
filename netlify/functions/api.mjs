import { getStore } from "@netlify/blobs";

const BOETS = ["Ben", "Guigo", "Tho", "Beny"];
const STEEN = "Steen";

// Who is calling: the invite code (x-trip-key header) maps to a role. Codes live in Netlify env vars, never in the repo.
const KEYS = [["boets", "KEY_BOETS"], ["steen", "KEY_STEEN"], ["locals", "KEY_LOCALS"]];
console.log(`invite codes configured: ${KEYS.filter(([, env]) => process.env[env]).map(([role]) => role).join(", ") || "none"}`);
function roleOf(req) {
  const k = req.headers.get("x-trip-key") || "";
  if (!k) return "public";
  for (const [role, env] of KEYS) if (process.env[env] && k === process.env[env]) return role;
  return "public";
}
// a name each role may sign with: boets their own four, Steen herself, locals any other short name
function nameOk(role, n) {
  if (typeof n !== "string") return false;
  if (role === "boets") return BOETS.includes(n);
  if (role === "steen") return n === STEEN;
  if (role === "locals") return n.trim() === n && n.length >= 1 && n.length <= 30 && !BOETS.includes(n) && n !== STEEN;
  return false;
}
const KEY_RE = /^(ideas|eats|stays|log|config)\/[A-Za-z0-9_\-.]{1,80}$/;
const COLL_RE = /^(ideas|eats|stays|log)$/;
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

const STAY_FILL = {
  "stays/stay1": {
    name: "Sea Point, new build with braai terrace", area: "Sea Point", rating: "4.74 (31)",
    priceTotal: 11881, currency: "BRL", guests: 4, bedrooms: 2, beds: 2, baths: 2,
    amenities: { Kitchen: true, Wifi: true, "Free parking": true, Washer: true, Workspace: true, "Braai (BBQ)": true, "Mountain view": true },
    photos: [{ url: "/stays/s1-1.jpg" }, { url: "/stays/s1-2.jpg" }, { url: "/stays/s1-3.jpg" }],
    note: "1 king + 1 queen. Private balcony with braai and a partial Lion's Head view, 5 min walk to the Promenade. 1 garage spot. A few reviews mention road noise. Free cancellation before 10 Mar. Price seen 27 Oct (down from R$13,163).",
  },
  "stays/stay3": {
    name: "Bantry Bay, sea view balcony", area: "Bantry Bay", rating: "4.85 (46)",
    priceTotal: 1907, currency: "USD", guests: 4, bedrooms: 2, beds: 3, baths: 2,
    amenities: { Kitchen: true, Wifi: true, "Free parking": true, Workspace: true, "Sea view": true },
    photos: [{ url: "/stays/s3-1.jpg" }, { url: "/stays/s3-2.jpg" }, { url: "/stays/s3-3.jpg" }],
    note: "1 king + 2 singles. Guest favourite, Superhost. Private balcony facing the sea, dishwasher, Nespresso. 5 min walk to Saunders' Rocks and Queens beach. Free cancellation before 1 Mar. Price seen 27 Oct.",
  },
  "stays/stay4": {
    name: "Three Anchor Bay, private garden", area: "Three Anchor Bay", rating: "4.9 (314)",
    guests: 4, bedrooms: 2, beds: 3, baths: 1,
    amenities: { Kitchen: true, Wifi: true, "Free parking": true },
    photos: [{ url: "/stays/s4-1.jpg" }, { url: "/stays/s4-2.jpg" }, { url: "/stays/s4-3.jpg" }],
    note: "NOT AVAILABLE for 15 to 24 Mar (Airbnb shows the dates blocked, 27 Oct). 1 queen + 2 singles, only 1 bathroom. Guest favourite, top 10%. Private garden with outdoor dining, garage spot, 5 min walk to the beach.",
  },
};

async function state(role) {
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
  // one-time: listing details from the Airbnb pages (27 Oct 2026); only fills fields still empty
  if (!keys.includes("meta/stays-oct27")) {
    const empty = (v) => v == null || v === "" || (typeof v === "object" && !Object.keys(v).length);
    await Promise.all(Object.entries(STAY_FILL).map(async ([k, fill]) => {
      const cur = await s.get(k, { type: "json" }).catch(() => null);
      if (!cur) return;
      const next = { ...cur };
      // a field still holding its seed placeholder counts as empty; currency only moves with the price it belongs to
      const open = (f) => empty(cur[f]) || cur[f] === SEED[k]?.[f];
      for (const [f, v] of Object.entries(fill)) if (f !== "currency" && open(f)) next[f] = v;
      if (fill.currency && open("priceTotal")) next.currency = fill.currency;
      await s.setJSON(k, next);
    }));
    await s.setJSON("meta/stays-oct27", { at: Date.now() });
  }
  // one-time: restaurant ideas move to the Eat tab (same id, so their comments come along)
  if (!keys.includes("meta/eats-move")) {
    const ideaKeys = keys.filter((k) => k.startsWith("ideas/"));
    const ideas = await Promise.all(ideaKeys.map((k) => s.get(k, { type: "json" }).catch(() => null)));
    for (const [ix, k] of ideaKeys.entries()) {
      const i = ideas[ix];
      if (!i || i.deleted || i.type !== "Food") continue;
      const id = k.split("/")[1];
      await s.setJSON(`eats/${id}`, { name: i.title || "", area: i.area || "", cuisine: "", price: null, link: /^https?:/.test(i.source || "") ? i.source : "",
        order: "", booking: false, note: i.note || "", by: i.by || "", createdAt: i.createdAt || Date.now(), plan: i.plan || null, deleted: false });
      await s.setJSON(k, { ...i, deleted: true, movedTo: "eats" });
      keys.push(`eats/${id}`);
    }
    await s.setJSON("meta/eats-move", { at: Date.now() });
  }
  // keep the log short
  const logKeys = keys.filter((k) => k.startsWith("log/")).sort().reverse();
  const old = logKeys.slice(60);
  if (old.length) await Promise.all(old.map((k) => s.delete(k)));
  const wanted = keys.filter((k) => !k.startsWith("meta/") && !old.includes(k));
  const vals = await Promise.all(wanted.map((k) => s.get(k, { type: "json" }).catch(() => null)));
  const out = { ideas: {}, eats: {}, stays: {}, log: [], config: {}, votes: {}, comments: {}, steen: {}, local: {}, going: {}, want: {} };
  wanted.forEach((k, i) => {
    const v = vals[i];
    if (!v) return;
    const [c, a, b] = k.split("/");
    if (c === "ideas" || c === "stays" || c === "eats") out[c][a] = { id: a, ...v };
    else if (c === "log") out.log.push({ id: a, ...v });
    else if (c === "config" && a === "trip") out.config = v;
    else if (c === "votes") (out.votes[a] ||= {})[b] = v.v;
    else if (c === "comments") (out.comments[a] ||= {})[b] = v;
    else if (c === "steen") out.steen[a] = v.v;
    else if (c === "local") (out.local[a] ||= {})[decodeURIComponent(b)] = v.v;
    else if (c === "going") (out.going[a] ||= []).push(decodeURIComponent(b));
    else if (c === "want") (out.want[a] ||= []).push(decodeURIComponent(b));
  });
  // Steen's verdict, the locals' verdicts and who else is coming are kept apart from the boets' votes
  const merge = (doc) => ({ ...doc, votes: out.votes[doc.id] || {}, comments: out.comments[doc.id] || {},
    steen: out.steen[doc.id] || 0, local: out.local[doc.id] || {}, going: (out.going[doc.id] || []).sort() });
  const full = {
    ideas: Object.values(out.ideas).map(merge),
    stays: Object.values(out.stays).map(merge),
    eats: Object.values(out.eats).map((e) => ({ ...e, comments: out.comments[e.id] || {}, want: (out.want[e.id] || []).sort() })),
    log: out.log.sort((x, y) => (y.at || 0) - (x.at || 0)).slice(0, 40),
    config: out.config,
  };
  return json({ role, ...forRole(full, role) });
}

// what each role gets to see; anything not listed here never leaves the server
function forRole(full, role) {
  if (role === "boets") return full;
  const live = full.ideas.filter((i) => !i.deleted);
  const eats = full.eats.filter((e) => !e.deleted);
  const config = { halfDay: full.config.halfDay || null };
  if (role === "public") {
    const decided = live.filter((i) => i.plan && i.plan.day)
      .map(({ id, title, type, duration, area, note, priceZAR, plan }) => ({ id, title, type, duration, area, note, priceZAR, plan }));
    // the restaurant list is for invited people; the public only sees a meal once it is in the plan
    const meals = eats.filter((e) => e.plan && e.plan.day).map(({ id, name, area, plan }) => ({ id, name, area, plan }));
    return { ideas: decided, eats: meals, stays: [], log: [], config };
  }
  // Steen and locals: the booked stay shows only its name, area and photos (no address, link or price)
  const stays = full.stays.filter((s) => s.booked).map(({ id, name, area, photos }) => ({ id, name, area, photos, booked: true }));
  return { ideas: live, eats, stays, log: [], config };
}

async function setWant(s, id, want, role) {
  if (!want || !nameOk(role, want.by)) return false;
  const k = `want/${id}/${encodeURIComponent(want.by)}`;
  if (want.in) await s.setJSON(k, { at: Date.now() }); else await s.delete(k);
  return true;
}

async function splitWrites(s, id, data, role) {
  const { votes, comments, want, id: _ignore, ...rest } = data || {};
  if (want !== undefined) await setWant(s, id, want, role);
  if (role === "boets" && votes && typeof votes === "object") {
    for (const [name, v] of Object.entries(votes)) {
      if (!BOETS.includes(name)) continue;
      const k = `votes/${id}/${name}`;
      if (v === 0 || v == null) await s.delete(k);
      else await s.setJSON(k, { v: v > 0 ? 1 : -1 });
    }
  }
  if (comments && typeof comments === "object") {
    for (const [cid, c] of Object.entries(comments)) {
      if (!/^[A-Za-z0-9]{1,40}$/.test(cid) || !c || !nameOk(role, c.by)) continue;
      await s.setJSON(`comments/${id}/${cid}`, { by: c.by, text: String(c.text || "").slice(0, 2000), at: Date.now() });
    }
  }
  return rest;
}

const IDEA_FIELDS = ["title", "type", "duration", "area", "source", "note", "priceZAR"];
const EAT_FIELDS = ["name", "area", "cuisine", "link", "order", "note"];
// which idea fields each guest role may change
const GUEST_FIELDS = { comments: ["steen", "locals"], steen: ["steen"], plan: ["steen"], local: ["locals"], going: ["steen", "locals"] };
const LOCAL_VERDICTS = ["must", "skip", "trap"];
const PLAN_DAY = /^2027-03-(1[05-9]|2[0-4]|11)$/;
const PLAN_SLOTS = ["morning", "afternoon", "evening"];

async function write(req, role) {
  if (role === "public") return json({ error: "read only" }, 403);
  const body = await req.json().catch(() => null);
  if (!body || JSON.stringify(body).length > 200000) return json({ error: "bad request" }, 400);
  const { op, path, data } = body;
  if (role !== "boets") return guestWrite(op, path, data, role);
  const s = store();
  if (op === "add") {
    if (!COLL_RE.test(path)) return json({ error: "bad path" }, 400);
    const id = rid();
    const rest = await splitWrites(s, id, data, role);
    await s.setJSON(`${path}/${id}`, rest);
    return json({ id });
  }
  if (!KEY_RE.test(path || "")) return json({ error: "bad path" }, 400);
  const id = path.split("/")[1];
  const rest = await splitWrites(s, id, data, role);
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

// Steen and locals: Juggest a new idea (signed with their own name) and comment; nothing else
async function guestWrite(op, path, data, role) {
  const s = store();
  // Eat: anyone invited adds a spot and says Want to go; comments too
  if (op === "add" && path === "eats") {
    if (!data || !nameOk(role, data.by) || typeof data.name !== "string" || !data.name.trim()) return json({ error: "bad spot" }, 400);
    const eat = { by: data.by, createdAt: Date.now(), plan: null, deleted: false, booking: !!data.booking,
      price: [1, 2, 3, 4].includes(data.price) ? data.price : null };
    for (const f of EAT_FIELDS) eat[f] = String(data[f] ?? "").slice(0, 400);
    const id = rid();
    await s.setJSON(`eats/${id}`, eat);
    if (data.want) await setWant(s, id, { by: data.by, in: true }, role);
    return json({ id });
  }
  if (op === "update" && /^eats\/[A-Za-z0-9_\-.]{1,80}$/.test(path || "")) {
    const fields = Object.keys(data || {});
    if (!fields.length || fields.some((f) => f !== "comments" && f !== "want")) return json({ error: "not allowed" }, 403);
    const cur = await s.get(path, { type: "json" });
    if (!cur || cur.deleted) return json({ error: "not found" }, 404);
    const id = path.split("/")[1];
    if (data.want !== undefined && !(await setWant(s, id, data.want, role))) return json({ error: "bad name" }, 400);
    if (data.comments) await splitWrites(s, id, { comments: data.comments }, role);
    return json({ ok: true });
  }
  if (op === "add" && path === "ideas") {
    if (!data || !nameOk(role, data.by) || typeof data.title !== "string" || !data.title.trim()) return json({ error: "bad idea" }, 400);
    const idea = { by: data.by, createdAt: Date.now(), plan: null, deleted: false };
    for (const f of IDEA_FIELDS) if (data[f] !== undefined) idea[f] = f === "priceZAR" ? (data[f] == null ? null : +data[f]) : String(data[f]).slice(0, 400);
    // Steen may Juggest straight into a free slot of the plan
    const p = data.plan;
    if (role === "steen" && p && PLAN_DAY.test(p.day) && PLAN_SLOTS.includes(p.slot)) { idea.plan = { day: p.day, slot: p.slot }; idea.plannedBy = STEEN; }
    const id = rid();
    await s.setJSON(`ideas/${id}`, idea);
    if (idea.plan) await s.setJSON(`log/${rid()}`, { kind: "plan", ideaId: id, title: idea.title, prev: null, next: idea.plan, who: STEEN, at: Date.now() });
    return json({ id });
  }
  if (op === "update" && /^ideas\/[A-Za-z0-9_\-.]{1,80}$/.test(path || "")) {
    const fields = Object.keys(data || {});
    if (!fields.length || fields.some((f) => !(GUEST_FIELDS[f] || []).includes(role))) return json({ error: "not allowed" }, 403);
    const id = path.split("/")[1];
    const cur = await s.get(path, { type: "json" });
    if (!cur || cur.deleted) return json({ error: "not found" }, 404);
    const { comments, steen, plan, local, going } = data;
    if (comments) await splitWrites(s, id, { comments }, role);
    if (steen !== undefined) {
      if (![1, -1, 0].includes(steen)) return json({ error: "bad verdict" }, 400);
      if (steen) await s.setJSON(`steen/${id}`, { v: steen }); else await s.delete(`steen/${id}`);
    }
    if (local !== undefined) {
      if (!local || !nameOk(role, local.by) || !(local.v === null || LOCAL_VERDICTS.includes(local.v))) return json({ error: "bad verdict" }, 400);
      const k = `local/${id}/${encodeURIComponent(local.by)}`;
      if (local.v) await s.setJSON(k, { v: local.v }); else await s.delete(k);
    }
    if (going !== undefined) {
      if (!going || !nameOk(role, going.by)) return json({ error: "bad name" }, 400);
      const k = `going/${id}/${encodeURIComponent(going.by)}`;
      if (going.in) await s.setJSON(k, { at: Date.now() }); else await s.delete(k);
    }
    if (plan !== undefined) {
      // Steen can put an open idea on a free day and take off only what she put there
      if (plan === null) {
        if (cur.plannedBy !== STEEN || !cur.plan) return json({ error: "not yours" }, 403);
      } else {
        if (cur.plan && cur.plan.day) return json({ error: "already planned" }, 409);
        if (!plan || !PLAN_DAY.test(plan.day) || !PLAN_SLOTS.includes(plan.slot)) return json({ error: "bad slot" }, 400);
      }
      const next = plan ? { day: plan.day, slot: plan.slot } : null;
      await s.setJSON(path, { ...cur, plan: next, plannedBy: next ? STEEN : null });
      await s.setJSON(`log/${rid()}`, { kind: "plan", ideaId: id, title: cur.title, prev: cur.plan || null, next, who: STEEN, at: Date.now() });
    }
    return json({ ok: true });
  }
  return json({ error: "not allowed" }, 403);
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
  const role = roleOf(req);
  try {
    if (req.method === "GET" && path === "state") return await state(role);
    if (req.method === "POST" && path === "write") return await write(req, role);
    if (req.method === "POST" && path === "photo") return role === "boets" ? await uploadPhoto(req) : json({ error: "not allowed" }, 403);
    if (req.method === "GET" && path.startsWith("photo/")) return await getPhoto(path.slice(6));
    return json({ error: "not found" }, 404);
  } catch (e) {
    console.error(e);
    return json({ error: "server error" }, 500);
  }
};

export const config = { path: "/api/*" };
