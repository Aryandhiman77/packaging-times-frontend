import React, { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import { ArrowRight, Check, Mail } from "lucide-react";

import { api, friendlyDate } from "../lib/api.js";

import Seo from "../components/Seo.jsx";

export function PublicContent({ page, news, settings }) {
  if (page === "home") {
    return <Home news={news} settings={settings} />;
  }

  if (page === "flexibles") {
    return <StoryIndex news={news} category="Flexibles" />;
  }

  if (page === "rigid") {
    return <StoryIndex news={news} category="Rigid" />;
  }

  if (page === "trends") {
    return <StoryIndex news={news} category="Trends" />;
  }

  if (page === "advertising") {
    return <Advertising />;
  }

  if (page === "subscribe") {
    return <Subscription />;
  }

  if (page === "contact") {
    return <ContactPage settings={settings} />;
  }

  return <Home news={news} settings={settings} />;
}

function StoryList({ stories, compact = false }) {
  return (
    <div className={`story-list ${compact ? "compact" : ""}`}>
      {stories.map((story) => (
        <article key={story._id} className="story-card">
          <span className="story-category">{story.category}</span>

          <h3>
            <Link to={`/story/${story.slug}`}>{story.title}</Link>
          </h3>

          <p>{story.excerpt}</p>

          <div className="story-meta">
            <time>{friendlyDate(story.publishedAt)}</time>

            <Link to={`/story/${story.slug}`}>
              Continue Reading
              <ArrowRight size={14} />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

function Home({ news, settings }) {
  return (
    <div className="home-center">
      <h1 className="home-title">{settings.heroHeading}</h1>

      {news.length ? (
        <>
          <div className="news-intro">{settings.heroIntro}</div>

          <StoryList stories={news.slice(0, 5)} compact />
        </>
      ) : (
        <div className="home-concept">
          <p className="news-empty-title">Packaging News & Supplier Guide</p>

          <p className="news-empty-sub">
            Fresh packaging updates will appear here as you publish them from
            the admin panel.
          </p>
        </div>
      )}
    </div>
  );
}

function StoryIndex({ news, category }) {
  const titles = {
    Flexibles: "Flexible Packaging",
    Rigid: "Rigid Packaging",
    Trends: "Packaging Trends",
  };

  const stories = news.filter(
    (x) =>
      x.category === category ||
      (category === "Trends" && x.category === "Industry News"),
  );

  return (
    <div className="inside-page mx-auto w-full">
      <p className="eyebrow">Services and Suppliers</p>

      <h1>{titles[category]}</h1>

      <p className="intro-text">
        Explore the latest news, ideas and suppliers in{" "}
        {titles[category].toLowerCase()}.
      </p>

      {stories.length ? (
        <StoryList stories={stories} />
      ) : (
        <div className="empty-state">No articles published yet.</div>
      )}
    </div>
  );
}

const planOptions = [
  ["sidebar", "Sidebar Advertisement"],
  ["bottom", "Bottom Display Banner"],
  ["sponsored", "Sponsored Placement"],
  ["other", "Other / Custom"],
];

function Advertising() {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    placement: "sidebar",
    budget: "",
    message: "",
  });

  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function field(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function send(event) {
    event.preventDefault();

    setBusy(true);
    setStatus("");
    setError("");

    try {
      const result = await api("/public/advertising-inquiries", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setStatus(
        `Advertising enquiry received. Reference: ${result.reference || ""}`,
      );

      setForm({
        name: "",
        company: "",
        email: "",
        phone: "",
        placement: "sidebar",
        budget: "",
        message: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="inside-page mx-auto w-full">
      <p className="eyebrow">Grow with us</p>

      <h1>Advertise With Packaging Times</h1>

      <p className="intro-text">
        Tell us where you'd like to advertise. Our team will reply with
        available options and pricing.
      </p>

      <div className="plans-list">
        {planOptions.slice(0, 3).map(([id, name]) => (
          <div className="plan" key={id}>
            <h3>{name}</h3>

            <p>
              {id === "sidebar"
                ? "Banner space on either side of the news feed."
                : id === "bottom"
                  ? "Prominent placement below the news area."
                  : "A custom sponsored promotion."}
            </p>

            <button
              className="blue-btn"
              type="button"
              onClick={() => {
                field("placement", id);

                document.getElementById("advertise-form")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              Enquire now
              <ArrowRight size={15} />
            </button>
          </div>
        ))}
      </div>

      <form id="advertise-form" className="public-form" onSubmit={send}>
        <h2>Send an advertising enquiry</h2>

        <label>
          Your name *
          <input
            required
            minLength={2}
            maxLength={120}
            value={form.name}
            onChange={(e) => field("name", e.target.value)}
          />
        </label>

        <label>
          Company
          <input
            maxLength={150}
            value={form.company}
            onChange={(e) => field("company", e.target.value)}
          />
        </label>

        <label>
          Email address *
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => field("email", e.target.value)}
          />
        </label>

        <label>
          Phone
          <input
            type="tel"
            maxLength={40}
            value={form.phone}
            onChange={(e) => field("phone", e.target.value)}
          />
        </label>

        <label>
          Interested placement *
          <select
            required
            value={form.placement}
            onChange={(e) => field("placement", e.target.value)}
          >
            {planOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Estimated budget (optional)
          <input
            maxLength={100}
            value={form.budget}
            onChange={(e) => field("budget", e.target.value)}
            placeholder="e.g. Monthly budget"
          />
        </label>

        <label>
          Tell us about your advertising goals *
          <textarea
            required
            minLength={10}
            maxLength={5000}
            rows={5}
            value={form.message}
            onChange={(e) => field("message", e.target.value)}
          />
        </label>

        <button className="blue-btn" disabled={busy}>
          {busy ? "Sending..." : "Send Advertising Enquiry"}

          <ArrowRight size={16} />
        </button>

        {status && (
          <p className="success-text" role="status">
            <Check size={18} />
            {status}
          </p>
        )}

        {error && (
          <p className="form-feedback" role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

function SimpleForm({ kind }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "Packaging Times inquiry",
    message: "",
  });

  const [feedback, setFeedback] = useState({ text: "", error: false });
  const [busy, setBusy] = useState(false);

  const subscribe = kind === "subscribe";

  async function submit(event) {
    event.preventDefault();

    setBusy(true);
    setFeedback({ text: "", error: false });

    try {
      const result = await api(subscribe ? "/public/subscribe" : "/public/contact", {
        method: "POST",

        body: JSON.stringify(
          subscribe
            ? {
                name: form.name,
                email: form.email,
              }
            : form,
        ),
      });

      setFeedback({
        error: false,
        text: subscribe
          ? "You are subscribed!"
          : `Your message has been saved. Reference: ${result.reference}`,
      });

      setForm({
        name: "",
        email: "",
        subject: "Packaging Times inquiry",
        message: "",
      });
    } catch (err) {
      setFeedback({ text: err.message, error: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="public-form" onSubmit={submit}>
      <label>
        Full Name
        <input
          required={!subscribe}
          minLength={subscribe ? 0 : 2}
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
          placeholder="Your name"
        />
      </label>

      <label>
        Email Address
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
          placeholder="you@example.com"
        />
      </label>

      {!subscribe && (
        <>
          <label>
            Subject
            <input
              required
              minLength={3}
              value={form.subject}
              onChange={(e) =>
                setForm({
                  ...form,
                  subject: e.target.value,
                })
              }
            />
          </label>

          <label>
            Message
            <textarea
              required
              minLength={10}
              rows={6}
              value={form.message}
              onChange={(e) =>
                setForm({
                  ...form,
                  message: e.target.value,
                })
              }
              placeholder="How can we help?"
            />
          </label>
        </>
      )}

      <button className="blue-btn" disabled={busy}>
        {busy ? "Submitting..." : subscribe ? "Subscribe Free" : "Send Message"}

        <ArrowRight size={16} />
      </button>

      {feedback.text && (
        <p
          className={`form-feedback ${feedback.error ? "admin-error" : "success-text"}`}
          role={feedback.error ? "alert" : "status"}
        >
          {feedback.text}
        </p>
      )}
    </form>
  );
}

function Subscription() {
  return (
    <div className="inside-page mx-auto w-full">
      <p className="eyebrow">Stay up to date</p>

      <h1>Subscribe Free</h1>

      <p className="intro-text">
        Get Packaging Times updates and packaging industry news. It's free.
      </p>

      <SimpleForm kind="subscribe" />
    </div>
  );
}

function ContactPage({ settings }) {
  return (
    <div className="inside-page mx-auto w-full">
      <p className="eyebrow">Get in touch</p>

      <h1>Contact Us</h1>

      <p className="intro-text">
        Have a question about news, suppliers or advertising? Send us a message.
      </p>

      <SimpleForm kind="contact" />

      <div className="contact-details">
        <Mail size={20} />

        <div>
          <a href={`mailto:${settings.advertisingEmail}`}>
            {settings.advertisingEmail}
          </a>

          <a href={`mailto:${settings.trendingEmail}`}>
            {settings.trendingEmail}
          </a>

          <p>{settings.mailingAddress}</p>
        </div>
      </div>
    </div>
  );
}

export function StoryPage() {
  const { slug } = useParams();

  const [story, setStory] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setStory(null);
    setError("");

    api(`/public/news/${encodeURIComponent(slug)}`)
      .then((value) => {
        if (active) {
          setStory(value);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
        }
      });

    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <div className="inside-page mx-auto w-full">
      <Seo story={story} />

      {error ? (
        <div className="empty-state">{error}</div>
      ) : !story ? (
        <p>Loading story...</p>
      ) : (
        <article className="full-story">
          <span className="eyebrow">{story.category}</span>

          <h1>{story.title}</h1>

          <time>{friendlyDate(story.publishedAt)}</time>

          <p className="story-lead">{story.excerpt}</p>

          <div className="story-body">
            {story.body.split(/\n\n+/).map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <Link className="text-link" to="/trends">
            ← Back to news
          </Link>
        </article>
      )}
    </div>
  );
}
