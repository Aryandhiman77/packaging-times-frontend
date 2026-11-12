import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { FormSkeleton, InlineSkeleton, PageSkeleton } from "../components/Skeletons.jsx";

const interests = [
  ["flexible-packaging", "Flexible Packaging"],
  ["rigid-packaging", "Rigid Packaging"],
  ["packaging-trends", "Packaging Trends / New Concepts"],
  ["printing-graphics", "Printing & Graphics"],
  ["machinery-automation", "Packaging Machinery / Automation"],
  ["suppliers-services", "Suppliers & Services"],
  ["all-packaging-news", "All Packaging News"],
];

const emailPreferences = [
  ["packaging-brief", "Packaging Brief"],
  ["important-news-alerts", "Important Packaging News & Alerts"],
];

const emptyProfile = {
  firstName: "",
  lastName: "",
  email: "",
  company: "",
  jobTitle: "",
  interests: [],
  emailPreferences: [],
  consent: false,
};

function TextField({ label, required, ...props }) {
  return (
    <label className="subscription-field">
      <span>
        {label}
        {required && <b aria-hidden="true">*</b>}
      </span>
      <input required={required} {...props} />
    </label>
  );
}

function CheckboxGroup({ title, options, values, onChange, includeBoth = false, disabled }) {
  const allSelected = options.every(([value]) => values.includes(value));
  const toggle = (value, checked) => {
    onChange(
      checked ? [...new Set([...values, value])] : values.filter((item) => item !== value),
    );
  };

  return (
    <fieldset className="subscription-options" disabled={disabled}>
      <legend>{title}</legend>
      {options.map(([value, label]) => (
        <label key={value}>
          <input
            type="checkbox"
            checked={values.includes(value)}
            onChange={(event) => toggle(value, event.target.checked)}
          />
          <span>{label}</span>
        </label>
      ))}
      {includeBoth && (
        <label>
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(event) => onChange(event.target.checked ? options.map(([value]) => value) : [])}
          />
          <span>Both</span>
        </label>
      )}
    </fieldset>
  );
}

function ActionButton({ children, busy, disabled, ...props }) {
  return (
    <button className="subscription-action" disabled={busy || disabled} {...props}>
      {busy ? <InlineSkeleton /> : children}
    </button>
  );
}

function ActionFeedback({ feedback, action }) {
  if (feedback.action !== action || !feedback.text) return null;

  return (
    <p
      className={feedback.error ? "subscription-error" : "subscription-success"}
      role={feedback.error ? "alert" : "status"}
    >
      {feedback.text}
    </p>
  );
}

export function SubscriptionSignup() {
  const [form, setForm] = useState(emptyProfile);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/public/subscribe", { method: "POST", body: JSON.stringify(form) });
      navigate("/subscribe-free/thank-you");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="subscription-document subscription-signup">
      <h1>FREE PACKAGING TIMES SUBSCRIPTION</h1>
      <p>
        Packaging Times is a <strong>FREE packaging industry publication</strong> covering
        new packaging concepts, flexible packaging, rigid packaging, printing,
        manufacturing, suppliers, technology and industry trends.
      </p>
      <p>Stay informed without having to search the packaging industry every day.</p>

      <form onSubmit={submit}>
        <h2>SUBSCRIPTION FORM</h2>
        <TextField label="First Name" required value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
        <TextField label="Last Name" required value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
        <TextField label="E-Mail Address" required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        <TextField label="Company Name" value={form.company} onChange={(e) => set("company", e.target.value)} />
        <TextField label="Job Title / Position" value={form.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} />

        <CheckboxGroup title="Packaging Interests" options={interests} values={form.interests} onChange={(value) => set("interests", value)} />
        <CheckboxGroup title="How Often Would You Like Updates?" options={emailPreferences} values={form.emailPreferences} onChange={(value) => set("emailPreferences", value)} includeBoth />

        <label className="subscription-consent">
          <input type="checkbox" required checked={form.consent} onChange={(e) => set("consent", e.target.checked)} />
          <strong>Yes, I would like to receive my FREE Packaging Times subscription and packaging-related email updates.</strong>
        </label>

        <ActionButton busy={busy}>SUBSCRIBE FREE</ActionButton>
        {error && <p className="subscription-error" role="alert">{error}</p>}
      </form>
    </div>
  );
}

export function SubscriptionThankYou() {
  return (
    <div className="subscription-document subscription-thank-you">
      <h1>WELCOME TO PACKAGING TIMES</h1>
      <h2><em>Thank you for subscribing.</em></h2>
      <p>Your FREE Packaging Times subscription has been received.</p>
      <p>Watch your inbox for packaging news, new concepts, trends and industry developments.</p>
      <Link className="subscription-action-link" to="/">CONTINUE TO PACKAGING TIMES <span aria-hidden="true">→</span></Link>
    </div>
  );
}

export function ManageSubscription() {
  const [lookupEmail, setLookupEmail] = useState("");
  const [profile, setProfile] = useState(emptyProfile);
  const [found, setFound] = useState(false);
  const [busy, setBusy] = useState("");
  const [lookupMessage, setLookupMessage] = useState("");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState({ action: "", text: "", error: false });
  const [emailForm, setEmailForm] = useState({ currentEmail: "", newEmail: "", confirmEmail: "" });
  const [remove, setRemove] = useState(false);
  const set = (key, value) => setProfile((current) => ({ ...current, [key]: value }));

  function changeLookupEmail(value) {
    setLookupEmail(value);
    if (found && value.trim().toLowerCase() !== profile.email.toLowerCase()) {
      setFound(false);
      setProfile(emptyProfile);
      setEmailForm({ currentEmail: "", newEmail: "", confirmEmail: "" });
      setLookupMessage("");
      setError("");
      setFeedback({ action: "", text: "", error: false });
      setRemove(false);
    }
  }

  function begin(action) {
    setBusy(action);
    setError("");
    setFeedback({ action: "", text: "", error: false });
  }

  async function find(event) {
    event.preventDefault();
    begin("find");
    setFound(false);
    setProfile(emptyProfile);
    setEmailForm({ currentEmail: "", newEmail: "", confirmEmail: "" });
    setRemove(false);
    setLookupMessage("");
    try {
      const subscriber = await api("/public/subscription/find", {
        method: "POST",
        body: JSON.stringify({ email: lookupEmail }),
      });
      setProfile({ ...emptyProfile, ...subscriber, consent: true });
      setEmailForm({ currentEmail: subscriber.email, newEmail: "", confirmEmail: "" });
      setFound(true);
      setLookupMessage(
        subscriber.active === false
          ? "Subscription found. It is currently unsubscribed; saving changes will reactivate it."
          : "Subscription found. You can now update your information.",
      );
    } catch (err) {
      setFound(false);
      setProfile(emptyProfile);
      setEmailForm({ currentEmail: "", newEmail: "", confirmEmail: "" });
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function save(event) {
    event.preventDefault();
    begin("save");
    try {
      await api("/public/subscription", {
        method: "PATCH",
        body: JSON.stringify(profile),
      });
      setFeedback({
        action: "save",
        text: "Your subscription information and preferences have been updated successfully.",
        error: false,
      });
    } catch (err) {
      setFeedback({ action: "save", text: err.message, error: true });
    } finally {
      setBusy("");
    }
  }

  async function changeEmail(event) {
    event.preventDefault();
    begin("email");
    try {
      const result = await api("/public/subscription/email", {
        method: "PATCH",
        body: JSON.stringify(emailForm),
      });
      const updated = result.email || emailForm.newEmail;
      setLookupEmail(updated);
      setProfile((current) => ({ ...current, email: updated }));
      setEmailForm({ currentEmail: updated, newEmail: "", confirmEmail: "" });
      setFeedback({
        action: "email",
        text: "Your e-mail address has been updated successfully.",
        error: false,
      });
    } catch (err) {
      setFeedback({ action: "email", text: err.message, error: true });
    } finally {
      setBusy("");
    }
  }

  async function unsubscribe(event) {
    event.preventDefault();
    begin("unsubscribe");
    try {
      await api("/public/subscription/unsubscribe", {
        method: "POST",
        body: JSON.stringify({ email: profile.email, confirm: remove }),
      });
      setFeedback({
        action: "unsubscribe",
        text: "You have been unsubscribed from Packaging Times e-mail communications.",
        error: false,
      });
      setRemove(false);
    } catch (err) {
      setFeedback({ action: "unsubscribe", text: err.message, error: true });
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="subscription-document manage-subscription">
      <h1>MANAGE YOUR PACKAGING TIMES SUBSCRIPTION</h1>
      <p>Packaging Times is a <strong>FREE packaging industry publication.</strong></p>
      <p>Use this page to update your email address, change the packaging topics you receive, adjust how often we contact you, or unsubscribe.</p>

      <section>
        <h2>FIND YOUR SUBSCRIPTION</h2>
        <form onSubmit={find}>
          <TextField label="E-Mail Address" required type="email" value={lookupEmail} onChange={(e) => changeLookupEmail(e.target.value)} />
          <ActionButton busy={busy === "find"}>FIND MY SUBSCRIPTION</ActionButton>
        </form>
        {busy === "find" && <FormSkeleton />}
        {lookupMessage && <p className="subscription-lookup-status" role="status">{lookupMessage}</p>}
        {!found && error && <p className="subscription-error" role="alert">{error}</p>}
      </section>

      {found && (
        <>
          <section>
            <h2>UPDATE YOUR INFORMATION</h2>
            <form onSubmit={save}>
              <fieldset disabled={Boolean(busy)} className="subscription-fieldset">
                <TextField label="First Name" value={profile.firstName} onChange={(e) => set("firstName", e.target.value)} />
                <TextField label="Last Name" value={profile.lastName} onChange={(e) => set("lastName", e.target.value)} />
                <TextField label="Company Name" value={profile.company} onChange={(e) => set("company", e.target.value)} />
                <TextField label="Job Title / Position" value={profile.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} />
                <CheckboxGroup title="Packaging Interests" options={interests} values={profile.interests} onChange={(value) => set("interests", value)} />
                <CheckboxGroup title="E-Mail Preferences" options={emailPreferences.map(([value, label]) => [value, value === "packaging-brief" ? "Weekly Packaging Brief" : label])} values={profile.emailPreferences} onChange={(value) => set("emailPreferences", value)} includeBoth />
              </fieldset>
              <ActionButton busy={busy === "save"}>SAVE MY CHANGES</ActionButton>
              <ActionFeedback feedback={feedback} action="save" />
            </form>
          </section>

          <section>
            <h2 className="dark-heading">CHANGE E-MAIL ADDRESS</h2>
            <form onSubmit={changeEmail}>
              <fieldset disabled={Boolean(busy)} className="subscription-fieldset">
                <TextField label="Current E-Mail Address" type="email" required value={emailForm.currentEmail} onChange={(e) => setEmailForm({ ...emailForm, currentEmail: e.target.value })} />
                <TextField label="New E-Mail Address" type="email" required value={emailForm.newEmail} onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })} />
                <TextField label="Confirm New E-Mail Address" type="email" required value={emailForm.confirmEmail} onChange={(e) => setEmailForm({ ...emailForm, confirmEmail: e.target.value })} />
              </fieldset>
              <ActionButton busy={busy === "email"}>UPDATE E-MAIL ADDRESS</ActionButton>
              <ActionFeedback feedback={feedback} action="email" />
            </form>
          </section>

          <section>
            <h2>UNSUBSCRIBE</h2>
            <p>We would rather keep you informed, but you are always free to unsubscribe.</p>
            <form onSubmit={unsubscribe}>
              <label className="subscription-consent">
                <input type="checkbox" required checked={remove} onChange={(e) => setRemove(e.target.checked)} />
                <strong>Remove me from Packaging Times e-mail communications</strong>
              </label>
              <ActionButton busy={busy === "unsubscribe"}>UNSUBSCRIBE</ActionButton>
              <ActionFeedback feedback={feedback} action="unsubscribe" />
            </form>
            <p>You may subscribe again at any time.</p>
          </section>
        </>
      )}

    </div>
  );
}

export function PackagingBrief() {
  const defaultContent = "<h1>PACKAGING BRIEF</h1><p></p>";
  const [content, setContent] = useState(defaultContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api("/public/packaging-brief")
      .then((item) => {
        if (active) setContent(item?.html?.trim() || defaultContent);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) return <PageSkeleton />;

  return (
    <article className="packaging-brief-page packaging-brief-cms-page">
      {error ? (
        <p className="subscription-error" role="alert">{error}</p>
      ) : (
        <div
          className="packaging-brief-cms-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </article>
  );
}
