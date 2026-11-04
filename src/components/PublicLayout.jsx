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
const pageFromPath = (pathname) =>
  pages.find((p) => p.path === pathname)?.slug || "home";
function Socials({ settings, footer = false }) {
  const items = footer ? footerSocials : socials;

  return (
    <div className="social-list">
      {items
        .filter(([key]) => Boolean(settings[key]))
        .map(([key, label, img]) => (
          <a
            key={key}
            target="_blank"
            rel="noopener noreferrer"
            href={settings[key]}
            aria-label={label}
          >
            <img src={img} alt={label} />
          </a>
        ))}
    </div>
  );
}
function Brand({ settings, footer = false }) {
  return (
    <Link
      to="/"
      className={`brand ${footer ? "footer-brand" : ""}`}
      aria-label="Packaging Times home"
    >
      <div className="brand-logo-line">
        <span className="brand-wordmark">Packaging Times</span>
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
  const nav = pages.filter((p) => p.slug !== "home");
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
          {nav.map((p) => (
            <NavLink onClick={() => setOpen(false)} to={p.path} key={p.slug}>
              {p.label}
            </NavLink>
          ))}
        </nav>
        <div className="supplier-heading supplier-heading-right">
          Services and Suppliers
        </div>
      </div>
    </header>
  );
}
function AdPosition({ banner, slot }) {
  if (!banner) {
    return <div className="ad-empty" aria-hidden="true" />;
  }
  const img = (
    <img
      className="ad-image"
      src={assetUrl(banner.imageUrl)}
      alt={banner.altText || banner.title}
      loading="lazy"
    />
  );
  return (
    <div className="ad-filled">
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
function AdColumn({ side, banners }) {
  return (
    <aside
      className={`ad-column ${side}`}
      aria-label={`${side} advertisement banners`}
    >
      {Array.from({ length: 4 }, (_, i) => {
        const slot = `${side}-${i + 1}`;
        return <AdPosition key={slot} slot={slot} banner={banners[slot]} />;
      })}
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
  const [settings, setSettings] = useState(defaults),
    [banners, setBanners] = useState({}),
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
    Promise.all([api(`/public/banners?page=${slug}`), api("/public/news")])
      .then(([ads, articles]) => {
        if (active) {
          setBanners(ads || {});
          setNews(articles || []);
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
        if (active) setLoading(false);
      });
    return () => (active = false);
  }, [slug]);
  return (
    <>
      <Header settings={settings} />
      <main className="site-grid">
        <AdColumn side="left" banners={banners} />
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
          {(banners["bottom-1"] || banners["bottom-2"]) && (
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
          {offline && (
            <p className="backend-warning" role="status">
              Backend offline. Run the server and MongoDB to load live updates.
            </p>
          )}
        </section>
        <AdColumn side="right" banners={banners} />
      </main>
      <Footer settings={settings} />
    </>
  );
}
