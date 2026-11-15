(() => {
  "use strict";
  const D = window.AmbassadorData;
  const U = window.AmbassadorUI;
  const { icon, money, number, percent, initials, escapeHtml, statusBadge, productStatus, productById, ambassadorById, formatDate } = D;

  function renderDashboard(ui) {
    const state = D.getState();
    const m = D.metrics(ui.range);
    const top = [...state.ambassadors].sort((a, b) => b.revenue - a.revenue).slice(0, 4);
    const recent = [...state.orders].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    const goal = 180000;
    const goalProgress = Math.min(100, m.revenue / goal * 100);
    const channels = [
      { label: "Ambassador links", value: 46, color: "#7ee2b8" },
      { label: "Direct", value: 28, color: "#f0b35b" },
      { label: "Email", value: 15, color: "#8ab4f8" },
      { label: "Paid social", value: 11, color: "#c3b1f7" }
    ];

    return `${U.pageHead("Overview", `Good morning, ${escapeHtml(state.team[0].name.split(" ")[0])}.`, "Here is how Northstar's ambassador program is performing.", `${U.rangeControl("dashboard", ui.range)}<button type="button" class="btn" data-action="export-report">${icon("download")} Export</button>`)}
      <div class="kpi-grid">
        ${U.kpiCard("Attributed GMV", money(m.revenue), m.revenueDelta, `vs previous ${ui.range} days`, "wallet", "rgba(126,226,184,.09)")}
        ${U.kpiCard("Attributed orders", number(m.orders), m.ordersDelta, `vs previous ${ui.range} days`, "receipt", "rgba(240,179,91,.08)")}
        ${U.kpiCard("Link conversion", percent(m.conversion), m.conversionDelta, `${number(m.clicks)} clicks`, "chart", "rgba(138,180,248,.08)")}
        ${U.kpiCard("Commission earned", money(m.commission), m.commissionDelta, `avg. order ${money(m.aov)}`, "users", "rgba(195,177,247,.08)")}
      </div>
      <div class="grid-2">
        <section class="panel" aria-labelledby="revenue-title">
          <div class="panel-head">
            <div><h2 class="panel-title" id="revenue-title">Revenue from ambassador links</h2><p class="panel-sub">Daily attributed GMV and commission across the selected range.</p></div>
            <div class="chart-legend"><span><i class="legend-dot"></i> GMV</span><span><i class="legend-dot amber"></i> Commission</span></div>
          </div>
          <div class="panel-body">${U.revenueChart(state.series.slice(-ui.range), ui.range)}</div>
        </section>
        <section class="panel" aria-labelledby="channel-title">
          <div class="panel-head"><div><h2 class="panel-title" id="channel-title">Channel mix</h2><p class="panel-sub">Where attributed revenue comes from.</p></div></div>
          <div class="panel-body">${U.donutChart(channels, "46%", "Ambassador")}</div>
        </section>
      </div>
      <div class="grid-2 equal">
        <section class="panel" aria-labelledby="top-amb-title">
          <div class="panel-head"><div><h2 class="panel-title" id="top-amb-title">Top ambassadors</h2><p class="panel-sub">Ranked by 30-day attributed revenue.</p></div><a class="btn btn-sm btn-ghost" href="ambassadors.html">View all</a></div>
          <div class="panel-body"><div class="list">
            ${top.map((ambassador, index) => `<a class="list-row" href="ambassadors.html">
              <span class="avatar-sm" style="background:${ambassador.color}">${initials(ambassador.name)}</span>
              <span class="list-main"><strong>${ambassador.name}</strong><small>${ambassador.handle} · ${ambassador.tier}</small></span>
              <span class="list-value">${money(ambassador.revenue, true)}<small>${number(ambassador.orders)} orders</small></span>
              <span class="amb-rank">#${index + 1}</span>
            </a>`).join("")}
          </div></div>
        </section>
        <section class="panel" aria-labelledby="recent-orders-title">
          <div class="panel-head"><div><h2 class="panel-title" id="recent-orders-title">Recent orders</h2><p class="panel-sub">The latest attributed checkouts.</p></div><a class="btn btn-sm btn-ghost" href="orders.html">View all</a></div>
          <div class="panel-body"><div class="list">
            ${recent.map((order) => {
              const product = productById(order.product);
              const ambassador = ambassadorById(order.ambassador);
              return `<a class="list-row" href="orders.html">
                <img src="../assets/products/${product.art}" alt="" width="28" height="28" style="width:28px;height:28px;border-radius:7px;object-fit:cover;border:1px solid var(--line)">
                <span class="list-main"><strong>${product.name}</strong><small>${order.customer} · via ${ambassador.name.split(" ")[0]}</small></span>
                <span class="list-value">${money(order.total)}<small>${statusBadge(order.status)}</small></span>
              </a>`;
            }).join("")}
          </div></div>
        </section>
      </div>
      <div class="grid-2 equal" style="margin-top:16px">
        <section class="panel" aria-labelledby="activity-title">
          <div class="panel-head"><div><h2 class="panel-title" id="activity-title">Activity</h2><p class="panel-sub">A live-feeling feed from the demo workspace.</p></div></div>
          <div class="panel-body"><div class="list">
            ${state.activity.slice(0, 5).map((item) => `<div class="list-row">
              <span class="avatar-sm" style="background:var(--panel-3);color:var(--mint)">${icon(item.icon)}</span>
              <span class="list-main"><strong>${item.text}</strong><small>${item.time}</small></span>
            </div>`).join("")}
          </div></div>
        </section>
        <section class="panel" aria-labelledby="health-title">
          <div class="panel-head"><div><h2 class="panel-title" id="health-title">Program health</h2><p class="panel-sub">Monthly goal and operating settings.</p></div><a class="btn btn-sm btn-ghost" href="settings.html">Settings</a></div>
          <div class="panel-body">
            <div style="display:grid;gap:12px">
              <div>
                <div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--muted);margin-bottom:5px"><span>Monthly GMV goal</span><strong style="color:var(--ink-soft)">${money(m.revenue, true)} / ${money(goal, true)}</strong></div>
                <div class="stock-line"><i style="width:${goalProgress}%"></i></div>
              </div>
              <div class="detail-grid">
                <div><small>Commission rate</small><strong>${state.settings.commissionRate}%</strong></div>
                <div><small>Cookie window</small><strong>${state.settings.cookieWindow}</strong></div>
                <div><small>Attribution</small><strong>${state.settings.attribution}</strong></div>
                <div><small>Auto-approve</small><strong>${state.settings.autoApprove ? "On" : "Off"}</strong></div>
              </div>
            </div>
          </div>
        </section>
      </div>`;
  }

  function renderProducts(ui) {
    const state = D.getState();
    const categories = ["all", ...new Set(state.products.map((product) => product.category))];
    const filtered = state.products.filter((product) => {
      const query = ui.productQuery.toLowerCase();
      const matchesQuery = !query || product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query);
      const matchesCategory = ui.productCategory === "all" || product.category === ui.productCategory;
      const matchesStatus = ui.productStatus === "all" || productStatus(product) === ui.productStatus;
      return matchesQuery && matchesCategory && matchesStatus;
    });
    const activeCount = state.products.filter((product) => productStatus(product) === "active").length;
    const lowCount = state.products.filter((product) => ["low", "out"].includes(productStatus(product))).length;
    const revenue = state.products.reduce((total, product) => total + product.price * product.sold, 0);

    return `${U.pageHead("Catalog", "Products", "Manage the catalog ambassadors can promote, including commission and inventory.", `<button type="button" class="btn btn-primary" data-action="product-new">${icon("plus")} New product</button>`)}
      <div class="stat-strip">
        <div class="mini-stat"><small>Active products</small><strong>${activeCount}</strong></div>
        <div class="mini-stat"><small>Low or out of stock</small><strong>${lowCount}</strong></div>
        <div class="mini-stat"><small>Lifetime product revenue</small><strong>${money(revenue, true)}</strong></div>
      </div>
      <div class="toolbar">
        <div class="search">${icon("search")}<input class="input" id="product-search" type="search" placeholder="Search products" value="${escapeHtml(ui.productQuery)}" autocomplete="off"></div>
        <select class="select" id="product-category" aria-label="Filter by category">${categories.map((category) => `<option value="${category}" ${ui.productCategory === category ? "selected" : ""}>${category === "all" ? "All categories" : category}</option>`).join("")}</select>
        <select class="select" id="product-status" aria-label="Filter by status">${["all", "active", "low", "out", "draft"].map((status) => `<option value="${status}" ${ui.productStatus === status ? "selected" : ""}>${status === "all" ? "All statuses" : status === "low" ? "Low stock" : status === "out" ? "Out of stock" : status[0].toUpperCase() + status.slice(1)}</option>`).join("")}</select>
        <div class="spacer"></div>
        <div class="segmented" aria-label="Product view">
          <button type="button" data-action="product-view" data-view="grid" aria-pressed="${ui.productView === "grid"}" aria-label="Grid view">${icon("grid")}</button>
          <button type="button" data-action="product-view" data-view="table" aria-pressed="${ui.productView === "table"}" aria-label="Table view">${icon("list")}</button>
        </div>
      </div>
      ${filtered.length ? (ui.productView === "grid" ? `<div class="product-grid">${filtered.map(productCard).join("")}</div>` : productTable(filtered)) : `<div class="panel empty"><strong>No products match those filters.</strong>Try a different search or reset the filters.</div>`}`;
  }

  function productCard(product) {
    const status = productStatus(product);
    const stockWidth = Math.min(100, product.stock / 80 * 100);
    return `<article class="product-card">
      <button type="button" data-action="product-open" data-id="${product.id}" aria-label="Open ${escapeHtml(product.name)}">
        <div class="product-art"><img src="../assets/products/${product.art}" alt="${escapeHtml(product.name)}" loading="lazy"></div>
        <div class="product-info">
          <h3>${escapeHtml(product.name)}</h3>
          <div class="product-meta"><span>${product.category}</span><span class="product-price">${money(product.price)}</span></div>
          <div class="product-meta"><span>${product.commission}% commission</span>${statusBadge(status)}</div>
          <div class="stock-line ${status}"><i style="width:${status === "out" ? 100 : stockWidth}%"></i></div>
          <div class="product-meta" style="margin-top:4px"><span>${product.stock} in stock</span><span>${number(product.sold)} sold</span></div>
        </div>
      </button>
    </article>`;
  }

  function productTable(products) {
    return `<div class="table-wrap"><table class="data">
      <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Commission</th><th>Stock</th><th>Sold</th><th>Status</th></tr></thead>
      <tbody>${products.map((product) => `<tr data-clickable data-action="product-open" data-id="${product.id}" tabindex="0">
        <td><div class="cell-main"><img src="../assets/products/${product.art}" alt=""><div><strong>${escapeHtml(product.name)}</strong><small>${product.id}</small></div></div></td>
        <td>${product.category}</td><td class="num">${money(product.price)}</td><td class="num">${product.commission}%</td><td class="num">${product.stock}</td><td class="num">${number(product.sold)}</td><td>${statusBadge(productStatus(product))}</td>
      </tr>`).join("")}</tbody>
    </table></div>`;
  }

  function renderAmbassadors(ui) {
    const state = D.getState();
    const tiers = ["all", "rising", "pro", "elite"];
    const filtered = state.ambassadors.filter((ambassador) => {
      const matchesTier = ui.ambTier === "all" || ambassador.tier === ui.ambTier;
      const query = ui.ambQuery.toLowerCase();
      const matchesQuery = !query || ambassador.name.toLowerCase().includes(query) || ambassador.handle.toLowerCase().includes(query) || ambassador.audience.toLowerCase().includes(query);
      return matchesTier && matchesQuery;
    }).sort((a, b) => b.revenue - a.revenue);
    const active = state.ambassadors.filter((ambassador) => ambassador.status === "active");
    const avgConversion = state.ambassadors.reduce((total, ambassador) => total + ambassador.orders / ambassador.clicks * 100, 0) / state.ambassadors.length;
    const owed = state.ambassadors.reduce((total, ambassador) => total + ambassador.revenue * ambassador.rate / 100, 0);

    return `${U.pageHead("People", "Ambassadors", "Recruit, rank, and reward the people who send you customers.", `<button type="button" class="btn" data-action="export-ambassadors">${icon("download")} Export</button><button type="button" class="btn btn-primary" data-action="amb-invite">${icon("plus")} Invite ambassador</button>`)}
      <div class="stat-strip">
        <div class="mini-stat"><small>Active ambassadors</small><strong>${active.length}</strong></div>
        <div class="mini-stat"><small>Average conversion</small><strong>${percent(avgConversion)}</strong></div>
        <div class="mini-stat"><small>Commission owed (30d)</small><strong>${money(owed, true)}</strong></div>
      </div>
      <div class="toolbar">
        <div class="search">${icon("search")}<input class="input" id="amb-search" type="search" placeholder="Search ambassadors" value="${escapeHtml(ui.ambQuery)}" autocomplete="off"></div>
        <div class="segmented" aria-label="Filter by tier">${tiers.map((tier) => `<button type="button" data-action="amb-tier" data-tier="${tier}" aria-pressed="${ui.ambTier === tier}">${tier === "all" ? "All" : tier[0].toUpperCase() + tier.slice(1)}</button>`).join("")}</div>
      </div>
      ${filtered.length ? `<div class="card-grid">${filtered.map((ambassador, index) => ambassadorCard(ambassador, index)).join("")}</div>` : `<div class="panel empty"><strong>No ambassadors match.</strong>Try another tier or search.</div>`}`;
  }

  function ambassadorCard(ambassador, index) {
    return `<article class="ambassador-card">
      <div class="amb-head">
        <span class="avatar-lg" style="background:${ambassador.color}">${initials(ambassador.name)}</span>
        <div class="list-main"><strong>${ambassador.name}</strong><small>${ambassador.handle}</small></div>
        ${statusBadge(ambassador.tier)}
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">${statusBadge(ambassador.status)}<span style="color:var(--faint);font-size:10px">${ambassador.audience}</span></div>
      <div class="amb-stats">
        <div><small>Revenue</small><strong>${money(ambassador.revenue, true)}</strong></div>
        <div><small>Orders</small><strong>${number(ambassador.orders)}</strong></div>
        <div><small>Conv.</small><strong>${percent(ambassador.orders / ambassador.clicks * 100)}</strong></div>
      </div>
      <div class="amb-foot">
        <div class="spark">${U.sparkline(D.randomSeries(index + 3, 12), ambassador.color)}</div>
        <button type="button" class="btn btn-sm" data-action="amb-open" data-id="${ambassador.id}">View profile</button>
      </div>
    </article>`;
  }

  function renderLinks(ui) {
    const state = D.getState();
    const filtered = state.links.filter((link) => {
      const query = ui.linkQuery.toLowerCase();
      const ambassador = ambassadorById(link.ambassador);
      const product = productById(link.product);
      return !query || link.slug.includes(query) || link.campaign.toLowerCase().includes(query) || ambassador.name.toLowerCase().includes(query) || product.name.toLowerCase().includes(query);
    });
    const totals = state.links.reduce((total, link) => ({ clicks: total.clicks + link.clicks, conversions: total.conversions + link.conversions, revenue: total.revenue + link.revenue }), { clicks: 0, conversions: 0, revenue: 0 });

    return `${U.pageHead("Attribution", "Links", "Create trackable links, monitor intent, and see which partnerships convert.", `<button type="button" class="btn btn-primary" data-action="link-new">${icon("plus")} Create link</button>`)}
      <div class="stat-strip">
        <div class="mini-stat"><small>Tracked links</small><strong>${state.links.length}</strong></div>
        <div class="mini-stat"><small>Link clicks</small><strong>${number(totals.clicks)}</strong></div>
        <div class="mini-stat"><small>Attributed revenue</small><strong>${money(totals.revenue, true)}</strong></div>
      </div>
      <div class="toolbar">
        <div class="search">${icon("search")}<input class="input" id="link-search" type="search" placeholder="Search links, people, products" value="${escapeHtml(ui.linkQuery)}" autocomplete="off"></div>
        <div class="spacer"></div>
        <span style="color:var(--faint);font-size:10px">${filtered.length} of ${state.links.length} links</span>
      </div>
      <div class="panel"><div class="panel-body" style="padding-top:10px">
        ${filtered.length ? `<div class="table-wrap"><table class="data">
          <thead><tr><th>Link</th><th>Ambassador</th><th>Clicks</th><th>Conv.</th><th>Revenue</th><th>Status</th><th></th></tr></thead>
          <tbody>${filtered.map((link) => {
            const ambassador = ambassadorById(link.ambassador);
            const product = productById(link.product);
            return `<tr>
              <td><div class="cell-main"><img src="../assets/products/${product.art}" alt=""><div><strong>${escapeHtml(link.campaign)}</strong><small class="mono">northstar.supply/s/${link.slug}</small></div></div></td>
              <td><div class="cell-main"><span class="avatar-sm" style="background:${ambassador.color}">${initials(ambassador.name)}</span><div><strong>${ambassador.name}</strong><small>${ambassador.handle}</small></div></div></td>
              <td class="num">${number(link.clicks)}</td><td class="num">${percent(link.conversions / link.clicks * 100)}</td><td class="num">${money(link.revenue)}</td><td>${statusBadge(link.status)}</td>
              <td><div style="display:flex;gap:5px;justify-content:flex-end"><button type="button" class="btn btn-sm" data-action="link-copy" data-slug="${link.slug}">${icon("copy")} Copy</button><button type="button" class="btn btn-sm btn-ghost" data-action="link-toggle" data-id="${link.id}">${link.status === "active" ? "Pause" : "Resume"}</button></div></td>
            </tr>`;
          }).join("")}</tbody>
        </table></div>` : `<div class="empty"><strong>No links match.</strong>Try a broader search.</div>`}
      </div></div>`;
  }

  function renderOrders(ui) {
    const state = D.getState();
    const statuses = ["all", "paid", "fulfilled", "pending", "refunded"];
    const filtered = state.orders.filter((order) => {
      const query = ui.orderQuery.toLowerCase();
      const product = productById(order.product);
      const ambassador = ambassadorById(order.ambassador);
      const matchesQuery = !query || order.id.toLowerCase().includes(query) || order.customer.toLowerCase().includes(query) || product.name.toLowerCase().includes(query) || ambassador.name.toLowerCase().includes(query);
      const matchesStatus = ui.orderStatus === "all" || order.status === ui.orderStatus;
      return matchesQuery && matchesStatus;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
    const paid = state.orders.filter((order) => ["paid", "fulfilled"].includes(order.status));
    const revenue = paid.reduce((total, order) => total + order.total, 0);
    const refunded = state.orders.filter((order) => order.status === "refunded").length;

    return `${U.pageHead("Commerce", "Orders", "Every attributed purchase, its ambassador, and the commission it created.", `<button type="button" class="btn" data-action="export-orders">${icon("download")} Export CSV</button>`)}
      <div class="stat-strip">
        <div class="mini-stat"><small>Paid revenue</small><strong>${money(revenue, true)}</strong></div>
        <div class="mini-stat"><small>Orders</small><strong>${state.orders.length}</strong></div>
        <div class="mini-stat"><small>Refunded</small><strong>${refunded}</strong></div>
      </div>
      <div class="toolbar">
        <div class="search">${icon("search")}<input class="input" id="order-search" type="search" placeholder="Search orders or customers" value="${escapeHtml(ui.orderQuery)}" autocomplete="off"></div>
        <div class="segmented" aria-label="Filter orders">${statuses.map((status) => `<button type="button" data-action="order-status" data-status="${status}" aria-pressed="${ui.orderStatus === status}">${status[0].toUpperCase() + status.slice(1)}</button>`).join("")}</div>
      </div>
      <div class="panel"><div class="panel-body" style="padding-top:10px">
        ${filtered.length ? `<div class="table-wrap"><table class="data">
          <thead><tr><th>Order</th><th>Customer</th><th>Ambassador</th><th>Total</th><th>Commission</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>${filtered.map((order) => {
            const product = productById(order.product);
            const ambassador = ambassadorById(order.ambassador);
            return `<tr data-clickable data-action="order-open" data-id="${order.id}" tabindex="0">
              <td><div class="cell-main"><img src="../assets/products/${product.art}" alt=""><div><strong>${order.id}</strong><small>${product.name}</small></div></div></td>
              <td>${order.customer}</td>
              <td><div class="cell-main"><span class="avatar-sm" style="background:${ambassador.color}">${initials(ambassador.name)}</span><span>${ambassador.name}</span></div></td>
              <td class="num">${money(order.total)}</td><td class="num">${money(order.commission)}</td><td>${statusBadge(order.status)}</td><td class="num">${formatDate(order.date)}</td>
            </tr>`;
          }).join("")}</tbody>
        </table></div>` : `<div class="empty"><strong>No orders match.</strong>Try another status or search.</div>`}
      </div></div>`;
  }

  function renderAnalytics(ui) {
    const state = D.getState();
    const m = D.metrics(ui.analyticsRange);
    const days = ui.analyticsRange;
    const funnel = [
      { label: "Link visits", value: Math.round(m.clicks * 1.65), note: "All clicks" },
      { label: "Product views", value: Math.round(m.clicks * 0.72), note: "43.6% of visits" },
      { label: "Add to cart", value: Math.round(m.orders * 3.1), note: "24.1% of views" },
      { label: "Checkout", value: Math.round(m.orders * 1.22), note: "39.4% of carts" },
      { label: "Paid", value: m.orders, note: `${percent(m.conversion)} of clicks` }
    ];
    const maxFunnel = funnel[0].value;
    const topLinks = [...state.links].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    const channels = [
      { label: "Ambassador links", value: 46, color: "#7ee2b8" },
      { label: "Direct", value: 28, color: "#f0b35b" },
      { label: "Email", value: 15, color: "#8ab4f8" },
      { label: "Paid social", value: 11, color: "#c3b1f7" }
    ];
    const cohorts = [
      { label: "Jun 2", values: [100, 64, 51, 43, 38, 34, 31, 29] },
      { label: "Jul 7", values: [100, 61, 47, 39, 35, 31, 28, 26] },
      { label: "Aug 4", values: [100, 66, 53, 45, 40, 36, 33, 31] },
      { label: "Sep 1", values: [100, 63, 49, 41, 37, 34, 31, 30] },
      { label: "Oct 6", values: [100, 68, 55, 47, 42, 39, 36, 0] },
      { label: "Nov 3", values: [100, 71, 58, 50, 45, 0, 0, 0] }
    ];

    return `${U.pageHead("Intelligence", "Analytics", "Follow the path from a click to a paid order, then invest in what compounds.", `${U.rangeControl("analytics", ui.analyticsRange)}<button type="button" class="btn" data-action="export-analytics">${icon("download")} Export</button>`)}
      <div class="kpi-grid">
        ${U.kpiCard("Attributed GMV", money(m.revenue), m.revenueDelta, `last ${days} days`, "wallet", "rgba(126,226,184,.09)")}
        ${U.kpiCard("Link clicks", number(m.clicks), m.clicksDelta, "tracked sessions", "link", "rgba(138,180,248,.08)")}
        ${U.kpiCard("Conversion", percent(m.conversion), m.conversionDelta, "click to paid order", "chart", "rgba(240,179,91,.08)")}
        ${U.kpiCard("Average order", money(m.aov), null, "attributed revenue", "receipt", "rgba(195,177,247,.08)")}
      </div>
      <div class="grid-2">
        <section class="panel" aria-labelledby="analytics-rev-title">
          <div class="panel-head"><div><h2 class="panel-title" id="analytics-rev-title">Traffic and revenue</h2><p class="panel-sub">Click volume compared with attributed GMV.</p></div><div class="chart-legend"><span><i class="legend-dot"></i> GMV</span><span><i class="legend-dot amber"></i> Commission</span></div></div>
          <div class="panel-body">${U.revenueChart(state.series.slice(-days), days)}</div>
        </section>
        <section class="panel" aria-labelledby="funnel-title">
          <div class="panel-head"><div><h2 class="panel-title" id="funnel-title">Conversion funnel</h2><p class="panel-sub">Where intent becomes revenue.</p></div></div>
          <div class="panel-body"><div class="funnel">
            ${funnel.map((step) => `<div class="funnel-row"><span>${step.label}</span><div class="funnel-bar"><i style="width:${Math.max(8, step.value / maxFunnel * 100)}%"></i></div><span class="funnel-value">${number(step.value)}<small>${step.note}</small></span></div>`).join("")}
          </div></div>
        </section>
      </div>
      <div class="grid-2 equal" style="margin-top:16px">
        <section class="panel" aria-labelledby="channel-analytics-title">
          <div class="panel-head"><div><h2 class="panel-title" id="channel-analytics-title">Revenue by channel</h2><p class="panel-sub">A healthy mix keeps acquisition resilient.</p></div></div>
          <div class="panel-body">${U.donutChart(channels, "46%", "Ambassador")}</div>
        </section>
        <section class="panel" aria-labelledby="top-links-title">
          <div class="panel-head"><div><h2 class="panel-title" id="top-links-title">Top links</h2><p class="panel-sub">Highest attributed revenue.</p></div><a class="btn btn-sm btn-ghost" href="links.html">All links</a></div>
          <div class="panel-body"><div class="list">
            ${topLinks.map((link) => {
              const ambassador = ambassadorById(link.ambassador);
              const product = productById(link.product);
              return `<div class="list-row"><span class="avatar-sm" style="background:${ambassador.color}">${initials(ambassador.name)}</span><span class="list-main"><strong>${escapeHtml(link.campaign)}</strong><small>${ambassador.name} · ${product.name}</small></span><span class="list-value">${money(link.revenue)}<small>${number(link.clicks)} clicks</small></span></div>`;
            }).join("")}
          </div></div>
        </section>
      </div>
      <section class="panel" style="margin-top:16px" aria-labelledby="cohort-title">
        <div class="panel-head"><div><h2 class="panel-title" id="cohort-title">Ambassador cohort retention</h2><p class="panel-sub">Share of new ambassadors still creating links in later weeks.</p></div></div>
        <div class="panel-body"><div class="heatmap"><div class="heat-grid">
          <div class="heat-label"></div>${Array.from({ length: 8 }, (_, index) => `<div class="heat-head">W${index + 1}</div>`).join("")}
          ${cohorts.map((cohort) => `<div class="heat-label">${cohort.label}</div>${cohort.values.map((value) => value ? `<div class="heat-cell" style="--heat:${(value / 100 * 0.8).toFixed(2)}">${value}</div>` : `<div class="heat-cell" style="--heat:0.03"></div>`).join("")}`).join("")}
        </div></div></div>
      </section>`;
  }

  function renderPayouts(ui) {
    const state = D.getState();
    const pending = state.payouts.filter((payout) => ["pending", "scheduled"].includes(payout.status));
    const available = pending.reduce((total, payout) => total + payout.amount, 0);
    const paid = state.payouts.filter((payout) => payout.status === "paid").reduce((total, payout) => total + payout.amount, 0);
    const next = new Date(D.TODAY);
    next.setUTCDate(next.getUTCDate() + 15);

    return `${U.pageHead("Money", "Payouts", "Review balances, approve batches, and keep every ambassador paid on time.", `<button type="button" class="btn btn-primary" data-action="payout-run" ${pending.length ? "" : "disabled"}>${icon("wallet")} Run payouts</button>`)}
      <div class="kpi-grid">
        ${U.kpiCard("Available to pay", money(available), null, "pending and scheduled", "wallet", "rgba(126,226,184,.09)")}
        ${U.kpiCard("Paid this year", money(paid), null, "demo payout history", "check", "rgba(138,180,248,.08)")}
        ${U.kpiCard("Ambassadors", number(new Set(state.payouts.map((payout) => payout.ambassador)).size), null, "in current batch", "users", "rgba(240,179,91,.08)")}
        ${U.kpiCard("Next scheduled", formatDate(next), null, "monthly on the 1st", "clock", "rgba(195,177,247,.08)")}
      </div>
      <div class="info-box" style="margin-bottom:16px">${icon("alert")}<div><strong style="color:var(--ink)">This is a simulation.</strong> No money moves. In production, payouts would be created as Stripe Connect transfers after an admin approves the batch and fraud checks pass.</div></div>
      <div class="panel"><div class="panel-head"><div><h2 class="panel-title">Payout history</h2><p class="panel-sub">Select a payout to inspect the line items behind it.</p></div></div><div class="panel-body" style="padding-top:10px">
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Payout</th><th>Ambassador</th><th>Period</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>${state.payouts.map((payout) => {
            const ambassador = ambassadorById(payout.ambassador);
            return `<tr data-clickable data-action="payout-open" data-id="${payout.id}" tabindex="0">
              <td class="mono">${payout.id}</td>
              <td><div class="cell-main"><span class="avatar-sm" style="background:${ambassador.color}">${initials(ambassador.name)}</span><div><strong>${ambassador.name}</strong><small>${ambassador.handle}</small></div></div></td>
              <td>${payout.period}</td><td class="num">${money(payout.amount)}</td><td>${payout.method}</td><td>${statusBadge(payout.status)}</td><td class="num">${formatDate(payout.date)}</td>
            </tr>`;
          }).join("")}</tbody>
        </table></div>
      </div></div>`;
  }

  function renderSettings(ui) {
    const tabs = [
      ["workspace", "Workspace"],
      ["program", "Program"],
      ["integrations", "Integrations"],
      ["team", "Team"],
      ["danger", "Danger zone"]
    ];
    return `${U.pageHead("Admin", "Settings", "Configure the program, connections, and the people who operate it.", "")}
      <div class="settings-tabs" role="tablist" aria-label="Settings sections">
        ${tabs.map(([id, label]) => `<button type="button" role="tab" data-action="settings-tab" data-tab="${id}" aria-selected="${ui.settingsTab === id}">${label}</button>`).join("")}
      </div>
      <div role="tabpanel">${renderSettingsTab(ui)}</div>`;
  }

  function renderSettingsTab(ui) {
    const state = D.getState();
    if (ui.settingsTab === "program") {
      const settings = state.settings;
      return `<form class="settings-section" data-form="settings-program">
        <div><h2>Commission and attribution</h2><p>These defaults apply to new ambassadors unless overridden on their profile.</p></div>
        <div class="field">
          <label for="commission-rate">Default commission rate</label>
          <div style="display:flex;align-items:center;gap:12px"><input class="range" id="commission-rate" name="commissionRate" type="range" min="5" max="25" step="1" value="${settings.commissionRate}" data-output="commission-output"><strong id="commission-output" style="font-size:18px;min-width:42px;text-align:right;color:var(--mint)">${settings.commissionRate}%</strong></div>
          <span class="field-hint">Elite ambassadors can have a custom rate. Commission is calculated on the pre-tax order total.</span>
        </div>
        <div class="form-grid two">
          <div class="field"><label for="cookie-window">Cookie window</label><select class="select" id="cookie-window" name="cookieWindow">${["7 days", "14 days", "30 days", "60 days", "90 days"].map((value) => `<option ${settings.cookieWindow === value ? "selected" : ""}>${value}</option>`).join("")}</select></div>
          <div class="field"><label for="attribution">Attribution model</label><select class="select" id="attribution" name="attribution">${["Last click", "First click", "Linear"].map((value) => `<option ${settings.attribution === value ? "selected" : ""}>${value}</option>`).join("")}</select></div>
          <div class="field"><label for="min-payout">Minimum payout</label><input class="input" id="min-payout" name="minPayout" type="number" min="0" step="5" value="${settings.minPayout}"></div>
          <div class="field"><label for="payout-day">Payout schedule</label><select class="select" id="payout-day" name="payoutDay"><option>Monthly · 1st</option><option>Monthly · 15th</option><option>Biweekly</option></select></div>
        </div>
        <div>
          <div class="toggle-row"><div><strong>Auto-approve new ambassadors</strong><small>Applications are accepted immediately. Turn this off to review each person manually.</small></div><label class="switch"><input type="checkbox" name="autoApprove" ${settings.autoApprove ? "checked" : ""}><span></span></label></div>
          <div class="toggle-row"><div><strong>Fraud review on payouts</strong><small>Hold unusual payout patterns for a human review before money moves.</small></div><label class="switch"><input type="checkbox" name="fraudReview" ${settings.fraudReview ? "checked" : ""}><span></span></label></div>
          <div class="toggle-row"><div><strong>Email updates</strong><small>Send the operator a weekly performance digest.</small></div><label class="switch"><input type="checkbox" name="emailUpdates" ${settings.emailUpdates ? "checked" : ""}><span></span></label></div>
        </div>
        <div class="page-actions"><button type="submit" class="btn btn-primary">Save program settings</button></div>
      </form>`;
    }

    if (ui.settingsTab === "integrations") {
      return `<section class="settings-section">
        <div><h2>Connections</h2><p>The services that make the program run. This page is a front-end simulation.</p></div>
        <div class="integration-grid">
          <div class="integration"><span class="integration-icon">S</span><div><strong>Stripe</strong><small>Checkout payments</small><br>${statusBadge("connected")}</div><button type="button" class="btn btn-sm" data-action="integration" data-name="Stripe" style="margin-left:auto">Manage</button></div>
          <div class="integration"><span class="integration-icon">K</span><div><strong>Apache Kafka</strong><small>Order and commission events</small><br>${statusBadge("connected")}</div><button type="button" class="btn btn-sm" data-action="integration" data-name="Kafka" style="margin-left:auto">Manage</button></div>
          <div class="integration"><span class="integration-icon">M</span><div><strong>Email provider</strong><small>Transactional and digest email</small><br>${statusBadge("connected")}</div><button type="button" class="btn btn-sm" data-action="integration" data-name="Email provider" style="margin-left:auto">Manage</button></div>
          <div class="integration"><span class="integration-icon">S</span><div><strong>Slack</strong><small>Operations and payout alerts</small><br>${statusBadge("draft")}</div><button type="button" class="btn btn-sm" data-action="integration" data-name="Slack" style="margin-left:auto">Connect</button></div>
        </div>
        <div class="info-box">${icon("alert")}<div>Credentials are configured through environment variables or Kubernetes Secrets in the real services. No keys are stored in this static demo.</div></div>
      </section>`;
    }

    if (ui.settingsTab === "team") {
      return `<section class="settings-section">
        <div><h2>Team</h2><p>People with access to the operator workspace.</p></div>
        <div class="panel"><div class="panel-body" style="padding-top:4px">
          ${state.team.map((member) => `<div class="team-row">
            <span class="avatar-sm" style="background:${member.color}">${initials(member.name)}</span>
            <div class="list-main"><strong>${member.name}</strong><small>${member.email}</small></div>
            <select class="select" aria-label="Role for ${member.name}" data-team-role="${member.id}">${["Owner", "Admin", "Analyst", "Support"].map((role) => `<option ${member.role === role ? "selected" : ""}>${role}</option>`).join("")}</select>
          </div>`).join("")}
        </div></div>
        <div class="page-actions"><button type="button" class="btn btn-primary" data-action="team-invite">${icon("plus")} Invite teammate</button></div>
      </section>`;
    }

    if (ui.settingsTab === "danger") {
      return `<section class="settings-section">
        <div><h2 style="color:var(--rose)">Danger zone</h2><p>These actions affect the sample data stored in this browser.</p></div>
        <div class="info-box warn">${icon("alert")}<div>Resetting restores the original sample workspace. It does not touch the Go services or any database.</div></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn" data-action="reset-demo">Reset demo data</button><button type="button" class="btn btn-danger" data-action="clear-demo">Clear local storage</button></div>
      </section>`;
    }

    const settings = state.settings;
    return `<form class="settings-section" data-form="settings-workspace">
      <div><h2>Workspace</h2><p>The identity your team sees inside the operator console.</p></div>
      <div class="form-grid two">
        <div class="field"><label for="store-name">Store name</label><input class="input" id="store-name" name="storeName" value="${escapeHtml(settings.storeName)}" required></div>
        <div class="field"><label for="store-domain">Storefront domain</label><input class="input" id="store-domain" name="domain" value="${escapeHtml(settings.domain)}" required></div>
        <div class="field"><label for="currency">Currency</label><select class="select" id="currency" name="currency">${["USD", "EUR", "GBP", "CAD"].map((value) => `<option ${settings.currency === value ? "selected" : ""}>${value}</option>`).join("")}</select></div>
        <div class="field"><label for="timezone">Timezone</label><select class="select" id="timezone" name="timezone">${["America/Los_Angeles", "America/New_York", "Europe/London", "Europe/Berlin", "Asia/Tokyo"].map((value) => `<option ${settings.timezone === value ? "selected" : ""}>${value}</option>`).join("")}</select></div>
      </div>
      <div class="page-actions"><button type="submit" class="btn btn-primary">Save workspace</button></div>
    </form>`;
  }

  function renderStorefront(ui) {
    const state = D.getState();
    const products = state.products.filter((product) => product.status !== "draft");
    const refSlug = new URLSearchParams(window.location.search).get("ref") || "maya";
    const ref = D.ambassadorBySlug(refSlug) || state.ambassadors[0];
    const count = Object.values(ui.cart).reduce((total, quantity) => total + quantity, 0);
    const featured = products.filter((product) => product.stock > 0).slice(0, 8);

    return `<div class="store-shell">
      <div class="store-announce">Free carbon-neutral shipping over $90 · 30-day returns · Demo storefront</div>
      <header class="store-nav">
        <a class="store-brand" href="#shop">${icon("spark")} Northstar Supply</a>
        <nav class="store-links" aria-label="Storefront">
          <a href="#shop">Shop</a>
          <a href="#story">Our story</a>
          <a href="../preview.html#learn" target="_top">Ambassador program</a>
        </nav>
        <div class="store-actions">
          <a class="btn btn-sm btn-ghost" href="../preview.html" target="_top">Operator demo</a>
          <button type="button" class="btn btn-sm" data-action="cart-open">Cart <span data-cart-count>${count}</span></button>
        </div>
      </header>
      <section class="store-hero">
        <div class="store-hero-copy">
          <div class="store-kicker">Field-tested essentials</div>
          <h1>Built for the<br><em>long way round.</em></h1>
          <p>Durable gear for weekends outside and the long commute home. Every order through this link supports ${escapeHtml(ref.name.split(" ")[0])}.</p>
          <div class="store-hero-actions">
            <a class="btn btn-primary" href="#shop">Shop the collection</a>
            <a class="btn" href="#story">Our story</a>
          </div>
          <div class="attribution-pill"><span class="avatar-sm" style="background:${ref.color}">${initials(ref.name)}</span> Shopping with ${escapeHtml(ref.name.split(" ")[0])}'s ambassador link · ${ref.rate}% supports their work</div>
        </div>
        <div class="store-hero-art" aria-hidden="true">
          <img src="../assets/products/ridgeline-pack.svg" alt="">
          <img src="../assets/products/aurora-tent.svg" alt="">
        </div>
      </section>
      <section class="store-section" id="shop">
        <div class="store-section-head"><div><h2>The essentials</h2><p>Small-batch gear, repaired not replaced.</p></div><span style="color:#8e9d94;font-size:10px">${featured.length} products</span></div>
        <div class="store-grid">
          ${featured.map((product) => `<article class="store-card">
            <button type="button" data-action="store-view" data-id="${product.id}" aria-label="View ${escapeHtml(product.name)}"><img src="../assets/products/${product.art}" alt="${escapeHtml(product.name)}" loading="lazy"></button>
            <div class="store-card-info"><h3>${escapeHtml(product.name)}</h3><div><span>${product.category}</span><strong>${money(product.price)}</strong></div></div>
            <button type="button" class="add" data-action="add-to-cart" data-id="${product.id}">Add to cart · ${product.commission}% commission</button>
          </article>`).join("")}
        </div>
      </section>
      <section class="store-story" id="story">
        <div><h2>Gear that earns<br>its place.</h2><p>Northstar Supply is a fictional merchant created for this open-source demo. The products, orders, ambassadors, and payouts are sample data. The storefront is real HTML and CSS, and every interaction runs in your browser.</p></div>
        <div class="store-story-values">
          <div class="store-value"><strong>1%</strong><span>of revenue is modeled for trail repair grants.</span></div>
          <div class="store-value"><strong>10-12%</strong><span>commission goes to the ambassador who referred the order.</span></div>
          <div class="store-value"><strong>30 days</strong><span>cookie window in the default program settings.</span></div>
          <div class="store-value"><strong>0</strong><span>payments processed. This is a safe simulation.</span></div>
        </div>
      </section>
      <footer class="store-footer"><span>Northstar Supply · A demo storefront for the Ambassador project.</span><span class="note">No real checkout. No data leaves this browser.</span></footer>
    </div>`;
  }

  function renderHub() {
    return `<div class="hub-shell">
      <div class="hub-head">
        <div><div class="eyebrow">Product demo</div><h1>Nine screens.<br>One connected story.</h1><p>Open any screen, click around, and reset the sample data whenever you like.</p></div>
        <div class="page-actions"><a class="btn" href="../preview.html">← Back to overview</a><a class="btn btn-primary" href="dashboard.html">Open dashboard</a></div>
      </div>
      <div class="hub-grid">
        ${D.PAGES.map((page) => `<a class="hub-card" href="${page.file}">
          <div class="hub-preview"><div class="hub-preview-lines"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
          <div class="hub-card-info">${icon(page.icon)}<strong>${page.label}</strong><span>${page.group}</span></div>
        </a>`).join("")}
      </div>
      <p style="margin-top:22px;color:var(--faint);font-size:10.5px">All names, orders, products, and payouts are sample data. The Go services in the repository are real; this site is a front-end simulation.</p>
    </div>`;
  }

  window.AmbassadorPages = {
    renderDashboard, renderProducts, renderAmbassadors, renderLinks, renderOrders,
    renderAnalytics, renderPayouts, renderSettings, renderStorefront, renderHub
  };
})();
