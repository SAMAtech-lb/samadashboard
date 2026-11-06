// All the words on the site. Edit here, then run: node tools/build.mjs

export const SITE = {
  url: "https://samatechlb.com",
  name: "SAMA",
  email: "info@samatechlb.com",
  // Fill this in (for example "+961 70 123 456") and rebuild: the WhatsApp links appear by themselves.
  whatsapp: "",
  city: "Beirut",
  country: "Lebanon",
  sameAs: ["https://github.com/SAMAtech-lb"],
  founder: {
    name: "Ahmad Ghzayel",
    sameAs: ["https://github.com/AhmadGh18", "https://www.linkedin.com/in/ahmad-ghzayel-043249237/"],
  },
  updated: "2026-11-03",
};

export const CATEGORIES = {
  "Landing page": {
    slug: "landing-pages", label: "Landing pages", tab: "Landing page designs",
    title: "Landing Page Design in Lebanon: Live Demos | SAMA",
    meta: "Landing page designs by SAMA, a web studio in Beirut, Lebanon. Open live demos for software, shipping, telecom and fintech companies on any screen.",
    h1: "Landing page <em>design</em> in Lebanon",
    intro: "A landing page has one job: get a visitor to call, book or buy. These demos cover software, shipping, telecom and fintech companies. Each one shows how we explain a technical product quickly, with the offer at the top and the proof right after it.",
    suits: "This layout suits a company with one clear offer and paid ads or social posts sending people to it. The message comes first, the proof follows, and there is always a way to get in touch within reach.",
  },
  "E-commerce": {
    slug: "ecommerce-websites", label: "E-commerce", tab: "Online store designs",
    title: "E-commerce Website Design in Lebanon: Demos | SAMA",
    meta: "Online store designs by SAMA in Beirut, Lebanon. Try live demos with filters, cart and checkout for fashion, electronics, furniture and watch shops.",
    h1: "E-commerce website <em>design</em> in Lebanon",
    intro: "These online store demos work the way a real shop has to: filters that narrow the list, product pages with sizes and photos, a cart, and a checkout flow you can click through. They cover fashion, electronics, furniture and luxury watches.",
    suits: "This design suits a shop that wants to sell directly instead of only through social media. Customers can browse the full range, choose a size or option, and finish the order on their phone.",
  },
  Business: {
    slug: "business-websites", label: "Business", tab: "Business website designs",
    title: "Business Website Design in Lebanon: Demos | SAMA",
    meta: "Business website designs by SAMA in Beirut, Lebanon. Live demos for clinics, hotels, real estate, car dealers, tailors and architecture firms.",
    h1: "Business website <em>design</em> in Lebanon",
    intro: "A business website should answer what you do, where you are and how to reach you, and then let people take the next step. These demos include clinic appointment booking, hotel availability, property search with a map, car inventory filters and enquiry forms.",
    suits: "This design suits a local business whose customers compare options before they call. Services, prices or listings are easy to find, and booking or asking a question takes only a few taps.",
  },
  Portfolio: {
    slug: "portfolio-websites", label: "Portfolios", tab: "Portfolio website designs",
    title: "Portfolio Website Design in Lebanon: Demos | SAMA",
    meta: "Personal portfolio websites by SAMA in Beirut, Lebanon. Live demos for developers, designers, engineers, lawyers, accountants and filmmakers.",
    h1: "Portfolio website <em>design</em> in Lebanon",
    intro: "Your portfolio is often the first thing a client or employer checks. These demos are built around different professions, from developers and designers to engineers, lawyers, accountants and filmmakers, because each one needs to prove something different.",
    suits: "This design suits a professional who wins work on reputation. It puts your best projects and your way of working first, then makes it simple for the right person to contact you.",
  },
  Dashboard: {
    slug: "dashboards", label: "Dashboards", tab: "Dashboard designs",
    title: "Admin Dashboard Design in Lebanon: Live Demo | SAMA",
    meta: "Admin dashboard design by SAMA in Beirut, Lebanon. Open a live demo with sales charts, an orders table and dark mode, then plan a panel for your team.",
    h1: "Admin dashboard <em>design</em> in Lebanon",
    intro: "A good admin panel saves your team time every day. This demo is an e-commerce back office with sales charts, an orders table and dark mode. We design and build panels like it around the numbers and tasks your staff actually use.",
    suits: "This design suits a team that runs orders, stock or customers from spreadsheets and has outgrown them. The figures that matter sit on the first screen, and everyday tasks stay a click away.",
  },
  Restaurant: {
    slug: "restaurant-websites", label: "Restaurants", tab: "Restaurant website designs",
    title: "Restaurant Website Design in Lebanon: Demos | SAMA",
    meta: "Restaurant and café websites by SAMA in Beirut, Lebanon. Live demos with menus, online ordering, table booking and opening hours that show on phones.",
    h1: "Restaurant website <em>design</em> in Lebanon",
    intro: "People look up a restaurant on their phone, usually to check the menu, the hours or how to order. These demos for a coffee house, a pizzeria and a fast-food brand put those answers up front, with menu tabs, ordering and table booking.",
    suits: "This design suits a restaurant or café that wants a menu people can read on a phone, plus ordering or booking that does not depend on someone answering messages at a busy hour.",
  },
};

export const SERVICES = [
  {
    slug: "web-design-lebanon", tab: "Web design",
    icon: "Web design and development",
    title: "Web Design Company in Beirut, Lebanon | SAMA",
    meta: "SAMA designs and builds fast, mobile-friendly websites in Beirut, Lebanon. Fixed quote up front, weekly previews and SEO setup included at launch.",
    h1: "Web design <em>company</em> in Beirut, Lebanon",
    lead: "We design and build websites for businesses in Lebanon and abroad: company sites, landing pages, portfolios and online stores. You get one fixed quote, a live preview every week and a site that is ready for Google on launch day.",
    short: "Fast, responsive websites and landing pages that turn visitors into customers.",
    includes: ["Business and company websites", "Landing pages", "Personal and professional portfolios", "Restaurant, clinic and hotel websites", "Contact, booking and quote forms", "On-page SEO and analytics setup"],
    sections: [
      { h: "A website built for the people searching for you", p: "Most of your visitors will arrive on a phone, often on a mobile connection, and decide within seconds whether to stay. So we start with what they came to find, keep pages light, and test on real screen sizes before you see anything. A clear page that opens quickly does more for your business than any effect on top of it." },
      { h: "What makes a site show up on Google", p: "Search engines need to read your pages, understand what you do and where you are, and trust the result. We build every page as real, readable HTML with a clear title, description and headings. We add structured data for your business, a sitemap and working social previews. We also write pages around the words your customers actually use, such as your service and your city, instead of slogans. Ranking takes time and depends on your market too, so we explain what will help after launch, including your Google Business Profile and getting other sites to link to you." },
      { h: "English, Arabic or both", p: "Many businesses in Lebanon serve customers in more than one language. We can plan your site in English, in Arabic with right-to-left layout, or in both, with each language on its own address so Google can show the right version to the right person." },
      { h: "You know the price before we start", p: "We start with a free call about your goals, audience and budget. You leave it with a clear plan and a fixed quote that does not grow halfway through. You review the design before any code is written, then follow the build through a live preview link every week." },
    ],
    faq: [
      { q: "How much does a website cost in Lebanon?", a: "It depends on the number of pages and what the site has to do. A one-page landing site costs far less than a store with online checkout. Tell us what you need and we will reply within 24 hours with a fixed quote, so the price is agreed before work starts." },
      { q: "How long does it take to build a website?", a: "It depends on the size of the site and how quickly content and approvals arrive. We give you a timeline with your quote, and you can follow progress through a live preview link every week." },
      { q: "Will my website rank first on Google?", a: "Nobody can honestly promise a first position, because Google decides and your competitors matter. What we can promise is a fast site with correct technical SEO and clear content, plus a plan for what to do after launch." },
      { q: "Do you work with clients outside Lebanon?", a: "Yes. We are based in Beirut and work with clients anywhere. Calls, previews and approvals all happen online." },
    ],
    categories: ["Business", "Landing page", "Portfolio"],
    examples: ["clinic-stride", "hotel-azure", "agency-atlas"],
  },
  {
    slug: "ecommerce-website-lebanon", tab: "E-commerce websites",
    title: "E-commerce Website Design in Lebanon | SAMA",
    meta: "Sell online with an e-commerce website from SAMA in Beirut, Lebanon. Product filters, cart, checkout and order options planned around how you sell.",
    h1: "E-commerce websites for <em>shops</em> in Lebanon",
    lead: "We build online stores that make it easy to find a product and finish an order on a phone. Your range stays in one place, instead of being buried in social media posts and answered one message at a time.",
    short: "Online stores with filters, product pages, cart and checkout that work on any phone.",
    includes: ["Product catalogue and categories", "Search and filters", "Product pages with sizes and options", "Cart and checkout flow", "Order options planned around your business", "Product SEO and structured data"],
    sections: [
      { h: "Sell beyond your Instagram page", p: "Social media is good for being discovered, but poor for browsing. Customers cannot filter by size, compare two products or see what is in stock without sending a message. A store handles those questions all day, and each product gets its own page that can appear on Google when someone searches for it." },
      { h: "Checkout that fits how you take orders", p: "Payment and delivery differ from one business to another, especially in Lebanon. Before we build, we go through how you take money today and how orders reach customers. Then we plan checkout around that, whether it means cash on delivery, orders confirmed on WhatsApp, or card payment through a provider available to your business." },
      { h: "Photos and speed go together", p: "A store is only as good as its product photos, and large photos are the most common reason a store feels slow. We prepare images in modern formats at the right sizes, so products look sharp while pages stay quick on a phone." },
      { h: "Try the demos yourself", p: "Our store demos are real builds you can click through, with filters, product views, a cart and checkout. Open one on your phone to see how it feels for a customer, then tell us what to change for your own range." },
    ],
    faq: [
      { q: "Can customers pay cash on delivery?", a: "Yes, we can build that into checkout. We agree on how you take payment before the build starts, including cash on delivery, WhatsApp confirmation or card payment where a suitable provider is available to you." },
      { q: "Can I add and edit products myself?", a: "That depends on the setup we agree for your store. If you plan to change products often, tell us at the start so we can include a way for you to manage them without calling a developer." },
      { q: "Can you move my shop from Instagram to a website?", a: "Yes. Send us your products, prices and photos, and we will organise them into categories with a page for each product." },
    ],
    categories: ["E-commerce"],
    examples: ["shop-norde", "shop-brightbyte", "shop-nook"],
  },
  {
    slug: "mobile-app-development-lebanon", tab: "Mobile app development",
    title: "Mobile App Development in Lebanon | SAMA",
    meta: "SAMA builds iOS and Android apps, web apps and dashboards in Beirut, Lebanon. Flutter, Swift and Kotlin, with backend integration and a fixed quote.",
    h1: "Mobile app <em>development</em> in Lebanon",
    lead: "We build iOS and Android apps, web apps and admin dashboards for businesses that have outgrown spreadsheets and group chats. One team handles the design, the code and the launch, and you know the price before it starts.",
    short: "iOS and Android apps, web apps and dashboards built to grow with your business.",
    includes: ["iOS and Android apps", "Cross-platform apps with Flutter", "Native work in Swift and Kotlin", "Web apps and admin dashboards", "API and backend integration", "App design and prototypes"],
    sections: [
      { h: "First, check whether you need an app", p: "An app is a good choice when people will use it repeatedly, or when it needs phone features such as notifications or the camera. If customers will only visit occasionally, a fast website may serve them better and cost less. We will tell you which one fits on the first call, even when the answer is the smaller project." },
      { h: "Cross-platform or native", p: "Flutter lets one codebase run on both iPhone and Android, which usually makes it the practical choice for a first version. Swift and Kotlin make sense when an app relies heavily on device features or needs the closest fit with each platform. We explain the trade-off for your project in plain language and recommend one." },
      { h: "Start small, then grow", p: "The first version should do the most important job well and reach real users quickly. We prototype the main screens so you can test the flow before development begins. What people actually do in the app then guides the next set of features." },
      { h: "A panel for your team", p: "Most apps also need a place to manage orders, users or content. We build web dashboards that show your team the figures they check every day. Open our admin demo to see an example with charts and an orders table." },
    ],
    faq: [
      { q: "How much does a mobile app cost?", a: "It depends on the screens, the features and whether you need a backend and an admin panel. We scope it with you on a free call and send a fixed quote." },
      { q: "Should I build for iPhone or Android first?", a: "With Flutter you usually do not have to choose, since one codebase can serve both. If a project needs native code, we look at where your customers are and start there." },
      { q: "Will you publish the app to the stores?", a: "Yes, we handle the launch with you. The App Store and Google Play each need a developer account in your name, so the app stays yours." },
    ],
    categories: ["Dashboard"],
    examples: ["dashboard-kora", "landing-orra"],
  },
  {
    slug: "ui-ux-design-lebanon", tab: "UI/UX design",
    title: "UI/UX Design Studio in Lebanon | SAMA",
    meta: "UI/UX design in Beirut, Lebanon by SAMA. User flows, wireframes, Figma prototypes and design systems for websites and apps, reviewed before any code.",
    h1: "UI/UX design <em>studio</em> in Lebanon",
    lead: "We plan how a website or app should work, then design every screen in Figma. You see and approve it all before development begins, when changes are still quick and cheap.",
    short: "User flows, wireframes and interfaces that are easy and enjoyable to use.",
    includes: ["User flows and wireframes", "Interface design in Figma", "Interactive prototypes", "Design systems", "Usability reviews of existing products", "Developer handoff, or the full build with us"],
    sections: [
      { h: "UX is how it works, UI is how it looks", p: "UX design decides what a person needs to do and the shortest route to doing it. UI design is the visual layer on top: type, colour, spacing and buttons. A product needs both. A beautiful screen that confuses people still loses customers, and we look at those problems first." },
      { h: "Test the idea before paying to build it", p: "A clickable prototype feels like the finished product and takes far less time to make. You can show it to customers, partners or investors, watch where people get stuck and fix it while it is still only a design." },
      { h: "A review of what you already have", p: "If your site or app is live but people drop off, we can go through the main journeys and show you where and why it happens. You receive a clear list of fixes ranked by impact, which your own team or ours can then work through." },
      { h: "Design and code under one roof", p: "Because the same team designs and builds, what you approve is what ships. Screens are designed with real content and real devices in mind, so details do not get lost when the work moves into development." },
    ],
    faq: [
      { q: "What do I receive at the end?", a: "You receive the Figma files, a clickable prototype and any design system created for the project. If we also build it, you get the working product too." },
      { q: "Can you redesign an existing website or app?", a: "Yes. We usually start with a short review of what works and what does not, so the redesign fixes real problems rather than only changing how things look." },
      { q: "Do you work with our developers?", a: "Yes. We can hand designs over to your team with clear specifications, or we can build the project ourselves." },
    ],
    categories: ["Portfolio", "Landing page"],
    examples: ["portfolio-nora", "landing-orra", "shop-nook"],
  },
  {
    slug: "video-editing-lebanon", tab: "Video editing",
    title: "Video Editing Services in Lebanon | SAMA",
    meta: "Video editing in Beirut, Lebanon by SAMA: Reels, TikTok, YouTube, ads and brand films with colour grading, captions, motion graphics and clean sound.",
    h1: "Video editing <em>services</em> in Lebanon",
    lead: "Send us your footage and we will turn it into reels, ads, YouTube videos and brand films. We handle the cut, colour, captions, motion graphics and sound, so your story lands in the first three seconds.",
    short: "Reels, ads and brand films with colour grading, motion graphics and captions.",
    includes: ["Reels, TikTok and YouTube Shorts", "YouTube videos and brand films", "Ads and promo videos", "Motion graphics, logos and titles", "Colour grading and sound clean-up", "Captions for watching without sound"],
    sections: [
      { h: "Edited for where it will be watched", p: "A vertical reel and a long YouTube video follow different rules. Short video needs an immediate hook and a quick pace in 9:16, while long-form video has room to breathe in 16:9. We edit for the platform and export the correct formats, so you do not have one clip cropped badly into every shape." },
      { h: "Captions, because many people watch on mute", p: "Lots of people scroll with the sound off. Clear, well-timed captions keep them watching and make the video easier to understand. We style them to match your brand instead of using the same default look as everyone else." },
      { h: "Your brand in every frame", p: "Consistent colours, titles and logo animations make your videos recognisable before anyone reads your name. If we also build your website or app, your reels and your site will look like they come from the same company." },
      { h: "How it works", p: "Tell us the goal, the length and where the video will go, then share your footage through a link. We send back a first cut, take your notes, and deliver the final files for each platform. We edit in Premiere Pro and After Effects." },
    ],
    faq: [
      { q: "How do I send you my footage?", a: "A shared link from Google Drive, Dropbox or WeTransfer works well. Send original files where you can, because videos forwarded through messaging apps lose quality." },
      { q: "Do you also film videos?", a: "Our service is editing and motion graphics, so we work from footage that you supply or that you already have." },
      { q: "Can you edit a monthly batch of reels?", a: "Yes. Tell us how many videos you post each month and we will give you a fixed quote for the batch." },
    ],
    categories: ["Portfolio"],
    examples: ["portfolio-kai"],
  },
];

SERVICES.push({
  slug: "seo-services-lebanon", tab: "SEO services",
  title: "SEO Services in Lebanon | SAMA, Beirut",
  meta: "SEO services in Beirut, Lebanon by SAMA: technical fixes, on-page content, Google Business Profile setup and clear monthly reports. No fake ranking promises.",
  h1: "SEO <em>services</em> in Lebanon",
  lead: "We help your business show up when people in Lebanon search for what you sell. That means fixing what stops Google from reading your site, writing pages around the words your customers use, and setting up your Google Business Profile.",
  short: "Technical fixes, on-page content and local SEO that help customers find you on Google.",
  includes: ["Technical SEO audit and fixes", "Keyword research for your market", "Titles, descriptions and page content", "Structured data and sitemaps", "Google Business Profile setup", "Search Console setup and reports"],
  sections: [
    { h: "Start by finding out what is wrong", p: "We begin with an audit of your site: can Google crawl it, are pages indexed, how fast does it load on a phone, and which searches already bring you visitors. You get a short list of problems ranked by how much they matter, so the first work goes where it will help most." },
    { h: "Local SEO for businesses in Lebanon", p: "Searches like \"dentist in Beirut\" or \"restaurant near me\" often show a map before any website. We set up and complete your Google Business Profile, make sure your name, address and phone match everywhere they appear, and show you how to ask real customers for reviews. Many searches here also happen in Arabic, so we check which language your customers actually use before writing anything." },
    { h: "Pages written around real searches", p: "A page ranks when it answers what someone typed. We research the words people use for your service and city, then write or improve your titles, descriptions, headings and content to match. The writing stays natural and useful, because a page that sounds like a keyword list loses customers even if it gets the click." },
    { h: "What we will never promise", p: "Nobody can honestly guarantee first place on Google, because Google decides and your competitors matter. We also avoid shortcuts such as buying links or copying content, since they can get a site penalised. SEO usually takes months to show results, and we report what actually changed using your own Search Console data." },
  ],
  faq: [
    { q: "How long does SEO take to work?", a: "Technical fixes can help within weeks, once Google has crawled your pages again. Ranking for competitive searches usually takes several months, and it depends on your market and competitors." },
    { q: "Can you guarantee first place on Google?", a: "No, and be careful with anyone who does. We can promise honest work, correct technical setup, useful content and clear reports on what changed." },
    { q: "Do you do SEO for a website you didn't build?", a: "Yes. We start with an audit of your current site and tell you what can be fixed where it is, and whether anything needs rebuilding." },
    { q: "What do you need from me to start?", a: "Your website address, what you sell and where, and access to Google Search Console if you already have it. If you don't, we can set it up with you." },
  ],
  categories: ["Business"],
  examples: ["clinic-stride", "hotel-azure", "restaurant-saintroast"],
});

export const PROMISE = [
  ["A fixed quote, up front", "One price agreed on day one. It does not grow halfway through.", "price-tag-3-line"],
  ["Progress you can see weekly", "A live preview link every week, so you are never left wondering.", "calendar-check-line"],
  ["One person, always reachable", "Talk directly to the person building your project.", "user-smile-line"],
];

export const PROCESS = [
  ["Discover", "A free call about your goals, audience and budget. You leave with a clear plan and a fixed quote.", "chat-smile-2-line"],
  ["Design", "Wireframes and UI in Figma. You review and approve before a single line of code.", "pencil-ruler-2-line"],
  ["Build", "We develop, test on every device and share live previews so you see progress every week.", "code-s-slash-line"],
  ["Launch & grow", "We publish, set up analytics and SEO, and stay with you for updates and support.", "rocket-2-line"],
];

export const HOME_FAQ = [
  { q: "What does SAMA do?", a: "SAMA is a web design and development studio based in Beirut, Lebanon. We design and build websites, online stores, mobile apps and interfaces, we help businesses get found on Google, and we edit video for brands." },
  { q: "Are the websites on this page real?", a: "They are working demos that we designed and built, using fictional businesses. You can open each one and try it on desktop, tablet or mobile, then ask us to make a version for your own business." },
  { q: "How much does a website cost in Lebanon?", a: "It depends on the pages and features you need. We send one fixed quote within 24 hours of hearing about your project, and that price does not grow halfway through." },
  { q: "Can you make my website appear on Google?", a: "Yes, we set up every site so Google can read and understand it, and we show you how to verify it in Search Console. No honest studio can guarantee a first position, but a fast and clear site gives you a strong start." },
  { q: "Do you only work with businesses in Lebanon?", a: "No. We are based in Beirut and work with clients anywhere, with calls and previews handled online." },
];

export const ABOUT = {
  title: "About SAMA: Web Design Studio in Beirut, Lebanon",
  meta: "SAMA (سماء, Arabic for sky) is a web and app studio in Beirut, Lebanon, founded by full stack developer Ahmad Ghzayel. Meet the studio and how we work.",
  h1: "A small team with a <em>big sky.</em>",
  lead: "SAMA (سماء, Arabic for sky) is a creative tech studio in Beirut, Lebanon. We design and build websites, mobile apps and interfaces, and we edit video, all in one team.",
  sections: [
    { h: "Why one team matters", p: "When design, code and content sit in different places, decisions slow down and brands start to look different from one channel to the next. Keeping them together means faster answers and a business that looks the same on its website, its app and its reels." },
    { h: "Who is behind SAMA", p: "SAMA was founded by Ahmad Ghzayel, a full stack developer with a BSc in Computer Science from the Lebanese International University and an Odoo certification. When you work with us, you can talk directly to the person building your project." },
    { h: "How we like to work", p: "We prefer to be plain about things. You get a fixed quote before work begins, a preview link every week and straight answers, including when a smaller project would serve you better than the one you first asked about." },
    { h: "Why you can try our work first", p: "Everything in our library is a working build, not a picture of one. The businesses in the demos are fictional, but the booking flows, filters and checkouts are real code you can click through on your own phone before you ever talk to us." },
  ],
};

export const HOME_SERVICES = [
  { i: "layout-masonry-line", t: "Web Development", slug: "web-design-lebanon", more: "Web design in Lebanon", d: "Fast, responsive websites, landing pages and online stores that turn visitors into customers.", pts: [["Business & portfolio sites"], ["Landing pages", "work/landing-pages"], ["E-commerce stores", "ecommerce-website-lebanon"], ["SEO & performance"]] },
  { i: "pen-nib-line", t: "UI/UX Design", slug: "ui-ux-design-lebanon", more: "UI/UX design services", d: "User research, wireframes and pixel-perfect interfaces that are easy and enjoyable to use.", pts: [["Wireframes & user flows"], ["Design systems"], ["Interactive prototypes"], ["Usability reviews"]] },
  { i: "smartphone-line", t: "Mobile & App Development", slug: "mobile-app-development-lebanon", more: "Mobile app development", d: "iOS and Android apps, plus web apps and dashboards, built to scale with your business.", pts: [["iOS & Android apps"], ["Cross-platform (Flutter)"], ["Web apps & dashboards", "work/dashboards"], ["API & backend integration"]] },
  { i: "film-line", t: "Video Editing", slug: "video-editing-lebanon", more: "Video editing services", d: "Scroll-stopping reels, ads and brand videos with colour grading, motion graphics and captions.", pts: [["Reels, TikTok & Shorts"], ["YouTube & brand films"], ["Motion graphics"], ["Colour & sound"]] },
];

HOME_SERVICES.push({ i: "search-eye-line", t: "SEO", slug: "seo-services-lebanon", more: "SEO services in Lebanon", d: "Technical fixes, useful content and local SEO that help customers find your business on Google.", pts: [["Technical audits & fixes"], ["Keyword research"], ["On-page content"], ["Google Business Profile"]] });

export const WHY = [
  ["palette-line", "Design-first", "Every project starts with UI/UX, not code."],
  ["smartphone-line", "Mobile-perfect", "Tested on phones, tablets and desktops."],
  ["flashlight-line", "Fast & SEO-ready", "Clean code that loads quickly and is built for search."],
  ["customer-service-2-line", "Real support", "We're here after launch, not just before."],
];

export const FORMATS = [
  ["smartphone-line", "Reels & TikTok", "9:16 · 15–60s"],
  ["youtube-line", "YouTube videos", "16:9 · long-form"],
  ["advertisement-line", "Ads & promos", "All platforms"],
  ["magic-line", "Motion graphics", "Logos · titles"],
];

export const SHOW = [
  ["agency-atlas", "Atlas Labs", "Software company"],
  ["shop-norde", "Norde", "Fashion store"],
  ["realestate-havenly", "Havenly", "Real estate"],
  ["portfolio-rami", "Rami Aziz", "Developer portfolio"],
  ["landing-portline", "Portline Logistics", "Logistics platform"],
];
