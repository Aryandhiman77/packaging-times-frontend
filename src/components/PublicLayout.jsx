import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X as CloseIcon } from "lucide-react";
import { api, assetUrl, defaults, pages } from "../lib/api.js";
import { PublicContent, StoryPage } from "../pages/PublicPages.jsx";
const socials = [
  ["x", "X", "/images/social-x.png"],
  ["facebook", "Facebook", "/images/social-facebook.png"],
  ["youtube", "YouTube", "/images/social-youtube.jpg"],
  ["linkedin", "LinkedIn", "/images/social-linkedin.jpg"],
];
const footerSocials = [
  ["x", "X", "/images/footer-social-x.jpg"],
  ["facebook", "Facebook", "/images/footer-social-facebook.png"],
  ["youtube", "YouTube", "/images/footer-social-youtube.jpg"],
  ["linkedin", "LinkedIn", "/images/footer-social-linkedin.jpg"],
];

const navDropdowns = {
  subscribe: [
    ["Subscribe Sign Up", "/subscribe-free"],
    ["Packaging Brief", "/packaging-brief"],
    ["Manage Subscription", "/manage-subscription"],
  ],
  flexibles: [
    ["Flexible Packaging", "/flexibles?page=flexible-packaging"],
    ["Bags & Pouches", "/flexibles?page=bags-pouches"],
    ["Films & Rollstock", "/flexibles?page=films-rollstock"],
    ["Coffee & Specialty Food Packaging", "/flexibles?page=coffee-specialty-food-packaging"],
    ["Printing, Closures & Converting", "/flexibles?page=printing-closures-converting"],
  ],
  rigid: [
    ["Rigid Packaging", "/rigid?page=rigid-packaging"],
    ["Retail Folding Cartons", "/rigid?page=retail-folding-cartons"],
    ["POS / Counter Display Cartons", "/rigid?page=pos-counter-display-cartons"],
    ["Bottles, Jars & Containers", "/rigid?page=bottles-jars-containers"],
    ["Tins, Tumblers & Specialty Packaging", "/rigid?page=tins-tumblers-specialty-packaging"],
    ["Corrugated & Shipping Packaging", "/rigid?page=corrugated-shipping-packaging"],
  ],
  advertising: [
    ["Advertise With Packaging Times", "/advertising"],
    ["Display Advertising", "/advertising?page=display-advertising"],
    ["Featured Company / Sponsored Story", "/advertising?page=featured-company-sponsored-story"],
    ["Advertising Rates & Availability", "/advertising?page=advertising-rates-availability"],
  ],
  trends: [
    ["Packaging Trends", "/trends?page=packaging-trends"],
    ["New Packaging Concepts", "/trends?page=new-packaging-concepts"],
    ["Materials & Sustainability", "/trends?page=materials-sustainability"],
    ["Printing, Graphics & Finishing", "/trends?page=printing-graphics-finishing"],
    ["AI, Automation & Smart Packaging", "/trends?page=ai-automation-smart-packaging"],
    ["Manufacturing & Supply Chain", "/trends?page=manufacturing-supply-chain"],
  ],
};
const pageFromPath = (pathname) =>
  pages.find((p) => p.path === pathname)?.slug || "home";
function Socials({ settings, footer = false }) {
  const items = footer ? footerSocials : socials;

  return (
    <div className="social-list">
      {items.map(([key, label, img]) => (
          <a
            key={key}
            target={settings[key] ? "_blank" : undefined}
            rel={settings[key] ? "noopener noreferrer" : undefined}
            href={settings[key] || undefined}
            aria-label={label}
            aria-disabled={settings[key] ? undefined : "true"}
          >
            <img src={img} alt={label} />
          </a>
        ))}
    </div>
  );
}

function Brand({ settings, footer = false }) {
  const logoSrc = footer
    ? "/images/pt-footer-logo-pdf.jpg"
    : "/images/pt-header-logo-pdf.jpg";

  return (
    <Link
      to="/"
      className={`brand pt-pdf-brand ${footer ? "footer-brand" : ""}`}
      aria-label="Packaging Times home"
    >
      <div className="brand-logo-line">
        <img
          className="pt-pdf-wordmark"
          src={logoSrc}
          alt=""
          width="514"
          height="76"
          draggable="false"
        />

        <span className="brand-com">.com</span>
      </div>

      <span className="brand-tagline">
        {settings.tagline || defaults.tagline}
      </span>
    </Link>
  );
}

function Header({ settings }) {
  const [open, setOpen] = useState(false);
  const nav = pages.filter((p) => !p.hidden);

  const closeNavigation = () => {
    setOpen(false);
  };

  return (
    <header className="site-header">
      <div className="top-gradient" />
      <div className="masthead lines-bg">
        <Link to="/subscribe-free" className="signup-chip">
          <span>Sign Up • Subscribe for</span>
          <strong>FREE</strong>
        </Link>
        <Brand settings={settings} />
        <Socials settings={settings} footer />
      </div>
      <div className="nav-bar lines-bg">
        <div className="supplier-heading supplier-heading-left">
          Services and Suppliers
        </div>
        <button
          className="mobile-menu"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <CloseIcon size={20} /> : <Menu size={20} />}
        </button>
        <nav
          className={`main-nav ${open ? "is-open" : ""}`}
          aria-label="Main navigation"
        >
          {nav.map((p) => {
            const dropdown = navDropdowns[p.slug];

            if (!dropdown) {
              return (
                <NavLink onClick={closeNavigation} to={p.path} key={p.slug}>
                  {p.label}
                </NavLink>
              );
            }

            return (
              <div className="nav-menu" key={p.slug}>
                <div className="nav-menu-trigger">
                  <NavLink onClick={closeNavigation} to={p.path}>
                    {p.label}
                  </NavLink>
                </div>
                <div className="nav-dropdown" aria-label={`${p.label} pages`}>
                  {dropdown.map(([label, path]) => (
                    <Link key={path} onClick={closeNavigation} to={path}>
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
        <div className="supplier-heading supplier-heading-right">
          Services and Suppliers
        </div>
      </div>
    </header>
  );
}
function AdPosition({ banner, slot, loading = false }) {
  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    setImageReady(false);
  }, [banner?._id, banner?.imageUrl]);

  if (loading) {
    return (
      <div
        className="ad-filled ad-is-loading"
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label={`Loading ${slot} advertisement`}
      >
        <div className="ad-skeleton-surface" aria-hidden="true" />
      </div>
    );
  }

  if (!banner) {
    return <div className="ad-empty" aria-hidden="true" />;
  }
  const img = (
    <img
      className={`ad-image ${imageReady ? "is-ready" : ""}`}
      src={assetUrl(banner.imageUrl)}
      alt={banner.altText || banner.title}
      loading="lazy"
      onLoad={() => setImageReady(true)}
      onError={() => setImageReady(true)}
    />
  );
  return (
    <div className={`ad-filled ${imageReady ? "" : "ad-is-loading"}`}>
      {!imageReady && (
        <div className="ad-skeleton-surface" aria-hidden="true" />
      )}
      {banner.targetUrl ? (
        <a
          href={banner.targetUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          aria-label={banner.title}
        >
          {img}
        </a>
      ) : (
        img
      )}
    </div>
  );
}
function AdColumn({ side, banners, loading = false }) {
  return (
    <aside
      className={`ad-column ${side}`}
      aria-label={`${side} advertisement banners`}
    >
      {Array.from({ length: 4 }, (_, i) => {
        const slot = `${side}-${i + 1}`;
        return (
          <AdPosition
            key={slot}
            slot={slot}
            banner={banners?.[slot]}
            loading={loading}
          />
        );
      })}
    </aside>
  );
}

const mobileAdSlotOrder = [
  "left-1",
  "right-1",
  "left-2",
  "right-2",
  "left-3",
  "right-3",
  "left-4",
  "right-4",
  "bottom-1",
  "bottom-2",
];

function MobileAdGrid({ banners, loading = false }) {
  const slots = loading
    ? mobileAdSlotOrder.slice(0, 4)
    : mobileAdSlotOrder.filter((slot) => banners?.[slot]).slice(0, 4);

  if (!slots.length) return null;

  return (
    <aside className="mobile-ad-grid" aria-label="Advertisement banners">
      {slots.map((slot) => (
        <AdPosition
          key={slot}
          slot={slot}
          banner={banners?.[slot]}
          loading={loading}
        />
      ))}
    </aside>
  );
}

function Footer({ settings }) {
  const address = settings.mailingAddress || defaults.mailingAddress;
  const [addressLead, ...addressRest] = address.split(",");
  return (
    <footer className="site-footer lines-bg">
      <div className="footer-main lines-bg">
        <nav className="footer-nav" aria-label="Footer navigation">
          <Link to="/subscribe-free">
            <span className="footer-bullet" aria-hidden="true">
              •
            </span>
            Subscribe <b className="free-label">FREE</b>
          </Link>
          <Link to="/flexibles">
            <span className="footer-bullet" aria-hidden="true">
              •
            </span>
            Flexibles
          </Link>
          <Link to="/rigid">
            <span className="footer-bullet" aria-hidden="true">
              •
            </span>
            Rigid
          </Link>
          <Link to="/advertising">
            <span className="footer-bullet" aria-hidden="true">
              •
            </span>
            <b>Advertising</b>
          </Link>
          <Link to="/trends">
            <span className="footer-bullet" aria-hidden="true">
              •
            </span>
            Trends
          </Link>
          <Link to="/contact-us">
            <span className="footer-bullet" aria-hidden="true">
              •
            </span>
            Contact Us
          </Link>
        </nav>
        <Brand settings={settings} footer />
        <address className="footer-contact">
          <span className="mailing-label">Mailing Address:</span>
          <Socials settings={settings} footer />
          <strong className="footer-address">
            <span>{addressLead.trim()}</span>
            {addressRest.length > 0 && (
              <span>{addressRest.join(",").trim()}</span>
            )}
          </strong>
          <span className="email-label">E-Mail:</span>
          <span className="footer-emails">
            <a href={`mailto:${settings.advertisingEmail}`}>
              {settings.advertisingEmail}
            </a>
            <a href={`mailto:${settings.trendingEmail}`}>
              {settings.trendingEmail}
            </a>
          </span>
        </address>
      </div>
      <div className="bottom-gradient" />
      <div className="copyright">
        <span>Packaging Times Publishing</span>
        <span>Copyright&nbsp; © &nbsp;{new Date().getFullYear()}</span>
        <span>All Rights Reserved</span>
      </div>
    </footer>
  );
}
export default function PublicLayout() {
  const { pathname, search } = useLocation();
  const slug = pageFromPath(pathname);
  const documentPage = [
    "subscribe",
    "subscription-thanks",
    "manage-subscription",
  ].includes(slug);
  const [settings, setSettings] = useState(defaults),
    [banners, setBanners] = useState({}),
    [bannersLoading, setBannersLoading] = useState(true),
    [news, setNews] = useState([]),
    [offline, setOffline] = useState(false),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    api("/public/settings")
      .then((s) => {
        if (active && s) setSettings({ ...defaults, ...s });
      })
      .catch(() => {
        if (active) setOffline(true);
      });
    return () => (active = false);
  }, []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setBannersLoading(!documentPage);

    if (documentPage) {
      setBanners({});
      setBannersLoading(false);
    } else {
      // Home page 1 is the default advertisement set across the website.
      // Only Home's Continue flow can request a different story-specific set.
      const bannerQuery = new URLSearchParams({ page: "home" });
      const selectedContentPage = new URLSearchParams(search).get("page");

      if (selectedContentPage && slug === "home") {
        bannerQuery.set("contentPage", selectedContentPage);
      }

      setBanners({});
      api(`/public/banners?${bannerQuery.toString()}`)
        .then((ads) => {
          if (active) {
            setBanners(ads || {});
            setOffline(false);
          }
        })
        .catch(() => {
          if (active) {
            setBanners({});
            setOffline(true);
          }
        })
        .finally(() => {
          if (active) setBannersLoading(false);
        });
    }

    // Fetch news once (the incoming version fetched it twice).
    api("/public/news")
      .then((articles) => {
        if (active) {
          setNews(articles || []);
        }
      })
      .catch(() => {
        if (active) setNews([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug, search, documentPage]);
  return (
    <>
      <Header settings={settings} />
      <main className={`site-grid ${documentPage ? "document-layout" : ""}`}>
        {!documentPage && (
          <AdColumn side="left" banners={banners} loading={bannersLoading} />
        )}
        <section className="page-middle" aria-label="Main content">
          {pathname.startsWith("/story/") ? (
            <StoryPage />
          ) : (
            <PublicContent
              page={slug}
              news={news}
              settings={settings}
              loading={loading}
              banners={banners}
            />
          )}
          {!documentPage && (banners["bottom-1"] || banners["bottom-2"]) && (
            <div className="bottom-ads dynamic-bottom-ads">
              {["bottom-1", "bottom-2"].map((slot) => (
                <div key={slot}>
                  {banners[slot] ? (
                    banners[slot].targetUrl ? (
                      <a
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        href={banners[slot].targetUrl}
                      >
                        <img
                          src={assetUrl(banners[slot].imageUrl)}
                          alt={banners[slot].altText || banners[slot].title}
                        />
                      </a>
                    ) : (
                      <img
                        src={assetUrl(banners[slot].imageUrl)}
                        alt={banners[slot].altText || banners[slot].title}
                      />
                    )
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
        {!documentPage && (
          <MobileAdGrid banners={banners} loading={bannersLoading} />
        )}
        {!documentPage && (
          <AdColumn side="right" banners={banners} loading={bannersLoading} />
        )}
      </main>
      <Footer settings={settings} />
    </>
  );
}
