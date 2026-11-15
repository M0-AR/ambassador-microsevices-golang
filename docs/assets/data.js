(() => {
  "use strict";

  const TODAY = new Date("2026-11-15T12:00:00Z");
  const STORAGE_KEY = "ambassador-demo-v2";

  const ICONS = {
    dashboard: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    box: '<path d="M21 8.4 12 3 3 8.4v7.2L12 21l9-5.4V8.4Z"/><path d="m3 8.4 9 5.3 9-5.3M12 21v-7.3"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.1.1l3-3a5 5 0 0 0-7.1-7.1l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.1-.1l-3 3A5 5 0 0 0 11 21l1.7-1.7"/>',
    store: '<path d="M3 9.5 4.5 4h15L21 9.5"/><path d="M3 9.5h18V21H3z"/><path d="M3 9.5a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M9 21v-6h6v6"/>',
    receipt: '<path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2Z"/><path d="M9 7h6M9 11h6M9 15h4"/>',
    bag: '<path d="M6 7h12l1 13H5L6 7Z"/><path d="M9 7V6a3 3 0 0 1 6 0v1"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 15 4-5 3 3 5-7"/>',
    wallet: '<path d="M20 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15v4"/><path d="M3 7v12a2 2 0 0 0 2 2h16V11H5a2 2 0 0 1-2-4Z"/><path d="M16 14h.01"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/>',
    reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    external: '<path d="M14 3h7v7M21 3l-9 9"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>',
    check: '<path d="m5 12 5 5L20 7"/>',
    alert: '<path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5M12 18h.01"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    spark: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/>',
    play: '<path d="m8 5 11 7-11 7V5Z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    arrowUp: '<path d="M12 19V5M5 12l7-7 7 7"/>',
    arrowDown: '<path d="M12 5v14M19 12l-7 7-7-7"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 11v5M14 11v5"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    brain: '<path d="M9 3a3 3 0 0 0-3 3v1a3 3 0 0 0-1 5.8V15a3 3 0 0 0 3 3h1v3"/><path d="M15 3a3 3 0 0 1 3 3v1a3 3 0 0 1 1 5.8V15a3 3 0 0 1-3 3h-1v3"/><path d="M9 3a3 3 0 0 1 6 0M9 21h6"/>'
  };

  const icon = (name, className = "") => `<svg${className ? ` class="${className}"` : ""} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.spark}</svg>`;

  const money = (value, compact = false) => {
    const compactMode = compact && Math.abs(value) >= 10000;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: compactMode ? 1 : 0,
      notation: compactMode ? "compact" : "standard"
    }).format(value);
  };

  const number = (value) => new Intl.NumberFormat("en-US").format(Math.round(value));
  const percent = (value, digits = 1) => `${value.toFixed(digits)}%`;
  const initials = (name) => name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

  const formatDate = (value, options = {}) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", ...options }).format(new Date(value));
  const formatDateTime = (value) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));

  const mulberry32 = (seed) => () => {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const randomSeries = (seed, length = 12) => {
    const random = mulberry32(seed);
    return Array.from({ length }, (_, index) => 34 + Math.sin(index * 0.8 + seed) * 12 + random() * 22);
  };

  const PRODUCTS = [
    { id: "p_ridgeline", name: "Ridgeline Pack 28L", category: "Carry", price: 148, stock: 42, commission: 12, sold: 328, art: "ridgeline-pack.svg", status: "active", description: "A weatherproof 28-litre pack with a suspended laptop sleeve and trail-tested harness." },
    { id: "p_flask", name: "Summit Flask 750", category: "Drinkware", price: 38, stock: 184, commission: 10, sold: 924, art: "summit-flask.svg", status: "active", description: "Double-wall steel, 18-hour heat retention, and a lid that survives the bottom of a pack." },
    { id: "p_halo", name: "Halo Camp Light", category: "Shelter", price: 64, stock: 12, commission: 12, sold: 214, art: "halo-camp-light.svg", status: "active", description: "A warm 320-lumen lantern with a dimmable night mode and a 40-hour battery." },
    { id: "p_throw", name: "Basecamp Throw", category: "Sleep", price: 96, stock: 28, commission: 12, sold: 188, art: "basecamp-throw.svg", status: "active", description: "Recycled merino blend, woven in small batches, soft enough for the van and the sofa." },
    { id: "p_coffee", name: "Morning Ridge Kit", category: "Coffee", price: 52, stock: 64, commission: 10, sold: 412, art: "morning-ridge-kit.svg", status: "active", description: "A packable pour-over set with a stainless dripper, two cups, and a travel case." },
    { id: "p_speaker", name: "Trailhead Speaker", category: "Audio", price: 89, stock: 0, commission: 10, sold: 142, art: "trailhead-speaker.svg", status: "active", description: "A palm-sized speaker with a 20-hour battery and a carabiner that actually holds." },
    { id: "p_runner", name: "Northstar Runner", category: "Footwear", price: 132, stock: 76, commission: 12, sold: 361, art: "northstar-runner.svg", status: "active", description: "A daily trail runner with a rock plate, a wide toe box, and grip for wet roots." },
    { id: "p_tent", name: "Aurora 2P Tent", category: "Shelter", price: 320, stock: 8, commission: 10, sold: 96, art: "aurora-tent.svg", status: "active", description: "A freestanding two-person shelter with two doors, two vestibules, and a 1.2 kg trail weight." },
    { id: "p_daypack", name: "Drift Daypack 18L", category: "Carry", price: 98, stock: 55, commission: 10, sold: 233, art: "ridgeline-pack.svg", status: "active", description: "A clean 18-litre commuter that folds flat and opens wide for the security tray." },
    { id: "p_mug", name: "Ember Mug", category: "Drinkware", price: 32, stock: 210, commission: 10, sold: 688, art: "summit-flask.svg", status: "active", description: "A ceramic-lined camp mug that keeps coffee hot for two hours without a lid." },
    { id: "p_quilt", name: "Cloudline Quilt", category: "Sleep", price: 189, stock: 19, commission: 12, sold: 117, art: "basecamp-throw.svg", status: "active", description: "A 20 degree backpacking quilt with draft collars and a footbox that opens flat." },
    { id: "p_poles", name: "Waypoint Poles", category: "Carry", price: 74, stock: 0, commission: 10, sold: 84, art: "ridgeline-pack.svg", status: "draft", description: "Carbon-aluminium trekking poles with cork grips and a 30 cm packed length." }
  ];

  const AMBASSADORS = [
    { id: "amb_maya", name: "Maya Chen", handle: "@mayawalks", slug: "maya", email: "maya@mayawalks.co", tier: "elite", rate: 12, clicks: 18420, orders: 412, revenue: 48620, status: "active", joined: "2025-03-12", color: "#7ee2b8", country: "United States", audience: "Trail running and fastpacking" },
    { id: "amb_priya", name: "Priya Nair", handle: "@priya.packs", slug: "priya", email: "priya@priyapacks.com", tier: "elite", rate: 12, clicks: 15280, orders: 348, revenue: 41240, status: "active", joined: "2025-05-02", color: "#f0b35b", country: "United Kingdom", audience: "Ultralight backpacking" },
    { id: "amb_jordan", name: "Jordan Reyes", handle: "@jordanoutside", slug: "jordan", email: "jordan@outside.studio", tier: "pro", rate: 10, clicks: 11240, orders: 241, revenue: 26880, status: "active", joined: "2025-08-19", color: "#8ab4f8", country: "United States", audience: "Weekend camping" },
    { id: "amb_sam", name: "Sam Okafor", handle: "@samsummits", slug: "sam", email: "sam@samsummits.co", tier: "pro", rate: 10, clicks: 9280, orders: 196, revenue: 21420, status: "active", joined: "2025-09-04", color: "#c3b1f7", country: "Canada", audience: "Alpine climbing" },
    { id: "amb_diego", name: "Diego Torres", handle: "@diegoruns", slug: "diego", email: "diego@diegoruns.mx", tier: "pro", rate: 10, clicks: 7610, orders: 154, revenue: 17690, status: "active", joined: "2025-11-21", color: "#a8d5ba", country: "Mexico", audience: "Trail running" },
    { id: "amb_lena", name: "Lena Fischer", handle: "@lenafinds", slug: "lena", email: "lena@lenafinds.de", tier: "rising", rate: 8, clicks: 5280, orders: 92, revenue: 8940, status: "active", joined: "2026-02-14", color: "#f4a6a0", country: "Germany", audience: "Slow travel" },
    { id: "amb_aisha", name: "Aisha Bello", handle: "@aishabikes", slug: "aisha", email: "aisha@aishabikes.co", tier: "rising", rate: 8, clicks: 4140, orders: 71, revenue: 6420, status: "active", joined: "2026-04-03", color: "#f2c6a0", country: "Nigeria", audience: "Bikepacking" },
    { id: "amb_noah", name: "Noah Kim", handle: "@noahkims", slug: "noah", email: "noah@noahkims.com", tier: "rising", rate: 8, clicks: 3420, orders: 58, revenue: 4980, status: "paused", joined: "2026-06-18", color: "#d8c3a5", country: "South Korea", audience: "City to trail" }
  ];

  const CUSTOMERS = ["Elena R.", "Marcus T.", "Sofia L.", "Dev P.", "Hana K.", "Owen B.", "Nadia S.", "Theo M.", "Iris W.", "Jonas F.", "Amara D.", "Leo C."];

  const PAGES = [
    { id: "dashboard", label: "Dashboard", file: "dashboard.html", icon: "dashboard", group: "Workspace" },
    { id: "products", label: "Products", file: "products.html", icon: "box", group: "Workspace" },
    { id: "ambassadors", label: "Ambassadors", file: "ambassadors.html", icon: "users", group: "Workspace" },
    { id: "links", label: "Links", file: "links.html", icon: "link", group: "Workspace" },
    { id: "storefront", label: "Storefront", file: "storefront.html?ref=maya", icon: "store", group: "Workspace" },
    { id: "orders", label: "Orders", file: "orders.html", icon: "receipt", group: "Commerce" },
    { id: "analytics", label: "Analytics", file: "analytics.html", icon: "chart", group: "Commerce" },
    { id: "payouts", label: "Payouts", file: "payouts.html", icon: "wallet", group: "Commerce" },
    { id: "settings", label: "Settings", file: "settings.html", icon: "settings", group: "Admin" }
  ];

  function buildSeries(seed = 42) {
    const random = mulberry32(seed);
    const series = [];
    for (let index = 89; index >= 0; index -= 1) {
      const date = new Date(TODAY);
      date.setUTCDate(date.getUTCDate() - index);
      const day = date.getUTCDay();
      const weekend = day === 0 || day === 6 ? 1.13 : 1;
      const trend = (90 - index) * 11;
      const wave = Math.sin((90 - index) / 6.4) * 330;
      const revenue = Math.round((2950 + trend + wave + (random() - 0.5) * 960) * weekend);
      const clicks = Math.round(revenue / 0.73 + random() * 1350);
      const orders = Math.max(9, Math.round(revenue / 91 + random() * 12));
      series.push({ date: date.toISOString().slice(0, 10), revenue, clicks, orders, commission: Math.round(revenue * 0.1) });
    }
    return series;
  }

  function buildOrders(products, ambassadors) {
    const random = mulberry32(7);
    const statuses = ["paid", "fulfilled", "paid", "fulfilled", "paid", "pending", "fulfilled", "paid", "refunded", "paid", "fulfilled", "paid"];
    return Array.from({ length: 26 }, (_, index) => {
      const product = products[(index * 5 + 2) % products.length];
      const ambassador = ambassadors[index % ambassadors.length];
      const quantity = index % 7 === 0 ? 2 : 1;
      const total = product.price * quantity;
      const date = new Date(TODAY);
      date.setUTCDate(date.getUTCDate() - Math.floor(index * 0.72));
      return {
        id: `NS-${10482 + index}`,
        customer: CUSTOMERS[index % CUSTOMERS.length],
        product: product.id,
        ambassador: ambassador.id,
        quantity,
        total,
        commission: Math.round(total * ambassador.rate / 100),
        status: statuses[index % statuses.length],
        date: date.toISOString()
      };
    });
  }

  function createState() {
    const products = PRODUCTS.map((product) => ({ ...product }));
    const ambassadors = AMBASSADORS.map((ambassador) => ({ ...ambassador }));
    const links = [
      ["amb_maya", "p_ridgeline", "maya-ridgeline", "Autumn trail guide", 2840, 84, 12432, "active"],
      ["amb_priya", "p_tent", "priya-aurora", "Ultralight field notes", 2310, 61, 19520, "active"],
      ["amb_maya", "p_flask", "maya-flask", "Everyday carry", 1880, 94, 3572, "active"],
      ["amb_jordan", "p_runner", "jordan-runner", "Weekend kit", 1460, 38, 5016, "active"],
      ["amb_sam", "p_quilt", "sam-quilt", "Shoulder season sleep", 1180, 22, 4158, "active"],
      ["amb_priya", "p_halo", "priya-halo", "Camp light comparison", 980, 31, 1984, "active"],
      ["amb_diego", "p_throw", "diego-throw", "Van life essentials", 870, 19, 1824, "active"],
      ["amb_lena", "p_coffee", "lena-coffee", "Slow mornings", 720, 28, 1456, "active"],
      ["amb_aisha", "p_daypack", "aisha-daypack", "Bikepacking setup", 640, 14, 1372, "paused"],
      ["amb_noah", "p_mug", "noah-mug", "City to trail", 590, 21, 672, "paused"],
      ["amb_jordan", "p_speaker", "jordan-speaker", "Camp soundtrack", 420, 11, 979, "active"],
      ["amb_maya", "p_runner", "maya-runner", "Northstar runner review", 1620, 47, 6204, "active"]
    ].map(([ambassador, product, slug, campaign, clicks, conversions, revenue, status], index) => ({
      id: `lnk_${index + 1}`, ambassador, product, slug, campaign, clicks, conversions, revenue, status,
      created: `2026-${String(8 + (index % 3)).padStart(2, "0")}-${String(8 + index).padStart(2, "0")}`
    }));

    const orders = buildOrders(products, ambassadors);
    const payouts = ambassadors.slice(0, 7).map((ambassador, index) => {
      const amount = Math.round(ambassador.revenue * ambassador.rate / 100 * 0.62);
      const date = new Date(TODAY);
      date.setUTCDate(date.getUTCDate() - index * 6 - 3);
      return {
        id: `PO-${2041 + index}`, ambassador, amount,
        period: index < 3 ? "Oct 1 - Oct 31, 2026" : "Sep 1 - Sep 30, 2026",
        method: "Stripe Connect",
        status: ["pending", "paid", "paid", "scheduled", "paid", "pending", "paid"][index],
        date: date.toISOString()
      };
    });

    return {
      version: 2, products, ambassadors, links, orders, payouts,
      series: buildSeries(),
      settings: {
        storeName: "Northstar Supply", domain: "northstar.supply", currency: "USD",
        timezone: "America/Los_Angeles", commissionRate: 10, cookieWindow: "30 days",
        attribution: "Last click", autoApprove: true, minPayout: 25, emailUpdates: true, fraudReview: true
      },
      team: [
        { id: "tm_1", name: "Elena Rossi", email: "elena@northstar.supply", role: "Owner", color: "#7ee2b8" },
        { id: "tm_2", name: "Marcus Webb", email: "marcus@northstar.supply", role: "Admin", color: "#f0b35b" },
        { id: "tm_3", name: "Sana Iqbal", email: "sana@northstar.supply", role: "Analyst", color: "#8ab4f8" },
        { id: "tm_4", name: "Theo March", email: "theo@northstar.supply", role: "Support", color: "#c3b1f7" }
      ],
      activity: [
        { icon: "receipt", text: "Order NS-10503 attributed to Maya Chen", time: "8m ago" },
        { icon: "users", text: "Priya Nair moved to Elite tier", time: "42m ago" },
        { icon: "link", text: "New link created for Jordan Reyes", time: "1h ago" },
        { icon: "wallet", text: "October payout batch approved", time: "3h ago" },
        { icon: "box", text: "Halo Camp Light is low on stock", time: "5h ago" }
      ]
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === 2) return parsed;
      }
    } catch (error) { /* Demo state is best effort. */ }
    return createState();
  }

  let state = loadState();

  const getState = () => state;
  const setState = (next) => { state = next; };
  const saveState = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) { /* private iframe */ }
  };
  const resetState = () => { state = createState(); saveState(); return state; };

  const productById = (id) => state.products.find((product) => product.id === id);
  const ambassadorById = (id) => state.ambassadors.find((ambassador) => ambassador.id === id);
  const ambassadorBySlug = (slug) => state.ambassadors.find((ambassador) => ambassador.slug === slug || ambassador.handle.replace("@", "") === slug);
  const productStatus = (product) => {
    if (product.status === "draft") return "draft";
    if (product.stock === 0) return "out";
    if (product.stock < 15) return "low";
    return "active";
  };

  const statusBadge = (status) => {
    const map = {
      active: ["active", "Active"], draft: ["draft", "Draft"], low: ["pending", "Low stock"], out: ["refunded", "Out of stock"],
      paid: ["paid", "Paid"], fulfilled: ["fulfilled", "Fulfilled"], pending: ["pending", "Pending"], refunded: ["refunded", "Refunded"],
      processing: ["processing", "Processing"], scheduled: ["scheduled", "Scheduled"], paused: ["paused", "Paused"],
      rising: ["rising", "Rising"], pro: ["pro", "Pro"], elite: ["elite", "Elite"], connected: ["connected", "Connected"]
    };
    const [className, label] = map[status] || ["draft", status];
    return `<span class="badge ${className}">${label}</span>`;
  };

  const delta = (value) => {
    if (value === null || value === undefined || Number.isNaN(value)) return "";
    const direction = value > 0.05 ? "up" : value < -0.05 ? "down" : "flat";
    const symbol = direction === "up" ? "↑" : direction === "down" ? "↓" : "→";
    return `<span class="delta ${direction}">${symbol} ${Math.abs(value).toFixed(1)}%</span>`;
  };

  const metrics = (days) => {
    const current = state.series.slice(-days);
    const previous = state.series.slice(-days * 2, -days);
    const sum = (rows, key) => rows.reduce((total, row) => total + row[key], 0);
    const revenue = sum(current, "revenue");
    const prevRevenue = sum(previous, "revenue") || 1;
    const orders = sum(current, "orders");
    const prevOrders = sum(previous, "orders") || 1;
    const clicks = sum(current, "clicks");
    const prevClicks = sum(previous, "clicks") || 1;
    const commission = sum(current, "commission");
    const prevCommission = sum(previous, "commission") || 1;
    const conversion = orders / clicks * 100;
    const prevConversion = prevOrders / prevClicks * 100;
    return {
      revenue, revenueDelta: (revenue - prevRevenue) / prevRevenue * 100,
      orders, ordersDelta: (orders - prevOrders) / prevOrders * 100,
      clicks, clicksDelta: (clicks - prevClicks) / prevClicks * 100,
      conversion, conversionDelta: (conversion - prevConversion) / prevConversion * 100,
      commission, commissionDelta: (commission - prevCommission) / prevCommission * 100,
      aov: revenue / orders
    };
  };

  window.AmbassadorData = {
    TODAY, STORAGE_KEY, PAGES, icon, money, number, percent, initials, escapeHtml,
    formatDate, formatDateTime, mulberry32, randomSeries, getState, setState, saveState,
    resetState, productById, ambassadorById, ambassadorBySlug, productStatus, statusBadge,
    delta, metrics, buildSeries
  };
})();
