/* Landing interactions for the Ambassador demo: theme, nav, demo tabs, quiz, ROI, architecture. */
(function () {
  "use strict";

  var THEME_KEY = "ambassador-demo-theme";
  var GITHUB = "https://github.com/M0-AR/ambassador-microsevices-golang";

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $$(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function icon(name, size) {
    var paths = {
      grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
      box: '<path d="M21 8 12 3 3 8v8l9 5 9-5Z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/>',
      users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
      link: '<path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.1"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.1"/>',
      bag: '<path d="M6 7h12l1 14H5L6 7Z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/>',
      receipt: '<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2V3Z"/><path d="M9 8h6M9 12h6"/>',
      chart: '<path d="M3 3v18h18"/><path d="M7 15l4-5 4 3 5-7"/>',
      wallet: '<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/><circle cx="16" cy="15" r="1.2"/>',
      sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3"/><path d="M1 14h6M9 8h6M17 16h6"/>',
      store: '<path d="M3 9l1.5-6h15L21 9"/><path d="M3 9v12h18V9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M9 21v-6h6v6"/>',
      shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
      mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>',
      database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"/>',
      bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
      card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/>',
      sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
      moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/>'
    };
    return '<svg viewBox="0 0 24 24" width="' + (size || 16) + '" height="' + (size || 16) + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || paths.grid) + "</svg>";
  }

  /* ---------- theme ---------- */

  function initTheme() {
    try {
      var saved = localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") document.documentElement.dataset.theme = saved;
    } catch (error) { /* optional */ }
    syncThemeIcon();

    var button = $("#theme-button");
    if (!button) return;
    button.addEventListener("click", function () {
      var next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem(THEME_KEY, next); } catch (error) { /* optional */ }
      syncThemeIcon();
    });
  }

  function syncThemeIcon() {
    var button = $("#theme-button");
    if (!button) return;
    var next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    button.innerHTML = icon(next === "dark" ? "moon" : "sun", 15);
  }

  /* ---------- header + nav ---------- */

  function initHeader() {
    var header = $("#site-header");
    function onScroll() {
      if (header) header.classList.toggle("scrolled", window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var toggle = $("#nav-toggle");
    var nav = $("#site-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      });
      $$("a", nav).forEach(function (link) {
        link.addEventListener("click", function () {
          nav.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && nav.classList.contains("open")) {
          nav.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.focus();
        }
      });
    }
  }

  /* ---------- reveal ---------- */

  function initReveal() {
    var items = $$(".reveal");
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach(function (item) { item.classList.add("in"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (item) { observer.observe(item); });
  }

  /* ---------- live demo ---------- */

  var DEMO_BASE = "m0-ar.github.io/ambassador-microsevices-golang/";
  var screens = [
    { id: "dashboard", label: "Dashboard", icon: "grid", file: "app/dashboard.html",
      title: "Start with the dashboard.",
      copy: "Attributed revenue, top ambassadors, and the latest orders — the daily pulse of the program.",
      caption: "<strong>Dashboard</strong> — see attributed revenue, top ambassadors, and the latest orders at a glance." },
    { id: "products", label: "Products", icon: "box", file: "app/products.html",
      title: "The catalog behind the links.",
      copy: "Search, filter, and edit the eight demo products without leaving the table.",
      caption: "<strong>Products</strong> — search, filter by category, and open any product to edit its details." },
    { id: "ambassadors", label: "Ambassadors", icon: "users", file: "app/ambassadors.html",
      title: "The people doing the selling.",
      copy: "Invite a creator, move them between tiers, and watch their commission rate change.",
      caption: "<strong>Ambassadors</strong> — invite someone new, change a tier, and see the program roster update." },
    { id: "links", label: "Links", icon: "link", file: "app/links.html",
      title: "Every share, tracked.",
      copy: "Create a referral link, copy it, and pause it when a campaign ends.",
      caption: "<strong>Links</strong> — generate a referral link, copy it, and toggle it on or off." },
    { id: "storefront", label: "Storefront", icon: "store", file: "app/storefront.html?ref=maya",
      title: "What the customer sees.",
      copy: "A shopper lands through Maya's link. Add gear to the cart and check out — the commission is calculated live.",
      caption: "<strong>Storefront</strong> — shop through Maya's link, add to cart, and complete the simulated checkout." },
    { id: "orders", label: "Orders", icon: "receipt", file: "app/orders.html",
      title: "From paid to fulfilled.",
      copy: "Filter orders, open one, mark it fulfilled, or refund it and watch the commission reverse.",
      caption: "<strong>Orders</strong> — filter by status, open an order, and mark it fulfilled or refunded." },
    { id: "analytics", label: "Analytics", icon: "chart", file: "app/analytics.html",
      title: "Where the revenue comes from.",
      copy: "Switch the reporting range, compare channels, and see which links actually convert.",
      caption: "<strong>Analytics</strong> — change the range and compare channel mix, conversion, and top links." },
    { id: "payouts", label: "Payouts", icon: "wallet", file: "app/payouts.html",
      title: "Paying people on time.",
      copy: "Run a payout batch, open an ambassador's statement, and mark a transfer as paid.",
      caption: "<strong>Payouts</strong> — run a batch, open a statement, and mark a payout as paid." },
    { id: "settings", label: "Settings", icon: "sliders", file: "app/settings.html",
      title: "The rules of the program.",
      copy: "Rename the workspace, adjust commission and cookie windows, and invite a teammate.",
      caption: "<strong>Settings</strong> — edit the workspace, tune program rules, and invite a teammate." }
  ];

  function initDemo() {
    var tabsRoot = $("#demo-tabs");
    var frame = $("#demo-frame");
    var stage = $("#demo-stage");
    var poster = $("#demo-poster");
    var loading = $("#demo-loading");
    var url = $("#demo-url");
    var full = $("#demo-full");
    var caption = $("#demo-caption-text");
    var posterTitle = $("#poster-title");
    var posterCopy = $("#poster-copy");
    var launch = $("#demo-launch");
    if (!tabsRoot || !frame || !stage) return;

    var current = screens[0];
    var launched = false;

    tabsRoot.innerHTML = screens.map(function (screen, index) {
      return '<button class="demo-tab" type="button" role="tab" id="tab-' + screen.id + '" aria-controls="demo-stage" aria-selected="' + (index === 0 ? "true" : "false") + '" tabindex="' + (index === 0 ? "0" : "-1") + '" data-screen="' + screen.id + '">' + icon(screen.icon, 13) + "<span>" + screen.label + "</span></button>";
    }).join("");

    stage.setAttribute("role", "tabpanel");
    stage.setAttribute("aria-labelledby", "tab-dashboard");

    function selectScreen(id, focus) {
      var screen = screens.filter(function (item) { return item.id === id; })[0];
      if (!screen) return;
      current = screen;

      $$(".demo-tab", tabsRoot).forEach(function (tab) {
        var active = tab.dataset.screen === id;
        tab.setAttribute("aria-selected", active ? "true" : "false");
        tab.tabIndex = active ? 0 : -1;
        if (active && focus) tab.focus();
      });

      stage.setAttribute("aria-labelledby", "tab-" + id);
      caption.innerHTML = screen.caption;
      url.textContent = DEMO_BASE + screen.file;
      full.href = screen.file;
      frame.title = "Ambassador product demo — " + screen.label + " screen";

      if (!launched) {
        posterTitle.textContent = screen.title;
        posterCopy.textContent = screen.copy;
        return;
      }
      loadScreen(screen);
    }

    function loadScreen(screen) {
      if (frame.dataset.src === screen.file) return;
      loading.classList.remove("hidden");
      poster.classList.add("hidden");
      frame.dataset.src = screen.file;
      frame.src = screen.file;
    }

    tabsRoot.addEventListener("click", function (event) {
      var tab = event.target.closest(".demo-tab");
      if (tab) selectScreen(tab.dataset.screen, false);
    });

    tabsRoot.addEventListener("keydown", function (event) {
      var keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
      if (keys.indexOf(event.key) === -1) return;
      event.preventDefault();
      var index = screens.findIndex(function (screen) { return screen.id === current.id; });
      if (event.key === "ArrowRight") index = (index + 1) % screens.length;
      if (event.key === "ArrowLeft") index = (index - 1 + screens.length) % screens.length;
      if (event.key === "Home") index = 0;
      if (event.key === "End") index = screens.length - 1;
      selectScreen(screens[index].id, true);
    });

    launch.addEventListener("click", function () {
      launched = true;
      poster.classList.add("hidden");
      loadScreen(current);
    });

    frame.addEventListener("load", function () {
      if (!frame.src) return;
      loading.classList.add("hidden");
    });
  }


  /* ---------- quiz ---------- */

  var questions = [
    {
      prompt: "A shopper clicks Maya's link and buys a $100 jacket. Where does the commission percentage come from in this repository?",
      options: [
        "The ambassador record in the database",
        "A hard-coded 10% inside checkout",
        "Stripe calculates it from the card",
        "The browser reads it from a cookie"
      ],
      answer: 1,
      explain: "Checkout hard-codes 10% of each line-item total for the ambassador and 90% for the merchant. The demo's tiered rates show what a richer program could look like."
    },
    {
      prompt: "Why publish an order event to Kafka instead of calling the email, admin, and ambassador services directly?",
      options: [
        "It decouples the services and lets consumers retry or replay",
        "Kafka stores product images faster",
        "It replaces the need for MySQL",
        "It makes the checkout page render quicker"
      ],
      answer: 0,
      explain: "Checkout emits one order_created event to the admin, ambassador, and email topics. Each consumer processes it on its own schedule, and a slow email server can't block a sale."
    },
    {
      prompt: "Which service owns ambassador records, referral links, order stats, and the rankings board?",
      options: [
        "The ambassador service",
        "The users service",
        "The email consumer",
        "Stripe, entirely"
      ],
      answer: 0,
      explain: "The ambassador service stores ambassador profiles, creates referral links, serves order stats, and keeps a Redis-backed rankings board. Commissions are computed in checkout as a flat 10% split."
    },
    {
      prompt: "What must checkout do before creating an order?",
      options: [
        "Resolve the referral link, price the cart, and compute the split",
        "Email the customer a receipt first",
        "Ask the browser for the commission rate",
        "Wait for the analytics dashboard to refresh"
      ],
      answer: 0,
      explain: "Checkout validates the cart, resolves the referral link, computes a flat 10% split, and only then starts the Stripe Checkout session and writes the order."
    },
    {
      prompt: "After Stripe redirects the shopper back, what marks the order complete and publishes order_created?",
      options: [
        "A confirm call from the storefront to the checkout service",
        "The customer's browser writes the database directly",
        "The email service",
        "The admin dashboard polling Stripe"
      ],
      answer: 0,
      explain: "The storefront posts the Checkout Session id to /api/checkout/orders/confirm, which marks the order complete and publishes order_created to the admin, ambassador, and email topics. A production build should verify Stripe's signed webhook instead."
    },
    {
      prompt: "What is the correct way to handle Stripe and Kafka credentials in this repository?",
      options: [
        "Environment variables and Kubernetes Secrets, never committed",
        "Commit them so contributors can run the stack immediately",
        "Put them in the README as a convenience",
        "Hard-code defaults and override only in production"
      ],
      answer: 0,
      explain: "Every service reads credentials from the environment, with example files that contain placeholders. Real keys never belong in git — if they leak, rotate them."
    }
  ];

  function initQuiz() {
    var body = $("#quiz-body");
    var dots = $("#quiz-dots");
    var title = $("#quiz-title");
    if (!body) return;

    var index = 0;
    var score = 0;
    var answered = false;

    function renderDots() {
      if (!dots) return;
      dots.innerHTML = questions.map(function (_, i) {
        return '<i class="' + (i < index ? "done" : i === index ? "current" : "") + '"></i>';
      }).join("");
    }

    function renderQuestion() {
      answered = false;
      var question = questions[index];
      renderDots();
      if (title) title.textContent = "Question " + (index + 1) + " of " + questions.length;

      body.innerHTML =
        '<div class="quiz-step">Concept ' + (index + 1) + " / " + questions.length + "</div>" +
        '<h3 class="quiz-question">' + question.prompt + "</h3>" +
        '<div class="quiz-options" role="group" aria-label="Answer choices">' +
        question.options.map(function (option, i) {
          return '<button class="quiz-option" type="button" data-option="' + i + '"><span class="key">' + String.fromCharCode(65 + i) + "</span><span>" + option + "</span></button>";
        }).join("") +
        "</div>" +
        '<div class="quiz-feedback" id="quiz-feedback" hidden></div>' +
        '<div class="quiz-actions"><span class="quiz-score">Score <strong>' + score + "</strong> / " + questions.length + '</span><button class="btn btn-primary btn-sm" type="button" id="quiz-next" hidden>Next question →</button></div>';

      $$(".quiz-option", body).forEach(function (button) {
        button.addEventListener("click", function () {
          if (answered) return;
          answered = true;
          var picked = Number(button.dataset.option);
          var correct = picked === question.answer;
          if (correct) score += 1;

          $$(".quiz-option", body).forEach(function (optionButton, i) {
            optionButton.disabled = true;
            if (i === question.answer) optionButton.classList.add("correct");
            if (i === picked && !correct) optionButton.classList.add("wrong");
          });

          var feedback = $("#quiz-feedback", body);
          feedback.hidden = false;
          feedback.innerHTML = "<strong>" + (correct ? "Exactly." : "Not quite.") + "</strong> " + question.explain;

          var next = $("#quiz-next", body);
          next.hidden = false;
          next.textContent = index === questions.length - 1 ? "See result →" : "Next question →";
          next.addEventListener("click", function () {
            if (index === questions.length - 1) {
              renderResult();
            } else {
              index += 1;
              renderQuestion();
            }
          });
          var scoreEl = $(".quiz-score strong", body);
          if (scoreEl) scoreEl.textContent = score;
          next.focus();
        });
      });
    }

    function renderResult() {
      renderDots();
      if (title) title.textContent = "Result";
      var message;
      if (score === questions.length) {
        message = "Perfect. You could hold your own in a system-design interview about this repository — and you understand why the pieces are separate.";
      } else if (score >= 4) {
        message = "Strong. You've got the shape of the system. Re-read the explanations above and the beginner guide, and the last few ideas will lock in.";
      } else if (score >= 2) {
        message = "A solid start. The core pattern is: one service owns each fact, and events carry changes between them. The beginner guide walks through it from zero.";
      } else {
        message = "No shame — this is a lot at once. Start with the beginner guide in the README; it builds the same model one sentence at a time.";
      }

      body.innerHTML =
        '<div class="quiz-result">' +
        '<div class="medal" aria-hidden="true">' + score + "/" + questions.length + "</div>" +
        "<h3>" + (score === questions.length ? "Zero to hero." : score >= 4 ? "Almost there." : "The model is forming.") + "</h3>" +
        "<p>" + message + "</p>" +
        '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">' +
        '<button class="btn btn-primary" type="button" id="quiz-restart">Try again</button>' +
        '<a class="btn" href="' + GITHUB + '#-beginner-guide--read-this-and-you-are-a-professional" rel="noopener">Read the beginner guide</a>' +
        "</div></div>";

      var restart = $("#quiz-restart", body);
      if (restart) restart.addEventListener("click", function () {
        index = 0;
        score = 0;
        renderQuestion();
      });
    }

    renderQuestion();
  }

  /* ---------- ROI calculator ---------- */

  function initRoi() {
    var form = $("#roi-form");
    if (!form) return;

    var fields = {
      revenue: $("#roi-revenue"),
      aov: $("#roi-aov"),
      share: $("#roi-share"),
      rate: $("#roi-rate")
    };

    function money(value) {
      return "$" + Math.round(value).toLocaleString("en-US");
    }

    function money2(value) {
      return "$" + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function setProgress(input) {
      var min = Number(input.min);
      var max = Number(input.max);
      var pct = ((Number(input.value) - min) / (max - min)) * 100;
      input.style.setProperty("--range-progress", pct + "%");
    }

    function update() {
      var revenue = Number(fields.revenue.value);
      var aov = Number(fields.aov.value);
      var share = Number(fields.share.value);
      var rate = Number(fields.rate.value);

      var gmv = revenue * (share / 100);
      var orders = aov > 0 ? Math.round(gmv / aov) : 0;
      var commission = gmv * (rate / 100);
      var kept = gmv - commission;
      var costShare = revenue > 0 ? (commission / revenue) * 100 : 0;
      var perDollar = commission > 0 ? gmv / commission : 0;

      $("#roi-revenue-out").textContent = money(revenue);
      $("#roi-aov-out").textContent = money(aov);
      $("#roi-share-out").textContent = share + "%";
      $("#roi-rate-out").textContent = rate + "%";
      $("#roi-gmv").textContent = money(gmv);
      $("#roi-orders").textContent = "≈ " + orders.toLocaleString("en-US") + " attributed orders per month";
      $("#roi-commission").textContent = money(commission);
      $("#roi-kept").textContent = money(kept);
      $("#roi-cost").textContent = costShare.toFixed(1) + "%";
      $("#roi-return").textContent = money2(perDollar);

      Object.keys(fields).forEach(function (key) { setProgress(fields[key]); });
    }

    Object.keys(fields).forEach(function (key) {
      fields[key].addEventListener("input", update);
    });
    update();
  }

  /* ---------- architecture map ---------- */

  var archRows = [
    {
      label: "Experience layer",
      nodes: [
        {
          id: "storefront", title: "Customer storefront", icon: "store", kind: "client", span: 4,
          role: "Where shoppers browse and buy",
          desc: "A shopper arrives through an ambassador link, browses the catalog, and starts checkout. In this repository the storefront is a static demo page; the real transaction path lives in the checkout service and Stripe.",
          facts: [["In this repo", "Static demo pages in docs/app"], ["Real path", "Checkout service + Stripe Checkout"], ["Attribution", "Ambassador slug travels on the referral link"]]
        },
        {
          id: "ambassador-portal", title: "Ambassador portal", icon: "users", kind: "client", span: 4,
          role: "The creator's view of the program",
          desc: "Where an ambassador sees their links, clicks, earnings, and payout statements. The demo simulates this screen; the data model behind it lives in the ambassador service.",
          facts: [["In this repo", "Simulated screen in the demo"], ["Real owner", "Ambassador service"], ["Key data", "Links, clicks, commissions, payouts"]]
        },
        {
          id: "admin-console", title: "Admin console", icon: "shield", kind: "client", span: 4,
          role: "The merchant's control room",
          desc: "Products, program rules, ambassadors, orders, and payouts in one place. The demo console is static; the admin service owns the real catalog and program configuration.",
          facts: [["In this repo", "Simulated screen in the demo"], ["Real owner", "Admin service"], ["Key data", "Products, settings, program rules"]]
        }
      ]
    },
    {
      label: "Go services",
      nodes: [
        {
          id: "users", title: "Users", icon: "users", kind: "service", span: 2,
          role: "Identity and sessions",
          desc: "Owns accounts, authentication, and profile updates. Issues the JWTs that other services verify before trusting a request.",
          facts: [["Stack", "Go · MySQL · JWT"], ["Owns", "Users, logins, password changes"], ["Deployment", "Own Dockerfile and Compose stack"]]
        },
        {
          id: "admin", title: "Admin", icon: "sliders", kind: "service", span: 2,
          role: "Catalog and program settings",
          desc: "Manages products and the rules of the ambassador program, then publishes catalog changes so checkout and the ambassador service stay in sync.",
          facts: [["Publishes", "product_created · product_updated · product_deleted"], ["Consumes", "link_created and order_created from admin_topic"], ["Owns", "Products and program settings"]]
        },
        {
          id: "ambassador", title: "Ambassador", icon: "link", kind: "service", span: 2,
          role: "Links, stats, rankings",
          desc: "Owns ambassador records, referral links, order stats, and the Redis-backed rankings board. Consumes order events to keep stats current and publishes new links to its peers.",
          facts: [["Owns", "Ambassadors, links, order stats, rankings"], ["Consumes", "order_created from ambassador_topic"], ["Publishes", "link_created to admin and checkout"]]
        },
        {
          id: "checkout", title: "Checkout", icon: "bag", kind: "service", span: 2,
          role: "Carts, orders, payment state",
          desc: "Validates the cart, resolves the referral link, computes a flat 10% commission split, and starts a Stripe Checkout session. After the redirect, the confirm endpoint marks the order complete and emits order_created.",
          facts: [["Owns", "Carts, orders, payment state"], ["Publishes", "order_created to admin, ambassador, email"], ["Consumes", "product and link events to price accurately"]]
        },
        {
          id: "email", title: "Email", icon: "mail", kind: "service", span: 2,
          role: "Transactional notifications",
          desc: "A Kafka consumer with one job: turn order events into email. Sends the ambassador their earnings note and the merchant an order summary over SMTP.",
          facts: [["Stack", "Go · SMTP (Mailtrap in development)"], ["Consumes", "email_topic order events"], ["Sends", "Ambassador earnings and merchant summaries"]]
        }
      ]
    },
    {
      label: "Event backbone",
      nodes: [
        {
          id: "kafka", title: "Apache Kafka", icon: "bolt", kind: "service", span: 12, bus: true,
          role: "The asynchronous backbone",
          desc: "Services publish domain events to dedicated topics instead of calling each other synchronously. Consumers process at their own pace, and a slow email provider can never block a checkout.",
          facts: [["Topics", "admin_topic · ambassador_topic · checkout_topic · email_topic"], ["Example events", "order_created · link_created · product_created"], ["Why it matters", "Retries, replay, and failure isolation"]]
        }
      ]
    },
    {
      label: "Data and integrations",
      nodes: [
        {
          id: "mysql", title: "MySQL", icon: "database", kind: "infra", span: 3,
          role: "Relational source of truth",
          desc: "Each service keeps its relational data in MySQL — users, catalog, links, commissions, and orders. Services own their tables rather than reaching into each other's data.",
          facts: [["Used by", "All five services"], ["Schema", "Owned per service"], ["In demo", "Not used — the demo stores state in localStorage"]]
        },
        {
          id: "redis", title: "Redis", icon: "bolt", kind: "infra", span: 3,
          role: "Cache and session support",
          desc: "The ambassador service's production stack wires in Redis for fast reads and session support. It is infrastructure, not a source of truth.",
          facts: [["Used by", "Ambassador service stack"], ["Role", "Cache and session support"], ["Failure mode", "Degraded reads, not lost commissions"]]
        },
        {
          id: "stripe", title: "Stripe Checkout", icon: "card", kind: "external", span: 3,
          role: "Payment sessions",
          desc: "Stripe Checkout collects payment in test mode, with keys read from the environment. Connect transfers and payout batches are not implemented in the Go services yet — the payouts screen is a simulation.",
          facts: [["Mode", "Test keys by default"], ["Used by", "Checkout service"], ["Not yet", "Connect transfers and payouts"]]
        },
        {
          id: "smtp", title: "SMTP / Mailtrap", icon: "mail", kind: "external", span: 3,
          role: "Outbound email delivery",
          desc: "The email consumer talks to any SMTP provider. Mailtrap is the development default; production would use a transactional email service.",
          facts: [["Used by", "Email service"], ["Dev default", "Mailtrap sandbox"], ["Config", "Environment variables only"]]
        }
      ]
    }
  ];

  function initArchitecture() {
    var canvas = $("#arch-canvas");
    var title = $("#arch-title");
    var role = $("#arch-role");
    var copy = $("#arch-copy");
    var facts = $("#arch-facts");
    if (!canvas || !title) return;

    var flat = [];

    canvas.innerHTML = archRows.map(function (row) {
      return '<div class="arch-row-label">' + row.label + "</div>" + row.nodes.map(function (node) {
        flat.push(node);
        var classes = "arch-node" + (node.bus ? " bus" : "") + (node.kind === "infra" ? " infra" : "") + (node.kind === "external" ? " external" : "") + " span-" + node.span;
        return '<button class="' + classes + '" type="button" data-node="' + node.id + '" aria-pressed="false">' +
          '<span class="node-icon">' + icon(node.icon, 13) + "</span>" +
          "<strong>" + node.title + "</strong><span>" + node.role + "</span>" +
          (node.bus ? "<span>" + node.facts[1][1] + "</span>" : "") +
          "</button>";
      }).join("");
    }).join("");

    function selectNode(id) {
      var node = flat.filter(function (item) { return item.id === id; })[0];
      if (!node) return;
      $$(".arch-node", canvas).forEach(function (button) {
        button.setAttribute("aria-pressed", button.dataset.node === id ? "true" : "false");
      });
      title.textContent = node.title;
      role.textContent = node.role;
      copy.textContent = node.desc;
      facts.innerHTML = node.facts.map(function (fact) {
        return "<div><b>" + fact[0] + "</b><span>" + fact[1] + "</span></div>";
      }).join("");
    }

    canvas.addEventListener("click", function (event) {
      var button = event.target.closest(".arch-node");
      if (button) selectNode(button.dataset.node);
    });

    selectNode("checkout");
  }

  /* ---------- boot ---------- */

  initTheme();
  initHeader();
  initReveal();
  initDemo();
  initQuiz();
  initRoi();
  initArchitecture();
})();
