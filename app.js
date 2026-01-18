/***********************
 * app.js — Skyliner Motel (DROP-IN)
 * Fix: Reviews now render into #reviewsTrack + #reviewsDots and rotate.
 * Keeps ALL other functionality you had:
 *   SiteConfig, Alerts, Gallery, Route66, Town, History, Menu.
 ***********************/

(() => {
  /********** SHEET CONFIG **********/
  const SHEET_ID = "12xCdrziWioRE3SxEeRyZgIvsFxz_gXIfvp5_7yUXXf8";
  const TAB = {
    SITE: "SiteConfig",
    STOPS: "Stops",
    ALERTS: "Alerts",
    GALLERY: "Gallery",
    REVIEWS: "Reviews",
    TOWN: "Town",
    HISTORY: "History"
  };

  function gvizCsvUrl(sheetName){
    const base = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq`;
    const params = new URLSearchParams({
      tqx: "out:csv",
      sheet: sheetName,
      cb: String(Date.now())
    });
    return `${base}?${params.toString()}`;
  }

  const SHEETS = {
    SITE_CONFIG_CSV: gvizCsvUrl(TAB.SITE),
    STOPS_CSV: gvizCsvUrl(TAB.STOPS),
    ALERTS_CSV: gvizCsvUrl(TAB.ALERTS),
    GALLERY_CSV: gvizCsvUrl(TAB.GALLERY),
    REVIEWS_CSV: gvizCsvUrl(TAB.REVIEWS),
    TOWN_CSV: gvizCsvUrl(TAB.TOWN),
    HISTORY_CSV: gvizCsvUrl(TAB.HISTORY)
  };

  const DEFAULTS = {
    motel_name: "Skyliner Motel",
    tagline: "Clean, comfortable stays on Route 66",
    phone: "(555) 123-4567",
    address_line: "123 Historic Route 66",
    city_state_zip: "Your City, ST 00000",
    booking_url: "#",
    booking_image_url: "",
    sticky_booking_text: "BOOK NOW",
    google_maps_embed_url: "",
    bio_title: "About Skyliner Motel",
    bio_body: ""
  };

  /********** ROUTE 66 THEMING **********/
  const ROUTE66 = [
    { key: "illinois",  name: "Illinois",   overlay: "day",    accent: "#ffd54a", headline: "Chicago to the open road", subtext: "Your journey begins on the Mother Road." },
    { key: "missouri",  name: "Missouri",   overlay: "day",    accent: "#7dd3fc", headline: "Bridges, diners, and neon", subtext: "Classic Americana at every turn." },
    { key: "kansas",    name: "Kansas",     overlay: "day",    accent: "#86efac", headline: "A quick, iconic stretch",  subtext: "Small state, big Route 66 energy." },
    { key: "oklahoma",  name: "Oklahoma",   overlay: "sunset", accent: "#fbbf24", headline: "Big skies, long horizons",  subtext: "Cruise into golden hour." },
    { key: "texas",     name: "Texas",      overlay: "sunset", accent: "#fb7185", headline: "Wide roads, bright signs",  subtext: "Everything feels larger here." },
    { key: "newmexico", name: "New Mexico", overlay: "sunset", accent: "#f97316", headline: "Desert dusk",               subtext: "Warm tones, quiet miles." },
    { key: "arizona",   name: "Arizona",    overlay: "night",  accent: "#a78bfa", headline: "Stars and roadside glow",   subtext: "Neon nights and desert air." },
    { key: "california",name: "California", overlay: "night",  accent: "#fca5a5", headline: "You’ve arrived",            subtext: "Finish strong — book fast, rest easy." }
  ];

  const STATE_ALIASES = {
    "il":"illinois","illinois":"illinois",
    "mo":"missouri","missouri":"missouri",
    "ks":"kansas","kansas":"kansas",
    "ok":"oklahoma","oklahoma":"oklahoma",
    "tx":"texas","texas":"texas",
    "nm":"newmexico","new mexico":"newmexico","newmexico":"newmexico",
    "az":"arizona","arizona":"arizona",
    "ca":"california","california":"california"
  };

  /********** UTIL **********/
  const $ = (id) => document.getElementById(id);

  function setText(id, value){
    const el = $(id);
    if (el) el.textContent = value ?? "";
  }
  function setAttr(id, attr, value){
    const el = $(id);
    if (el) el.setAttribute(attr, value ?? "");
  }
  function safeUrl(url){
    if (!url) return "";
    try { return new URL(url, window.location.href).href; }
    catch { return ""; }
  }

  function parseCSV(csvText){
    const rows = [];
    let row = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < csvText.length; i++){
      const c = csvText[i];
      const n = csvText[i+1];

      if (c === '"'){
        if (inQuotes && n === '"'){ cur += '"'; i++; }
        else { inQuotes = !inQuotes; }
        continue;
      }

      if (!inQuotes && c === ","){ row.push(cur); cur = ""; continue; }

      if (!inQuotes && (c === "\n" || c === "\r")){
        if (c === "\r" && n === "\n") i++;
        row.push(cur);
        rows.push(row);
        row = []; cur = "";
        continue;
      }

      cur += c;
    }
    row.push(cur);
    rows.push(row);
    return rows;
  }

  function rowsToObjects(rows){
    if (!rows || rows.length < 2) return [];
    const headers = rows[0].map(h => (h || "").trim());
    const out = [];
    for (let i = 1; i < rows.length; i++){
      const r = rows[i];
      if (!r || r.every(x => (x || "").trim() === "")) continue;
      const obj = {};
      headers.forEach((h, idx) => { if (h) obj[h] = (r[idx] ?? "").trim(); });
      out.push(obj);
    }
    return out;
  }

  async function fetchCSV(url){
    if (!url) return null;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch CSV (${res.status})`);
    return await res.text();
  }

  async function loadSheetObjects(csvUrl){
    const text = await fetchCSV(csvUrl);
    if (!text) return [];
    return rowsToObjects(parseCSV(text));
  }

  function el(tag, className, attrs={}){
    const e = document.createElement(tag);
    if (className) e.className = className;
    for (const [k,v] of Object.entries(attrs)) e.setAttribute(k, v);
    return e;
  }

  /********** MENU **********/
  function initMenu(){
    const btn = $("menuBtn") || document.querySelector("[data-menu-btn]");
    const panel = $("menuPanel") || document.querySelector("[data-menu-panel]");
    const overlay = $("menuOverlay") || $("menuBackdrop") || document.querySelector("[data-menu-backdrop]") || document.querySelector("[data-menu-overlay]");
    const closeBtn = $("menuClose");

    if (!btn || !panel) return;

    const open = () => {
      panel.hidden = false;
      if (overlay) overlay.hidden = false;
      panel.classList.add("is-open");
      if (overlay) overlay.classList.add("is-open");
      btn.setAttribute("aria-expanded","true");
      document.body.classList.add("menu-open");
    };

    const close = () => {
      panel.classList.remove("is-open");
      if (overlay) overlay.classList.remove("is-open");
      btn.setAttribute("aria-expanded","false");
      document.body.classList.remove("menu-open");
      window.setTimeout(()=>{
        panel.hidden = true;
        if (overlay) overlay.hidden = true;
      }, 10);
    };

    const toggle = () => {
      const isOpen = !panel.hidden && panel.classList.contains("is-open");
      isOpen ? close() : open();
    };

    btn.addEventListener("click", (e)=>{ e.preventDefault(); e.stopPropagation(); toggle(); });
    if (overlay) overlay.addEventListener("click", close);
    if (closeBtn) closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", (e)=>{ if (e.key === "Escape") close(); });

    panel.addEventListener("click", (e)=>{
      const a = e.target && e.target.closest ? e.target.closest("a") : null;
      if (a) close();
    });
  }

  /********** SITE CONFIG **********/
  function applySiteConfig(site){
    const cfg = Object.assign({}, DEFAULTS, (site || {}));

    setText("motelName", cfg.motel_name);
    setText("tagline", cfg.tagline);
    setText("heroTitle", cfg.motel_name);
    setText("footerBrand", cfg.motel_name);

    const phoneDigits = (cfg.phone || "").replace(/[^0-9+]/g, "");
    const telHref = phoneDigits ? `tel:${phoneDigits}` : "tel:";
    setAttr("phoneLink","href",telHref);
    setAttr("phoneText","href",telHref);
    setText("phoneText", cfg.phone);

    const address = `${cfg.address_line} ${cfg.city_state_zip}`.trim();
    const mapsUrl = cfg.google_maps_embed_url
      ? safeUrl(cfg.google_maps_embed_url)
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

    setAttr("mapsLink","href",mapsUrl);
    setAttr("addressText","href",mapsUrl);
    setText("addressText", cfg.address_line);

    const bookingUrl = safeUrl(cfg.booking_url) || "#";
    ["bookNowTop","bookNowHero","stickyBook","bookingCard","bookNowMenu"]
      .forEach(id => setAttr(id,"href",bookingUrl));

    // Keep your secondary header links in sync too (menu panel)
    setAttr("phoneLink2","href",telHref);
    setAttr("mapsLink2","href",mapsUrl);

    setText("stickyBookLabel", cfg.sticky_booking_text || "BOOK NOW");
    setText("footerAddress", `${cfg.address_line} • ${cfg.city_state_zip}`);

    const imgUrl = safeUrl(cfg.booking_image_url);
    const img = $("bookingImage");
    if (imgUrl && img) img.src = imgUrl;

    const bioSection = $("bioSection");
    const bioBody = (cfg.bio_body || "").trim();
    if (bioSection && bioBody){
      setText("bioTitle", (cfg.bio_title || "About Skyliner Motel"));
      setText("bioBody", bioBody);
      bioSection.hidden = false;
    } else if (bioSection){
      bioSection.hidden = true;
    }

    if (!cfg.booking_url || cfg.booking_url === "#"){
      const sticky = $("stickyBook");
      if (sticky) sticky.style.display = "none";
    }

    return cfg;
  }

  /********** ALERTS **********/
  function applyAlerts(alerts){
    const bar = $("alertBar");
    const text = $("alertText");
    if (!bar || !text) return;

    const active = (alerts || []).find(a =>
      String(a.active || "").toLowerCase() === "true" && (a.message || "").trim()
    );

    if (!active){ bar.hidden = true; return; }
    text.textContent = active.message;
    bar.hidden = false;
  }

  /********** MINI GALLERY (no change) **********/
  function renderMiniGallery(galleryRows){
    const section = $("miniGallerySection");
    const mount = $("miniGalleryMount");
    if (!section || !mount) return;

    const items = (galleryRows || [])
      .filter(r => (r.image_url || "").trim())
      .sort((a,b)=> (Number(a.order)||0) - (Number(b.order)||0));

    if (!items.length){ section.hidden = true; return; }

    mount.innerHTML = "";
    for (const it of items){
      const item = el("div","miniGallery__item");
      const thumb = el("div","miniGallery__thumb");

      const img = document.createElement("img");
      img.loading = "lazy";
      img.decoding = "async";
      img.src = it.image_url;
      img.alt = (it.alt || it.caption || "Photo").trim();

      thumb.appendChild(img);
      item.appendChild(thumb);

      const capText = (it.caption || "").trim();
      if (capText){
        const cap = el("div","miniGallery__caption");
        cap.textContent = capText;
        item.appendChild(cap);
      }

      mount.appendChild(item);
    }

    section.hidden = false;
  }

  /********** REVIEWS (FIXED) **********/
  function renderReviews(reviewsRows){
    const track = $("reviewsTrack");
    const dotsMount = $("reviewsDots");
    if (!track) return; // only on index

    const items = (reviewsRows || [])
      .filter(r => String(r.active || "true").toLowerCase() !== "false" && (r.quote || "").trim())
      .sort((a,b)=> (Number(a.order)||0) - (Number(b.order)||0));

    track.innerHTML = "";
    if (dotsMount) dotsMount.innerHTML = "";
    if (!items.length) return;

    const bubbles = items.map((r) => {
      const bubble = el("article","reviewBubble");

      const quote = el("p","reviewBubble__body");
      quote.textContent = (r.quote || "").trim();

      const meta = el("div","reviewBubble__meta");
      const left = document.createElement("span");
      const right = document.createElement("span");

      const name = (r.name || "").trim();
      const source = (r.source || "").trim();
      left.textContent = [name, source].filter(Boolean).join(" • ");

      const date = (r.date || "").trim();
      right.textContent = date;

      meta.appendChild(left);
      meta.appendChild(right);

      bubble.appendChild(quote);
      bubble.appendChild(meta);

      return bubble;
    });

    bubbles.forEach(b => track.appendChild(b));

    // Dots
    let dots = [];
    if (dotsMount){
      dots = items.map((_, i) => {
        const d = el("div","dot" + (i === 0 ? " is-on" : ""), { "data-i": String(i) });
        d.addEventListener("click", () => goTo(i, true));
        dotsMount.appendChild(d);
        return d;
      });
    }

    let index = 0;

    function apply(){
      const offsetPct = -100 * index;
      for (const b of bubbles){
        b.style.transform = `translateX(${offsetPct}%)`;
      }
      if (dots.length){
        dots.forEach((d, i) => d.classList.toggle("is-on", i === index));
      }
    }

    function goTo(i, userAction=false){
      index = (i + items.length) % items.length;
      apply();
      if (userAction) restart();
    }

    let timer = null;
    function start(){
      if (items.length <= 1) return;
      timer = window.setInterval(()=> goTo(index + 1), 4500);
    }
    function stop(){
      if (timer) { window.clearInterval(timer); timer = null; }
    }
    function restart(){ stop(); start(); }

    track.addEventListener("touchstart", stop, { passive:true });
    track.addEventListener("touchend", restart, { passive:true });
    track.addEventListener("mouseenter", stop);
    track.addEventListener("mouseleave", restart);

    apply();
    start();
  }

  /********** ROUTE 66 JOURNEY (unchanged) **********/
  function normalizeStateKey(input){
    const raw = (input || "").trim().toLowerCase();
    return STATE_ALIASES[raw] || raw || "";
  }
  function normalizeSide(side){
    const s = (side || "").toLowerCase();
    if (s === "left" || s === "right" || s === "center") return s;
    return "";
  }
  function stopCta(stop){
    if (!stop.cta_text || !stop.cta_url) return null;
    const isHash = stop.cta_url.startsWith("#");
    const a = el("a","btn btn--route",{ href: stop.cta_url, target: isHash ? "_self" : "_blank", rel: "noopener" });
    a.innerHTML = `<span><span class="routeBadge">66</span> ${stop.cta_text}</span>`;
    return a;
  }

  function renderStateBand(routeState, stateStops){
    const band = el("section","state",{
      "data-theme": routeState.key,
      "data-overlay": routeState.overlay
    });

    const overlay = el("div","state__overlay");
    const inner = el("div","state__inner");

    const header = el("div","state__header");
    const kicker = el("div","state__kicker");
    const dot = el("span","state__dot",{"aria-hidden":"true"});
    kicker.appendChild(dot);

    const name = document.createElement("span");
    name.textContent = routeState.name.toUpperCase();
    kicker.appendChild(name);

    const h = el("div","state__headline");
    h.textContent = routeState.headline;

    const p = el("p","state__subtext");
    p.textContent = routeState.subtext;

    header.appendChild(kicker);
    header.appendChild(h);
    header.appendChild(p);
    inner.appendChild(header);

    let flip = true;
    for (const stop of (stateStops || [])){
      const forcedSide = normalizeSide(stop.side);
      const side = forcedSide || (flip ? "left" : "right");
      if (!forcedSide) flip = !flip;

      const s = el("article","stop",{"data-side":side,"data-stop-type":(stop.stop_type||"text")});
      const pin = el("div","stop__pin",{"aria-hidden":"true"});
      const card = el("div","stop__card");

      if ((stop.title || "").trim()){
        const t = el("h3","stop__title");
        t.textContent = stop.title;
        card.appendChild(t);
      }

      if ((stop.body || "").trim()){
        const b = el("p","stop__body");
        b.textContent = stop.body;
        card.appendChild(b);
      }

      if ((stop.image_url || "").trim()){
        const media = el("div","stop__media");
        const img = document.createElement("img");
        img.loading = "lazy";
        img.decoding = "async";
        img.alt = stop.image_caption || stop.title || "Photo";
        img.src = stop.image_url;
        media.appendChild(img);

        if ((stop.image_caption || "").trim()){
          const cap = el("div","stop__caption");
          cap.textContent = stop.image_caption;
          media.appendChild(cap);
        }
        card.appendChild(media);
      }

      const cta = stopCta(stop);
      if (cta){
        const wrap = el("div","stop__cta");
        wrap.appendChild(cta);
        card.appendChild(wrap);
      }

      s.appendChild(pin);
      s.appendChild(card);
      inner.appendChild(s);
    }

    band.appendChild(overlay);
    band.appendChild(inner);
    return band;
  }

  function setThemeFromStateBand(band){
    if (!band) return;
    const overlay = band.getAttribute("data-overlay") || "day";
    const theme = (band.getAttribute("data-theme") || "").toLowerCase();
    document.body.setAttribute("data-overlay", overlay);

    const found = ROUTE66.find(s => s.key === theme);
    document.documentElement.style.setProperty("--accent", (found && found.accent) ? found.accent : "#ffd54a");
  }

  function initStopObserver(){
    const stops = document.querySelectorAll(".stop");
    if (!stops.length) return;
    const io = new IntersectionObserver((entries)=>{
      for (const e of entries){
        if (e.isIntersecting){
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.12 });
    stops.forEach(s => io.observe(s));
  }

  function initStateObserver(){
    const bands = document.querySelectorAll(".state");
    if (!bands.length) return;
    const io = new IntersectionObserver((entries)=>{
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a,b)=> (b.intersectionRatio || 0) - (a.intersectionRatio || 0));
      if (visible[0]) setThemeFromStateBand(visible[0].target);
    }, { threshold: [0.2,0.35,0.5,0.65] });
    bands.forEach(b => io.observe(b));
  }

  function renderRoute66Journey(stops){
    const mount = $("statesMount");
    if (!mount) return;

    const normalizedStops = (stops || []).map(s => ({
      ...s,
      _stateKey: normalizeStateKey(s.state || s.state_theme_key || s.route_state || "")
    }));

    const byState = new Map();
    for (const rs of ROUTE66) byState.set(rs.key, []);
    for (const stop of normalizedStops){
      const key = byState.has(stop._stateKey) ? stop._stateKey : null;
      if (key) byState.get(key).push(stop);
    }
    for (const rs of ROUTE66){
      byState.get(rs.key).sort((a,b)=> (Number(a.order)||0) - (Number(b.order)||0));
    }

    mount.innerHTML = "";
    for (const rs of ROUTE66){
      mount.appendChild(renderStateBand(rs, byState.get(rs.key)));
    }

    initStopObserver();
    initStateObserver();

    const firstBand = document.querySelector(".state");
    if (firstBand) setThemeFromStateBand(firstBand);
  }

  /********** TOWN (unchanged) **********/
  function renderTown(townRows){
    const mount = $("townMount");
    if (!mount) return;

    const items = (townRows || [])
      .filter(r => (r.title || r.body || r.image_url || "").trim())
      .sort((a,b)=> (Number(a.order)||0) - (Number(b.order)||0));

    mount.innerHTML = "";
    if (!items.length) return;

    // Uses your existing .card styles
    for (const it of items){
      const card = el("article","card neonCard");
      const title = (it.title || "").trim();
      if (title){
        const h = el("h3","card__title");
        h.textContent = title;
        card.appendChild(h);
      }
      const body = (it.body || "").trim();
      if (body){
        const p = el("p","card__body");
        p.textContent = body;
        card.appendChild(p);
      }

      if ((it.image_url || "").trim()){
        const media = el("div","card__media");
        const img = document.createElement("img");
        img.loading = "lazy";
        img.decoding = "async";
        img.src = it.image_url;
        img.alt = (it.image_caption || it.title || "Photo").trim();
        media.appendChild(img);

        const capText = (it.image_caption || "").trim();
        if (capText){
          const cap = el("div","card__caption");
          cap.textContent = capText;
          media.appendChild(cap);
        }
        card.appendChild(media);
      }

      if ((it.cta_text || "").trim() && (it.cta_url || "").trim()){
        const wrap = el("div","card__cta");
        const a = el("a","btn btn--route",{
          href: it.cta_url,
          target: it.cta_url.startsWith("#") ? "_self" : "_blank",
          rel:"noopener"
        });
        a.innerHTML = `<span><span class="routeBadge">66</span> ${it.cta_text}</span>`;
        wrap.appendChild(a);
        card.appendChild(wrap);
      }

      mount.appendChild(card);
    }
  }

  /********** HISTORY (unchanged mount: #historyMount if present) **********/
  function renderHistory(historyRows){
    const mount = $("historyMount");
    if (!mount) return;

    const items = (historyRows || [])
      .filter(r => (r.title || r.body || r.image_url || "").trim())
      .sort((a,b)=> (Number(a.order)||0) - (Number(b.order)||0));

    mount.innerHTML = "";
    if (!items.length) return;

    for (const it of items){
      const item = el("article","timelineItem neonCard");
      const kickerText = (it.year || "").trim();
      if (kickerText){
        const kicker = el("div","timelineItem__kicker");
        kicker.textContent = kickerText;
        item.appendChild(kicker);
      }

      const title = (it.title || "").trim();
      if (title){
        const h = el("h3","timelineItem__title");
        h.textContent = title;
        item.appendChild(h);
      }

      const body = (it.body || "").trim();
      if (body){
        const p = el("p","timelineItem__body");
        p.textContent = body;
        item.appendChild(p);
      }

      if ((it.image_url || "").trim()){
        const media = el("div","timelineItem__media");
        const img = document.createElement("img");
        img.loading = "lazy";
        img.decoding = "async";
        img.src = it.image_url;
        img.alt = (it.image_caption || it.title || "Historic photo").trim();
        media.appendChild(img);
        media.appendChild(el("div","stop__caption")); // safe divider
        item.appendChild(media);
      }

      mount.appendChild(item);
    }
  }

  /********** LOAD EVERYTHING **********/
  async function loadAll(){
    const [siteRows, stopRows, alertRows, galleryRows, reviewRows, townRows, historyRows] = await Promise.all([
      loadSheetObjects(SHEETS.SITE_CONFIG_CSV).catch(()=>[]),
      loadSheetObjects(SHEETS.STOPS_CSV).catch(()=>[]),
      loadSheetObjects(SHEETS.ALERTS_CSV).catch(()=>[]),
      loadSheetObjects(SHEETS.GALLERY_CSV).catch(()=>[]),
      loadSheetObjects(SHEETS.REVIEWS_CSV).catch(()=>[]),
      loadSheetObjects(SHEETS.TOWN_CSV).catch(()=>[]),
      loadSheetObjects(SHEETS.HISTORY_CSV).catch(()=>[])
    ]);

    return {
      site: siteRows[0] || null,
      stops: stopRows || [],
      alerts: alertRows || [],
      gallery: galleryRows || [],
      reviews: reviewRows || [],
      town: townRows || [],
      history: historyRows || []
    };
  }

  async function main(){
    initMenu();

    let data = { site:null, stops:[], alerts:[], gallery:[], reviews:[], town:[], history:[] };
    try { data = await loadAll(); }
    catch (err) { console.warn("Sheet load failed (using defaults):", err); }

    applySiteConfig(data.site);
    applyAlerts(data.alerts);

    renderMiniGallery(data.gallery);
    renderReviews(data.reviews);   // ✅ FIXED
    renderRoute66Journey(data.stops);
    renderTown(data.town);
    renderHistory(data.history);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();
