(() => {
  "use strict";
  const D = window.AmbassadorData;
  const U = window.AmbassadorUI;
  const P = window.AmbassadorPages;
  const { icon, money, number, percent, initials, escapeHtml, statusBadge, formatDate, formatDateTime } = D;

  const pageId = document.body.dataset.page || "dashboard";
  const THEME_KEY = "ambassador-demo-theme";
  const CART_KEY = "ambassador-demo-cart";
  const ui = {
    range: 30,
    analyticsRange: 30,
    productQuery: "",
    productCategory: "all",
    productStatus: "all",
    productView: "grid",
    ambTier: "all",
    ambQuery: "",
    linkQuery: "",
    orderQuery: "",
    orderStatus: "all",
    settingsTab: "workspace",
    cart: loadCart()
  };

  let pendingFocus = null;
  let searchTimer = null;
  let activeModalSubmit = null;
  let modalReturnFocus = null;
  let drawerReturnFocus = null;
  let commandItems = [];
  let commandSelection = 0;

  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      return {};
    }
  }

  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(ui.cart)); } catch (error) { /* optional */ }
  }

  function applyTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") document.documentElement.dataset.theme = saved;
    } catch (error) { /* optional */ }
  }

  function ensureOverlays() {
    if (document.getElementById("toast-stack")) return;
    document.body.insertAdjacentHTML("beforeend", `
      <div id="toast-stack" class="toast-stack" aria-live="polite" aria-atomic="false"></div>
      <div id="scrim" class="scrim"></div>
      <aside id="drawer" class="drawer" aria-label="Details panel"></aside>
      <div id="modal-root" class="modal-root" role="presentation"></div>`);
  }

  function navCount(id) {
    const state = D.getState();
    if (id === "orders") return state.orders.filter((order) => order.status === "pending").length || "";
    if (id === "ambassadors") return state.ambassadors.filter((ambassador) => ambassador.status === "active").length;
    return "";
  }

  function renderShell() {
    const state = D.getState();
    const page = D.PAGES.find((item) => item.id === pageId) || D.PAGES[0];
    const groups = ["Workspace", "Commerce", "Admin"];
    const nav = groups.map((group) => `<div class="nav-label">${group}</div>${D.PAGES.filter((item) => item.group === group).map((item) => {
      const count = navCount(item.id);
      return `<a class="nav-link" href="${item.file}" ${item.id === pageId ? 'aria-current="page"' : ""}>${icon(item.icon)}<span>${item.label}</span>${count ? `<span class="nav-count">${count}</span>` : ""}</a>`;
    }).join("")}`).join("");

    document.getElementById("app").innerHTML = `
      <a class="skip-link" href="#page">Skip to content</a>
      <div class="app-shell">
        <aside class="sidebar" id="sidebar" aria-label="Demo navigation">
          <a class="brand" href="../preview.html">
            <span class="brand-mark">${icon("spark")}</span>
            <span class="brand-word">Ambassador<span>product demo</span></span>
          </a>
          <div class="workspace-chip">
            <span class="ws-avatar">${initials(state.settings.storeName)}</span>
            <span class="ws-meta"><strong>${escapeHtml(state.settings.storeName)}</strong><small>${escapeHtml(state.settings.domain)}</small></span>
            <span class="ws-chevron">⌄</span>
          </div>
          <nav class="nav">${nav}</nav>
          <div class="sidebar-foot">
            <a class="back-link" href="../preview.html">← Back to overview</a>
            <div class="demo-note">Interactive demo. All names, orders, and payouts are sample data stored in your browser.</div>
          </div>
        </aside>
        <div class="main">
          <header class="topbar">
            <button type="button" class="icon-button menu-button" data-action="toggle-nav" aria-label="Open navigation" aria-controls="sidebar">${icon("menu")}</button>
            <div class="crumbs">Workspace <span>/</span> <strong>${page.label}</strong></div>
            <div class="top-actions">
              <button type="button" class="search-button" data-action="command" aria-label="Search the demo">${icon("search")}<span>Search</span><kbd>⌘K</kbd></button>
              <button type="button" class="icon-button" data-action="theme" aria-label="Toggle light and dark theme">${icon(document.documentElement.dataset.theme === "light" ? "moon" : "sun")}</button>
              <button type="button" class="icon-button" data-action="reset-demo" aria-label="Reset demo data" title="Reset demo data">${icon("reset")}</button>
              <div class="avatar" title="Demo operator">MA</div>
            </div>
          </header>
          <main class="page" id="page" tabindex="-1"></main>
        </div>
      </div>`;
    renderPage();
  }

  function renderPage() {
    const target = document.getElementById("page");
    if (!target) return;
    const renderers = {
      dashboard: P.renderDashboard,
      products: P.renderProducts,
      ambassadors: P.renderAmbassadors,
      links: P.renderLinks,
      orders: P.renderOrders,
      analytics: P.renderAnalytics,
      payouts: P.renderPayouts,
      settings: P.renderSettings
    };
    target.innerHTML = (renderers[pageId] || P.renderDashboard)(ui);
    U.bindCharts();
    U.bindRanges();
    if (pendingFocus) {
      const { selector, position } = pendingFocus;
      pendingFocus = null;
      const input = document.querySelector(selector);
      if (input) {
        input.focus();
        if (typeof position === "number" && input.setSelectionRange) input.setSelectionRange(position, position);
      }
    }
  }

  function updateScrollLock() {
    const modalOpen = document.getElementById("modal-root")?.classList.contains("open");
    const drawerOpen = document.getElementById("drawer")?.classList.contains("open");
    document.body.style.overflow = modalOpen || drawerOpen ? "hidden" : "";
  }

  function toast(message, type = "success") {
    const stack = document.getElementById("toast-stack");
    if (!stack) return;
    const item = document.createElement("div");
    item.className = `toast ${type === "error" ? "error" : ""}`;
    item.innerHTML = `${icon(type === "error" ? "alert" : "check")}<span>${escapeHtml(message)}</span>`;
    stack.appendChild(item);
    setTimeout(() => {
      item.style.opacity = "0";
      item.style.transform = "translateY(6px)";
      setTimeout(() => item.remove(), 220);
    }, 3600);
  }

  function openModal({ title, sub = "", body = "", submitLabel = "Save", danger = false, cancelLabel = "Cancel", onSubmit = null }) {
    ensureOverlays();
    const root = document.getElementById("modal-root");
    modalReturnFocus = document.activeElement;
    activeModalSubmit = onSubmit;
    root.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-head"><div><h2 id="modal-title">${title}</h2>${sub ? `<p>${sub}</p>` : ""}</div><button type="button" class="drawer-close" data-action="close-modal" aria-label="Close dialog">${icon("close")}</button></div>
      <form id="modal-form">
        ${body}
        <div class="modal-actions">
          <button type="button" class="btn" data-action="close-modal">${cancelLabel}</button>
          <button type="submit" class="btn ${danger ? "btn-danger" : "btn-primary"}">${submitLabel}</button>
        </div>
      </form>
    </div>`;
    root.classList.add("open");
    updateScrollLock();
    setTimeout(() => {
      const focusTarget = root.querySelector("input, select, textarea") || root.querySelector("button");
      if (focusTarget) focusTarget.focus();
    }, 50);
  }

  function closeModal() {
    const root = document.getElementById("modal-root");
    if (!root) return;
    root.classList.remove("open");
    root.innerHTML = "";
    activeModalSubmit = null;
    updateScrollLock();
    if (modalReturnFocus && document.contains(modalReturnFocus)) modalReturnFocus.focus();
    modalReturnFocus = null;
  }

  function openDrawer(html) {
    ensureOverlays();
    const drawer = document.getElementById("drawer");
    const scrim = document.getElementById("scrim");
    drawerReturnFocus = document.activeElement;
    drawer.innerHTML = html;
    drawer.classList.add("open");
    scrim.classList.add("open");
    updateScrollLock();
    setTimeout(() => {
      const focusTarget = drawer.querySelector("button, input, select, a");
      if (focusTarget) focusTarget.focus();
    }, 50);
  }

  function closeDrawer() {
    const drawer = document.getElementById("drawer");
    const scrim = document.getElementById("scrim");
    if (!drawer) return;
    drawer.classList.remove("open");
    scrim.classList.remove("open");
    updateScrollLock();
    setTimeout(() => { drawer.innerHTML = ""; }, 250);
    if (drawerReturnFocus && document.contains(drawerReturnFocus)) drawerReturnFocus.focus();
    drawerReturnFocus = null;
  }

  function downloadFile(filename, content, mime = "text/csv;charset=utf-8") {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function toCsv(rows) {
    return rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  }

  async function copyText(text, message = "Copied to clipboard.") {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try { document.execCommand("copy"); } catch (fallbackError) { toast("Copy failed. Select the link manually.", "error"); textarea.remove(); return; }
      textarea.remove();
    }
    toast(message);
  }

  function exportReport() {
    const rows = [["Date", "Revenue", "Orders", "Clicks", "Commission"]].concat(D.randomSeries(ui.range).map((row) => [row.date, row.revenue, row.orders, row.clicks, row.commission]));
    downloadFile("northstar-report.csv", toCsv(rows));
    toast("Report downloaded.");
  }

  function exportOrders() {
    const rows = [["Order", "Date", "Customer", "Product", "Ambassador", "Total", "Commission", "Status"]].concat(D.getState().orders.map((order) => {
      const product = D.productById(order.product);
      const ambassador = D.ambassadorById(order.ambassador);
      return [order.id, order.date, order.customer, product ? product.name : order.product, ambassador ? ambassador.name : order.ambassador, order.total, order.commission, order.status];
    }));
    downloadFile("northstar-orders.csv", toCsv(rows));
    toast("Orders exported.");
  }

  function exportAmbassadors() {
    const rows = [["Name", "Handle", "Email", "Tier", "Status", "Audience", "Clicks", "Orders", "Revenue", "Rate", "Joined"]].concat(D.getState().ambassadors.map((ambassador) => [ambassador.name, ambassador.handle, ambassador.email, ambassador.tier, ambassador.status, ambassador.audience, ambassador.clicks, ambassador.orders, ambassador.revenue, ambassador.rate, ambassador.joined]));
    downloadFile("northstar-ambassadors.csv", toCsv(rows));
    toast("Ambassador roster exported.");
  }

  function exportAnalytics() {
    const rows = [["Date", "Revenue", "Orders", "Clicks", "Commission"]].concat(D.randomSeries(ui.analyticsRange).map((row) => [row.date, row.revenue, row.orders, row.clicks, row.commission]));
    downloadFile("northstar-analytics.csv", toCsv(rows));
    toast("Analytics exported.");
  }

  function openProductDrawer(id) {
    const product = D.productById(id);
    if (!product) return;
    const revenue = product.sold * product.price;
    openDrawer(`<div class="drawer-head">
      <span class="drawer-thumb"><img src="../assets/products/${product.art}" alt=""></span>
      <div><h2>${escapeHtml(product.name)}</h2><p>${product.category} · <span class="mono">${product.id}</span></p>${statusBadge(product.status)}</div>
      <button type="button" class="drawer-close" data-action="close-drawer" aria-label="Close product panel">${icon("close")}</button>
    </div>
    <div class="drawer-section"><img src="../assets/products/${product.art}" alt="${escapeHtml(product.name)}" style="width:100%;aspect-ratio:16/10;object-fit:cover;border-radius:12px;border:1px solid var(--line)"></div>
    <div class="drawer-section">
      <div class="detail-grid">
        <div><span>Price</span><strong>${money(product.price)}</strong></div>
        <div><span>In stock</span><strong>${product.stock} units</strong></div>
        <div><span>Units sold</span><strong>${number(product.sold)}</strong></div>
        <div><span>Revenue</span><strong>${money(revenue)}</strong></div>
      </div>
    </div>
    <div class="drawer-section"><h3>About this product</h3><p style="margin:0;color:var(--muted);font-size:12px;line-height:1.7">${escapeHtml(product.description)}</p></div>
    <form class="drawer-section" data-form="product-edit" data-id="${product.id}">
      <h3>Edit product</h3>
      <div class="form-grid two">
        <div class="field"><label for="p-price">Price</label><input class="input" id="p-price" name="price" type="number" min="0" step="1" value="${product.price}" required></div>
        <div class="field"><label for="p-stock">Stock</label><input class="input" id="p-stock" name="stock" type="number" min="0" step="1" value="${product.stock}" required></div>
        <div class="field"><label for="p-commission">Commission</label><input class="input" id="p-commission" name="commission" type="number" min="0" max="40" step="1" value="${product.commission}" required></div>
        <div class="field"><label for="p-status">Status</label><select class="select" id="p-status" name="status"><option value="active" ${product.status === "active" ? "selected" : ""}>Active</option><option value="draft" ${product.status === "draft" ? "selected" : ""}>Draft</option></select></div>
      </div>
      <div class="page-actions"><button type="submit" class="btn btn-primary">Save changes</button><button type="button" class="btn" data-action="close-drawer">Close</button></div>
    </form>`);
  }

  function openAmbassadorDrawer(id) {
    const state = D.getState();
    const ambassador = D.ambassadorById(id);
    if (!ambassador) return;
    const links = state.links.filter((link) => link.ambassador === id).slice(0, 3);
    openDrawer(`<div class="drawer-head">
      <span class="avatar-lg" style="background:${ambassador.color}">${initials(ambassador.name)}</span>
      <div><h2>${escapeHtml(ambassador.name)}</h2><p>${escapeHtml(ambassador.handle)} · ${escapeHtml(ambassador.country)}</p><div style="display:flex;gap:6px;margin-top:6px">${statusBadge(ambassador.tier)}${statusBadge(ambassador.status)}</div></div>
      <button type="button" class="drawer-close" data-action="close-drawer" aria-label="Close ambassador panel">${icon("close")}</button>
    </div>
    <div class="drawer-section"><div class="detail-grid">
      <div><span>Revenue</span><strong>${money(ambassador.revenue)}</strong></div>
      <div><span>Orders</span><strong>${number(ambassador.orders)}</strong></div>
      <div><span>Clicks</span><strong>${number(ambassador.clicks)}</strong></div>
      <div><span>Commission</span><strong>${ambassador.rate}%</strong></div>
    </div></div>
    <div class="drawer-section"><h3>Profile</h3><div class="detail-grid">
      <div><span>Audience</span><strong style="font-size:13px">${escapeHtml(ambassador.audience)}</strong></div>
      <div><span>Joined</span><strong style="font-size:13px">${formatDate(ambassador.joined)}</strong></div>
      <div style="grid-column:1/-1"><span>Email</span><strong style="font-size:13px">${escapeHtml(ambassador.email)}</strong></div>
    </div></div>
    <div class="drawer-section"><h3>Recent links</h3>
      ${links.length ? links.map((link) => `<div class="link-row">${icon("link")}<div class="list-main"><strong>${escapeHtml(link.campaign)}</strong><small class="mono">/r/${escapeHtml(link.slug)}</small></div><span>${number(link.clicks)} clicks</span></div>`).join("") : '<p style="margin:0;color:var(--faint);font-size:12px">No links yet.</p>'}
    </div>
    <div class="drawer-section" style="display:flex;gap:8px;flex-wrap:wrap">
      <button type="button" class="btn btn-primary" data-action="amb-email" data-id="${ambassador.id}">Send message</button>
      <button type="button" class="btn" data-action="toggle-amb" data-id="${ambassador.id}">${ambassador.status === "active" ? "Pause ambassador" : "Reactivate ambassador"}</button>
    </div>`);
  }

  function openOrderDrawer(id) {
    const state = D.getState();
    const order = state.orders.find((item) => item.id === id);
    if (!order) return;
    const product = D.productById(order.product);
    const ambassador = D.ambassadorById(order.ambassador);
    const date = new Date(order.date);
    const fulfilled = order.status === "fulfilled";
    const refunded = order.status === "refunded";
    openDrawer(`<div class="drawer-head">
      <span class="drawer-thumb">${icon("receipt")}</span>
      <div><h2>${order.id}</h2><p>${formatDateTime(order.date)} · ${order.customer}</p>${statusBadge(order.status)}</div>
      <button type="button" class="drawer-close" data-action="close-drawer" aria-label="Close order panel">${icon("close")}</button>
    </div>
    ${product ? `<div class="drawer-section"><div class="order-line"><img src="../assets/products/${product.art}" alt=""><div class="list-main"><strong>${escapeHtml(product.name)}</strong><small>${money(product.price)} × ${order.quantity}</small></div><strong>${money(order.total)}</strong></div></div>` : ""}
    <div class="drawer-section"><div class="detail-grid">
      <div><span>Order total</span><strong>${money(order.total)}</strong></div>
      <div><span>Commission</span><strong>${money(order.commission)}</strong></div>
      <div><span>Ambassador</span><strong style="font-size:13px">${ambassador ? escapeHtml(ambassador.name) : "Direct"}</strong></div>
      <div><span>Quantity</span><strong>${order.quantity}</strong></div>
    </div></div>
    <div class="drawer-section"><div class="split-box"><div><span>Ambassador earns</span><strong>${money(order.commission)}</strong></div><div><span>Store keeps</span><strong>${money(order.total - order.commission)}</strong></div><p>Split calculated from the ambassador's ${ambassador ? ambassador.rate : 0}% commission rate. Figures are illustrative.</p></div></div>
    <div class="drawer-section"><h3>Timeline</h3><div class="timeline">
      <div class="timeline-item done"><span></span><div><strong>Order placed</strong><small>${formatDate(date)} · ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</small></div></div>
      <div class="timeline-item done"><span></span><div><strong>Payment captured</strong><small>Stripe test mode · ${money(order.total)}</small></div></div>
      <div class="timeline-item ${fulfilled || refunded ? "done" : ""}"><span></span><div><strong>${refunded ? "Refunded" : fulfilled ? "Fulfilled" : "Fulfillment pending"}</strong><small>${refunded ? "Commission reversed in this demo" : fulfilled ? "Packed and handed to carrier" : "Not yet handed to the carrier"}</small></div></div>
    </div></div>
    <div class="drawer-section" style="display:flex;gap:8px;flex-wrap:wrap">
      ${order.status === "paid" ? `<button type="button" class="btn btn-primary" data-action="order-fulfill" data-id="${order.id}">Mark fulfilled</button>` : ""}
      ${!refunded ? `<button type="button" class="btn btn-danger" data-action="order-refund" data-id="${order.id}">Refund order</button>` : ""}
      <button type="button" class="btn" data-action="close-drawer">Close</button>
    </div>`);
  }

  function openPayoutDrawer(id) {
    const state = D.getState();
    const payout = state.payouts.find((item) => item.id === id);
    if (!payout) return;
    const ambassador = D.ambassadorById(payout.ambassador);
    const related = state.orders.filter((order) => order.ambassador === payout.ambassador).slice(0, 4);
    openDrawer(`<div class="drawer-head">
      <span class="drawer-thumb">${icon("wallet")}</span>
      <div><h2>${payout.id}</h2><p>${ambassador ? escapeHtml(ambassador.name) : "Ambassador"} · ${formatDate(payout.date)}</p>${statusBadge(payout.status)}</div>
      <button type="button" class="drawer-close" data-action="close-drawer" aria-label="Close payout panel">${icon("close")}</button>
    </div>
    <div class="drawer-section"><div class="payout-amount"><span>Payout amount</span><strong>${money(payout.amount)}</strong><small>${payout.period}</small></div></div>
    <div class="drawer-section"><div class="detail-grid">
      <div><span>Method</span><strong style="font-size:13px">${payout.method}</strong></div>
      <div><span>Scheduled</span><strong style="font-size:13px">${formatDate(payout.date)}</strong></div>
      <div><span>Status</span><strong style="font-size:13px;text-transform:capitalize">${payout.status}</strong></div>
      <div><span>Reference</span><strong class="mono" style="font-size:11px">${payout.id.toLowerCase()}</strong></div>
    </div></div>
    <div class="drawer-section"><h3>Commission sources</h3>
      ${related.length ? related.map((order) => `<div class="link-row">${icon("receipt")}<div class="list-main"><strong>${order.id}</strong><small>${formatDate(order.date)}</small></div><span>${money(order.commission)}</span></div>`).join("") : '<p style="margin:0;color:var(--faint);font-size:12px">No linked orders in this sample.</p>'}
    </div>
    <div class="drawer-section" style="display:flex;gap:8px;flex-wrap:wrap">
      ${payout.status !== "paid" ? `<button type="button" class="btn btn-primary" data-action="payout-mark-paid" data-id="${payout.id}">Mark paid</button>` : ""}
      <button type="button" class="btn" data-action="close-drawer">Close</button>
    </div>`);
  }
  function openProductModal() {
    const state = D.getState();
    const artMap = [...new Map(state.products.map((product) => [product.art, product.name])).entries()];
    openModal({
      title: "Add product",
      sub: "Create a sample product for the demo catalog.",
      submitLabel: "Create product",
      body: `<div class="form-grid two">
        <div class="field" style="grid-column:1/-1"><label for="np-name">Product name</label><input class="input" id="np-name" name="name" placeholder="e.g. Alpine Field Notebook" required></div>
        <div class="field"><label for="np-category">Category</label><select class="select" id="np-category" name="category" required>${["Packs", "Drinkware", "Camp", "Apparel", "Accessories"].map((category) => `<option>${category}</option>`).join("")}</select></div>
        <div class="field"><label for="np-price">Price (USD)</label><input class="input" id="np-price" name="price" type="number" min="1" step="1" value="48" required></div>
        <div class="field"><label for="np-stock">Opening stock</label><input class="input" id="np-stock" name="stock" type="number" min="0" step="1" value="60" required></div>
        <div class="field"><label for="np-commission">Commission %</label><input class="input" id="np-commission" name="commission" type="number" min="0" max="40" step="1" value="12" required></div>
        <div class="field" style="grid-column:1/-1"><label for="np-art">Product image</label><select class="select" id="np-art" name="art">${artMap.map(([art, name]) => `<option value="${art}">${escapeHtml(name)}</option>`).join("")}</select><span class="field-hint">Demo art is shared across products. Sample data only.</span></div>
        <div class="field" style="grid-column:1/-1"><label for="np-description">Description</label><textarea class="textarea" id="np-description" name="description" rows="3" placeholder="What makes it useful?">Field-tested gear for long weekends outside.</textarea></div>
      </div>`,
      onSubmit: (fd) => {
        const product = {
          id: `p-${Date.now()}`,
          name: String(fd.get("name")).trim(),
          category: String(fd.get("category")),
          price: Number(fd.get("price")),
          stock: Number(fd.get("stock")),
          sold: 0,
          commission: Number(fd.get("commission")),
          status: "active",
          art: String(fd.get("art")),
          description: String(fd.get("description") || "New sample product.")
        };
        state.products.unshift(product);
        state.activity.unshift({ icon: "box", text: `${product.name} added to the catalog`, time: "just now" });
        D.saveState();
        toast(`${product.name} created.`);
        renderPage();
      }
    });
  }

  function openInviteModal() {
    openModal({
      title: "Invite an ambassador",
      sub: "Add a sample creator to the program. No email will be sent.",
      submitLabel: "Send invitation",
      body: `<div class="form-grid two">
        <div class="field"><label for="ia-name">Full name</label><input class="input" id="ia-name" name="name" placeholder="Jordan Lee" required></div>
        <div class="field"><label for="ia-email">Email</label><input class="input" id="ia-email" name="email" type="email" placeholder="jordan@example.com" required></div>
        <div class="field"><label for="ia-handle">Social handle</label><input class="input" id="ia-handle" name="handle" placeholder="@jordanoutside" required></div>
        <div class="field"><label for="ia-audience">Audience</label><input class="input" id="ia-audience" name="audience" placeholder="Weekend hikers" required></div>
        <div class="field"><label for="ia-tier">Starting tier</label><select class="select" id="ia-tier" name="tier">${["Rising", "Pro", "Elite"].map((tier) => `<option ${tier === "Rising" ? "selected" : ""}>${tier}</option>`).join("")}</select></div>
        <div class="field"><label for="ia-rate">Commission %</label><input class="input" id="ia-rate" name="rate" type="number" min="5" max="30" step="1" value="10" required></div>
      </div>`,
      onSubmit: (fd) => {
        const state = D.getState();
        const name = String(fd.get("name")).trim();
        const colors = ["#67e8c7", "#f4b860", "#8bc5ff", "#d3a6ff", "#ff9b85", "#f5d76e"];
        const ambassador = {
          id: `a-${Date.now()}`,
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `creator-${Date.now()}`,
          handle: String(fd.get("handle")).trim().startsWith("@") ? String(fd.get("handle")).trim() : `@${String(fd.get("handle")).trim()}`,
          email: String(fd.get("email")).trim(),
          audience: String(fd.get("audience")).trim(),
          tier: String(fd.get("tier")),
          rate: Number(fd.get("rate")),
          status: "active",
          clicks: 0,
          orders: 0,
          revenue: 0,
          country: "United States",
          joined: D.TODAY,
          color: colors[state.ambassadors.length % colors.length]
        };
        state.ambassadors.unshift(ambassador);
        state.activity.unshift({ icon: "users", text: `${ambassador.name} invited to the program`, time: "just now" });
        D.saveState();
        toast(`Invitation ready for ${ambassador.name}.`);
        renderPage();
      }
    });
  }

  function openLinkModal() {
    const state = D.getState();
    const ambassadors = state.ambassadors.filter((ambassador) => ambassador.status === "active");
    const products = state.products.filter((product) => product.status === "active");
    if (!ambassadors.length || !products.length) {
      toast("Add an active ambassador and product first.", "error");
      return;
    }
    openModal({
      title: "Create a tracking link",
      sub: "Generate a shareable referral link for an ambassador.",
      submitLabel: "Create link",
      body: `<div class="form-grid two">
        <div class="field"><label for="nl-amb">Ambassador</label><select class="select" id="nl-amb" name="ambassador">${ambassadors.map((ambassador) => `<option value="${ambassador.id}">${escapeHtml(ambassador.name)}</option>`).join("")}</select></div>
        <div class="field"><label for="nl-product">Product</label><select class="select" id="nl-product" name="product">${products.map((product) => `<option value="${product.id}">${escapeHtml(product.name)} · ${money(product.price)}</option>`).join("")}</select></div>
        <div class="field" style="grid-column:1/-1"><label for="nl-campaign">Campaign name</label><input class="input" id="nl-campaign" name="campaign" placeholder="Holiday gift guide" required></div>
      </div>`,
      onSubmit: (fd) => {
        const ambassador = D.ambassadorById(String(fd.get("ambassador")));
        const product = D.productById(String(fd.get("product")));
        if (!ambassador || !product) return false;
        const base = `${ambassador.slug}-${product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 22)}`;
        let slug = base;
        let suffix = 1;
        while (state.links.some((link) => link.slug === slug)) { slug = `${base}-${suffix++}`; }
        state.links.unshift({
          id: `l-${Date.now()}`,
          slug,
          ambassador: ambassador.id,
          product: product.id,
          campaign: String(fd.get("campaign")).trim(),
          clicks: 0,
          conversions: 0,
          revenue: 0,
          status: "active",
          created: D.TODAY
        });
        D.saveState();
        toast("Tracking link created.");
        renderPage();
      }
    });
  }

  function openPayoutModal() {
    const state = D.getState();
    const pending = state.payouts.filter((payout) => payout.status === "pending" || payout.status === "scheduled");
    if (!pending.length) {
      toast("No payouts are waiting.", "error");
      return;
    }
    const total = pending.reduce((sum, payout) => sum + payout.amount, 0);
    openModal({
      title: "Run payouts",
      sub: "Approve the pending balance for this demo period.",
      submitLabel: "Approve & send",
      body: `<div class="info-box">${icon("wallet")}<div><strong>${pending.length} payout${pending.length === 1 ? "" : "s"} · ${money(total)}</strong><br>Stripe Connect is simulated. No money moves and no card is charged.</div></div>
        <div class="payout-list">${pending.map((payout) => {
          const ambassador = D.ambassadorById(payout.ambassador);
          return `<div class="link-row"><span class="avatar-sm" style="background:${ambassador ? ambassador.color : "#333"}">${ambassador ? initials(ambassador.name) : "?"}</span><div class="list-main"><strong>${ambassador ? escapeHtml(ambassador.name) : "Ambassador"}</strong><small>${payout.period}</small></div><strong>${money(payout.amount)}</strong></div>`;
        }).join("")}</div>`,
      onSubmit: () => {
        pending.forEach((payout) => { payout.status = "processing"; });
        D.saveState();
        renderPage();
        toast("Payouts queued. This is a simulation.");
        setTimeout(() => {
          const latest = D.getState();
          latest.payouts.filter((payout) => payout.status === "processing").forEach((payout) => { payout.status = "paid"; });
          D.saveState();
          if (pageId === "payouts") renderPage();
          toast("Payouts marked paid in the demo.");
        }, 1600);
      }
    });
  }

  function openTeamModal() {
    openModal({
      title: "Invite a teammate",
      sub: "Add a sample operator to the workspace.",
      submitLabel: "Add teammate",
      body: `<div class="form-grid two">
        <div class="field"><label for="tm-name">Name</label><input class="input" id="tm-name" name="name" placeholder="Sam Rivera" required></div>
        <div class="field"><label for="tm-email">Email</label><input class="input" id="tm-email" name="email" type="email" placeholder="sam@example.com" required></div>
        <div class="field" style="grid-column:1/-1"><label for="tm-role">Role</label><select class="select" id="tm-role" name="role">${["Admin", "Analyst", "Support"].map((role) => `<option>${role}</option>`).join("")}</select></div>
      </div>`,
      onSubmit: (fd) => {
        const state = D.getState();
        state.team.push({
          id: `t-${Date.now()}`,
          name: String(fd.get("name")).trim(),
          email: String(fd.get("email")).trim(),
          role: String(fd.get("role")),
          color: "#8bc5ff"
        });
        D.saveState();
        toast("Teammate added to the demo workspace.");
        ui.settingsTab = "team";
        renderPage();
      }
    });
  }

  function confirmRefund(id) {
    const state = D.getState();
    const order = state.orders.find((item) => item.id === id);
    if (!order) return;
    openModal({
      title: `Refund ${order.id}?`,
      sub: "The commission is reversed in this demo.",
      submitLabel: "Refund order",
      danger: true,
      body: `<div class="info-box warn">${icon("alert")}<div>Refunding ${money(order.total)} will reverse the ${money(order.commission)} ambassador commission and remove the order from commission totals.</div></div>`,
      onSubmit: () => {
        order.status = "refunded";
        order.commission = 0;
        D.saveState();
        closeDrawer();
        renderPage();
        toast(`${order.id} refunded.`);
      }
    });
  }

  function confirmReset() {
    openModal({
      title: "Reset demo data?",
      sub: "Restore the original sample workspace.",
      submitLabel: "Reset demo",
      danger: true,
      body: `<div class="info-box warn">${icon("alert")}<div>Products, ambassadors, links, orders, payouts, and settings return to their original sample values. Your cart is cleared too.</div></div>`,
      onSubmit: () => {
        D.resetState();
        ui.cart = {};
        saveCart();
        updateCartBadges();
        if (document.querySelector(".app-shell")) renderShell();
        toast("Sample data reset.");
      }
    });
  }

  function confirmClear() {
    openModal({
      title: "Clear local demo data?",
      sub: "Remove the saved sample workspace from this browser.",
      submitLabel: "Clear and reload",
      danger: true,
      body: `<div class="info-box warn">${icon("alert")}<div>This removes local storage keys used by the demo, then reloads the page. The repository and Go services are untouched.</div></div>`,
      onSubmit: () => {
        try {
          localStorage.removeItem("ambassador-demo-v2");
          localStorage.removeItem(CART_KEY);
        } catch (error) { /* optional */ }
        window.location.reload();
      }
    });
  }

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch (error) { /* optional */ }
    const button = document.querySelector('[data-action="theme"]');
    if (button) button.innerHTML = icon(next === "light" ? "moon" : "sun");
  }

  function cartLines() {
    return Object.entries(ui.cart)
      .map(([id, quantity]) => ({ product: D.productById(id), quantity: Number(quantity) }))
      .filter((line) => line.product && line.quantity > 0);
  }

  function cartCount() {
    return cartLines().reduce((total, line) => total + line.quantity, 0);
  }

  function cartTotal() {
    return cartLines().reduce((total, line) => total + line.product.price * line.quantity, 0);
  }

  function updateCartBadges() {
    const count = cartCount();
    document.querySelectorAll("[data-cart-count]").forEach((node) => { node.textContent = count; });
  }

  function addToCart(id, options = {}) {
    const product = D.productById(id);
    if (!product) return;
    ui.cart[id] = (ui.cart[id] || 0) + 1;
    saveCart();
    updateCartBadges();
    toast(`${product.name} added to cart.`);
    if (options.open !== false) openCartDrawer();
  }

  function openCartDrawer() {
    const state = D.getState();
    const lines = cartLines();
    const total = cartTotal();
    const shipping = total > 0 && total < 90 ? 8 : 0;
    const refSlug = new URLSearchParams(window.location.search).get("ref") || "maya";
    const ref = D.ambassadorBySlug(refSlug) || state.ambassadors[0];
    const commission = Math.round(total * ref.rate) / 100;
    openDrawer(`<div class="drawer-head">
      <span class="drawer-thumb">${icon("bag")}</span>
      <div><h2>Your cart</h2><p>${lines.length ? `${cartCount()} item${cartCount() === 1 ? "" : "s"} · ${money(total)}` : "Nothing here yet"}</p></div>
      <button type="button" class="drawer-close" data-action="close-drawer" aria-label="Close cart">${icon("close")}</button>
    </div>
    ${lines.length ? `<div class="drawer-section">
      ${lines.map(({ product, quantity }) => `<div class="cart-line"><img src="../assets/products/${product.art}" alt=""><div class="list-main"><strong>${escapeHtml(product.name)}</strong><small>${money(product.price)}</small><div class="cart-stepper"><button type="button" data-action="cart-dec" data-id="${product.id}" aria-label="Decrease quantity">−</button><span>${quantity}</span><button type="button" data-action="cart-inc" data-id="${product.id}" aria-label="Increase quantity">+</button></div></div><div style="text-align:right"><strong>${money(product.price * quantity)}</strong><br><button type="button" class="text-button" data-action="cart-remove" data-id="${product.id}" style="margin-top:6px">Remove</button></div></div>`).join("")}
    </div>
    <div class="drawer-section"><div class="cart-summary">
      <div><span>Subtotal</span><strong>${money(total)}</strong></div>
      <div><span>Shipping</span><strong>${shipping ? money(shipping) : "Free"}</strong></div>
      <div class="cart-total"><span>Total</span><strong>${money(total + shipping)}</strong></div>
    </div></div>
    <div class="drawer-section"><div class="split-box"><div><span>${escapeHtml(ref.name.split(" ")[0])} earns</span><strong>${money(commission)}</strong></div><div><span>Attribution</span><strong>${ref.rate}%</strong></div><p>Commission is calculated on the product subtotal. This demo does not process payments.</p></div></div>
    <div class="drawer-section"><button type="button" class="btn btn-primary" data-action="checkout" style="width:100%">Checkout · ${money(total + shipping)}</button><p style="margin:10px 0 0;color:var(--faint);font-size:10.5px;text-align:center">Safe simulation. No card is collected and no order is sent to a server.</p></div>` : `<div class="drawer-section"><div class="empty-state">${icon("bag")}<h3>Your cart is empty</h3><p>Add a product from the sample storefront.</p><button type="button" class="btn" data-action="close-drawer">Keep shopping</button></div></div>`}`);
  }

  function placeOrder() {
    const lines = cartLines();
    if (!lines.length) {
      toast("Your cart is empty.", "error");
      return;
    }
    const state = D.getState();
    const refSlug = new URLSearchParams(window.location.search).get("ref") || "maya";
    const ref = D.ambassadorBySlug(refSlug) || state.ambassadors[0];
    const total = cartTotal();
    const commission = Math.round(total * ref.rate) / 100;
    const baseId = 10508 + state.orders.length;
    const newOrders = lines.map(({ product, quantity }, index) => ({
      id: `NS-${baseId + index}`,
      date: new Date().toISOString(),
      customer: "Guest checkout",
      product: product.id,
      ambassador: ref.id,
      quantity,
      total: product.price * quantity,
      commission: Math.round(product.price * quantity * ref.rate) / 100,
      status: "paid"
    }));
    state.orders = [...newOrders, ...state.orders];
    const target = state.ambassadors.find((ambassador) => ambassador.id === ref.id);
    if (target) {
      target.revenue += total;
      target.orders += cartCount();
    }
    lines.forEach(({ product, quantity }) => {
      const item = state.products.find((entry) => entry.id === product.id);
      if (item) {
        item.stock = Math.max(0, item.stock - quantity);
        item.sold += quantity;
      }
    });
    state.activity.unshift({ icon: "receipt", text: `${newOrders.length} storefront order${newOrders.length === 1 ? "" : "s"} placed · ${money(total)}`, time: "just now" });
    D.saveState();
    ui.cart = {};
    saveCart();
    updateCartBadges();
    closeDrawer();
    if (document.getElementById("page")) renderPage();
    openModal({
      title: "Order placed",
      sub: "A safe simulation — no card was charged.",
      submitLabel: "Continue shopping",
      cancelLabel: "Close",
      body: `<div class="success-panel">${icon("check")}<h3>${newOrders.length} order${newOrders.length === 1 ? "" : "s"} recorded</h3><p>${money(total)} total · ${money(commission)} attributed to ${escapeHtml(ref.name.split(" ")[0])} at ${ref.rate}%.</p><p class="note">The order now appears in the demo dashboard and orders table. Nothing was sent to a server.</p></div>`,
      onSubmit: () => { toast("Sample order added to the dashboard."); }
    });
  }

  function openStoreProduct(id) {
    const product = D.productById(id);
    if (!product) return;
    openModal({
      title: escapeHtml(product.name),
      sub: `${product.category} · ${money(product.price)}`,
      submitLabel: "Add to cart",
      cancelLabel: "Keep browsing",
      body: `<div class="store-modal-art"><img src="../assets/products/${product.art}" alt="${escapeHtml(product.name)}"></div><p style="margin:0;color:var(--muted);font-size:12.5px;line-height:1.7">${escapeHtml(product.description)}</p><div class="info-box" style="margin-top:14px">${icon("spark")}<div>${product.commission}% commission is modeled for the referring ambassador on this sample product.</div></div>`,
      onSubmit: () => { addToCart(product.id); }
    });
  }

  function commandPaletteItems() {
    const items = D.PAGES.map((page) => ({
      icon: page.icon,
      label: page.label,
      hint: "Go to page",
      keywords: `${page.label} ${page.group}`,
      run: () => { window.location.href = page.file; }
    }));
    items.push(
      { icon: "plus", label: "New product", hint: "Create", keywords: "add catalog product", run: openProductModal },
      { icon: "users", label: "Invite ambassador", hint: "Create", keywords: "recruit creator people", run: openInviteModal },
      { icon: "link", label: "Create tracking link", hint: "Create", keywords: "referral campaign attribution", run: openLinkModal },
      { icon: "wallet", label: "Run payouts", hint: "Action", keywords: "pay commission batch connect", run: openPayoutModal },
      { icon: "sun", label: "Toggle theme", hint: "Appearance", keywords: "dark light mode", run: toggleTheme },
      { icon: "reset", label: "Reset demo data", hint: "Danger", keywords: "restore sample workspace", run: confirmReset }
    );
    return items;
  }

  function filterCommands(query) {
    const needle = String(query || "").trim().toLowerCase();
    if (!needle) return commandPaletteItems();
    return commandPaletteItems().filter((item) => item.keywords.toLowerCase().includes(needle) || item.label.toLowerCase().includes(needle));
  }

  function renderCommandList(query) {
    const list = document.getElementById("command-list");
    if (!list) return;
    commandItems = filterCommands(query);
    if (commandSelection >= commandItems.length) commandSelection = 0;
    if (!commandItems.length) {
      list.innerHTML = '<p style="padding:10px;color:var(--faint);font-size:12px;margin:0">No pages or actions match that search.</p>';
      return;
    }
    list.innerHTML = commandItems.map((item, index) => `<button type="button" class="command-item" role="option" data-command-index="${index}" aria-selected="${index === commandSelection}">${icon(item.icon)}<span>${escapeHtml(item.label)}</span><small>${escapeHtml(item.hint)}</small></button>`).join("");
  }

  function openCommand() {
    commandSelection = 0;
    openModal({
      title: "Search the demo",
      sub: "Jump to a page or run an action.",
      submitLabel: "Open",
      body: `<div class="field"><input class="input" id="command-input" name="query" type="search" placeholder="Try “orders”, “invite”, or “payout”…" autocomplete="off" aria-label="Search pages and actions"></div><div class="command-list" id="command-list" role="listbox" aria-label="Results"></div>`,
      onSubmit: () => {
        const items = filterCommands(document.getElementById("command-input") ? document.getElementById("command-input").value : "");
        const item = items[commandSelection];
        if (!item) return false;
        closeModal();
        item.run();
        return false;
      }
    });
    renderCommandList("");
  }

  function moveCommand(delta) {
    const input = document.getElementById("command-input");
    if (!input) return;
    const items = filterCommands(input.value);
    commandItems = items;
    if (!items.length) return;
    commandSelection = (commandSelection + delta + items.length) % items.length;
    renderCommandList(input.value);
    const selected = document.querySelector(`[data-command-index="${commandSelection}"]`);
    if (selected) selected.scrollIntoView({ block: "nearest" });
    input.focus();
  }

  function adjustCart(id, delta) {
    const product = D.productById(id);
    if (!product) return;
    const current = Number(ui.cart[id] || 0);
    const next = delta === -Infinity ? 0 : Math.max(0, Math.min(99, current + delta));
    if (next === 0) delete ui.cart[id];
    else ui.cart[id] = next;
    saveCart();
    updateCartBadges();
    openCartDrawer();
    if (delta === -Infinity) toast(`${product.name} removed from cart.`);
  }

  function handleAction(action, element) {
    const id = element.dataset.id;
    const state = D.getState();
    switch (action) {
      case "toggle-nav":
        document.body.classList.toggle("nav-open");
        break;
      case "close-drawer":
        closeDrawer();
        break;
      case "close-modal":
        closeModal();
        break;
      case "theme":
        toggleTheme();
        break;
      case "command":
        openCommand();
        break;
      case "range": {
        const key = element.dataset.target === "analytics" ? "analyticsRange" : "range";
        ui[key] = Number(element.dataset.range) || 30;
        renderPage();
        break;
      }
      case "export-report":
        exportReport();
        break;
      case "export-orders":
        exportOrders();
        break;
      case "export-analytics":
        exportAnalytics();
        break;
      case "export-ambassadors":
        exportAmbassadors();
        break;
      case "product-view":
        ui.productView = element.dataset.view === "table" ? "table" : "grid";
        renderPage();
        break;
      case "product-open":
        openProductDrawer(id);
        break;
      case "product-new":
        openProductModal();
        break;
      case "amb-invite":
        openInviteModal();
        break;
      case "amb-tier":
        ui.ambTier = element.dataset.tier || "all";
        renderPage();
        break;
      case "amb-open":
        openAmbassadorDrawer(id);
        break;
      case "amb-email": {
        const ambassador = D.ambassadorById(id);
        toast(`Message drafted for ${ambassador ? ambassador.name : "this ambassador"}. Email is simulated.`);
        break;
      }
      case "toggle-amb": {
        const ambassador = D.ambassadorById(id);
        if (!ambassador) break;
        ambassador.status = ambassador.status === "active" ? "paused" : "active";
        D.saveState();
        openAmbassadorDrawer(id);
        renderPage();
        toast(`${ambassador.name} ${ambassador.status === "active" ? "reactivated" : "paused"}.`);
        break;
      }
      case "link-new":
        openLinkModal();
        break;
      case "link-copy":
        copyText(`https://northstar.supply/s/${element.dataset.slug || ""}`, "Tracking link copied.");
        break;
      case "link-toggle": {
        const link = state.links.find((item) => item.id === id);
        if (!link) break;
        link.status = link.status === "active" ? "paused" : "active";
        D.saveState();
        renderPage();
        toast(`Link ${link.status === "active" ? "resumed" : "paused"}.`);
        break;
      }
      case "order-status":
        ui.orderStatus = element.dataset.status || "all";
        renderPage();
        break;
      case "order-open":
        openOrderDrawer(id);
        break;
      case "order-fulfill": {
        const order = state.orders.find((item) => item.id === id);
        if (!order) break;
        order.status = "fulfilled";
        D.saveState();
        closeDrawer();
        renderPage();
        toast(`${order.id} marked fulfilled.`);
        break;
      }
      case "order-refund":
        confirmRefund(id);
        break;
      case "payout-run":
        openPayoutModal();
        break;
      case "payout-open":
        openPayoutDrawer(id);
        break;
      case "payout-mark-paid": {
        const payout = state.payouts.find((item) => item.id === id);
        if (!payout) break;
        payout.status = "paid";
        D.saveState();
        closeDrawer();
        renderPage();
        toast(`${payout.id} marked paid in the demo.`);
        break;
      }
      case "settings-tab":
        ui.settingsTab = element.dataset.tab || "workspace";
        renderPage();
        break;
      case "integration":
        toast(`${element.dataset.name || "This integration"} runs for real in the Go services. The panel is simulated.`);
        break;
      case "team-invite":
        openTeamModal();
        break;
      case "cart-open":
        openCartDrawer();
        break;
      case "cart-inc":
        adjustCart(id, 1);
        break;
      case "cart-dec":
        adjustCart(id, -1);
        break;
      case "cart-remove":
        adjustCart(id, -Infinity);
        break;
      case "checkout":
        placeOrder();
        break;
      case "add-to-cart":
        addToCart(id);
        break;
      case "store-view":
        openStoreProduct(id);
        break;
      case "reset-demo":
        confirmReset();
        break;
      case "clear-demo":
        confirmClear();
        break;
      default:
        break;
    }
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const command = event.target.closest("[data-command-index]");
      if (command) {
        const item = commandItems[Number(command.dataset.commandIndex)];
        closeModal();
        if (item) item.run();
        return;
      }
      if (event.target.closest("#scrim")) {
        closeDrawer();
        return;
      }
      if (event.target.classList && event.target.classList.contains("modal-root")) {
        closeModal();
        return;
      }
      const trigger = event.target.closest("[data-action]");
      if (!trigger) return;
      event.preventDefault();
      handleAction(trigger.dataset.action, trigger);
    });

    document.addEventListener("submit", (event) => {
      const form = event.target;
      if (form.id === "modal-form") {
        event.preventDefault();
        if (!activeModalSubmit) {
          closeModal();
          return;
        }
        let result = true;
        try {
          result = activeModalSubmit(new FormData(form));
        } catch (error) {
          console.error(error);
          toast("The demo hit an unexpected error.", "error");
          return;
        }
        if (result !== false) closeModal();
        return;
      }

      if (form.matches('[data-form="product-edit"]')) {
        event.preventDefault();
        const product = D.productById(form.dataset.id);
        if (!product) return;
        const data = new FormData(form);
        product.price = Math.max(0, Number(data.get("price")) || 0);
        product.stock = Math.max(0, Number(data.get("stock")) || 0);
        product.commission = Math.min(40, Math.max(0, Number(data.get("commission")) || 0));
        product.status = data.get("status") === "draft" ? "draft" : "active";
        D.saveState();
        toast(`${product.name} updated.`);
        openProductDrawer(product.id);
        renderPage();
        return;
      }

      if (form.matches('[data-form="settings-workspace"]')) {
        event.preventDefault();
        const data = new FormData(form);
        const state = D.getState();
        state.settings.storeName = String(data.get("storeName") || "").trim() || state.settings.storeName;
        state.settings.domain = String(data.get("domain") || "").trim() || state.settings.domain;
        state.settings.currency = String(data.get("currency") || state.settings.currency);
        state.settings.timezone = String(data.get("timezone") || state.settings.timezone);
        D.saveState();
        renderShell();
        toast("Workspace settings saved in this browser.");
        return;
      }

      if (form.matches('[data-form="settings-program"]')) {
        event.preventDefault();
        const data = new FormData(form);
        const state = D.getState();
        state.settings.commissionRate = Number(data.get("commissionRate")) || state.settings.commissionRate;
        state.settings.cookieWindow = String(data.get("cookieWindow") || state.settings.cookieWindow);
        state.settings.attribution = String(data.get("attribution") || state.settings.attribution);
        state.settings.minPayout = Math.max(0, Number(data.get("minPayout")) || 0);
        state.settings.payoutDay = String(data.get("payoutDay") || "Monthly · 1st");
        state.settings.autoApprove = data.get("autoApprove") === "on";
        state.settings.fraudReview = data.get("fraudReview") === "on";
        state.settings.emailUpdates = data.get("emailUpdates") === "on";
        D.saveState();
        renderPage();
        toast("Program settings saved in this browser.");
        return;
      }
    });

    const searchKeys = {
      "product-search": "productQuery",
      "amb-search": "ambQuery",
      "link-search": "linkQuery",
      "order-search": "orderQuery"
    };

    document.addEventListener("input", (event) => {
      const target = event.target;
      if (target.id === "command-input") {
        commandSelection = 0;
        renderCommandList(target.value);
        return;
      }
      const key = searchKeys[target.id];
      if (!key) return;
      const value = target.value;
      const position = target.selectionStart;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        ui[key] = value;
        pendingFocus = { selector: `#${target.id}`, position };
        renderPage();
      }, 170);
    });

    document.addEventListener("change", (event) => {
      const target = event.target;
      if (target.id === "product-category") {
        ui.productCategory = target.value;
        renderPage();
        return;
      }
      if (target.id === "product-status") {
        ui.productStatus = target.value;
        renderPage();
        return;
      }
      if (target.matches("[data-team-role]")) {
        const state = D.getState();
        const member = state.team.find((person) => person.id === target.dataset.teamRole);
        if (!member) return;
        member.role = target.value;
        D.saveState();
        toast(`${member.name} is now ${member.role.toLowerCase()} in this demo.`);
      }
    });

    document.addEventListener("keydown", (event) => {
      const key = event.key;
      const commandOpen = Boolean(document.getElementById("command-input"));
      if ((event.metaKey || event.ctrlKey) && key.toLowerCase() === "k") {
        event.preventDefault();
        if (commandOpen) closeModal();
        else openCommand();
        return;
      }
      if (key === "Escape") {
        if (commandOpen) {
          closeModal();
          return;
        }
        const modalOpen = document.getElementById("modal-root") && document.getElementById("modal-root").classList.contains("open");
        if (modalOpen) {
          closeModal();
          return;
        }
        const drawerOpen = document.getElementById("drawer") && document.getElementById("drawer").classList.contains("open");
        if (drawerOpen) {
          closeDrawer();
          return;
        }
        document.body.classList.remove("nav-open");
        return;
      }
      if (commandOpen && (key === "ArrowDown" || key === "ArrowUp")) {
        event.preventDefault();
        moveCommand(key === "ArrowDown" ? 1 : -1);
        return;
      }
      if ((key === "Enter" || key === " ") && event.target.matches && event.target.matches("[data-clickable][data-action]") && event.target.tagName !== "BUTTON") {
        event.preventDefault();
        handleAction(event.target.dataset.action, event.target);
      }
    });
  }

  function init() {
    applyTheme();
    ensureOverlays();
    const app = document.getElementById("app");
    if (pageId === "storefront") {
      document.body.classList.add("store-body");
      if (app) app.innerHTML = P.renderStorefront(ui);
      updateCartBadges();
      return;
    }
    if (pageId === "hub") {
      if (app) app.innerHTML = P.renderHub();
      return;
    }
    renderShell();
    updateCartBadges();
  }

  bindEvents();
  init();
})();
