"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CalendarDays, Check, Clock, LogOut, Save, ShieldCheck, UserRoundCheck, X } from "lucide-react";
import { SANTA_SUPABASE_PUBLISHABLE_KEY, SANTA_SUPABASE_URL } from "@/lib/santa-config";

type BookingStatus = "pending" | "confirmed" | "declined" | "cancelled" | "expired";
type DayMode = "normal" | "photos_only" | "blocked" | "custom";

type Booking = {
  id: string;
  service_slug: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  event_location: string;
  guest_count: number | null;
  notes: string;
  local_date: string;
  local_start_time: string;
  local_end_time: string;
  status: BookingStatus;
  hold_expires_at: string | null;
  calendar_sync_status: string;
  created_at: string;
};

type DayRule = {
  id: string;
  date: string;
  mode: DayMode;
  allowed_service_slugs: string[];
  windows: Array<{ start: string; end: string }>;
};

type ServiceSetting = {
  slug: string;
  name: string;
  durationMinutes: number;
  bufferMinutes: number;
  active: boolean;
};

type ScheduleSettings = {
  seasonStart: string;
  seasonEnd: string;
  defaultStartTime: string;
  defaultEndTime: string;
  slotStepMinutes: number;
  pendingHoldMinutes: number;
  timezone: string;
};

type CalendarConnection = {
  configured: boolean;
  connected: boolean;
  calendarId: string | null;
  connectedAt: string | null;
  lastSyncAt: string | null;
  error?: string;
};

const SESSION_KEY = "santa-jim-admin-access-token";

function shortTime(value: string) {
  return value ? value.slice(0, 5) : "";
}

function timeLabel(value: string) {
  const [hourText, minuteText] = shortTime(value).split(":");
  const hour = Number(hourText);
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${minuteText} ${suffix}`;
}

function dateLabel(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(year, month - 1, day, 12));
}

function titleFromSlug(value: string) {
  return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export function AdminDashboard() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [requestingReset, setRequestingReset] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryToken, setRecoveryToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const [notice, setNotice] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dayRules, setDayRules] = useState<DayRule[]>([]);
  const [settings, setSettings] = useState<ScheduleSettings | null>(null);
  const [services, setServices] = useState<ServiceSetting[]>([]);
  const [ruleDate, setRuleDate] = useState("");
  const [ruleMode, setRuleMode] = useState<DayMode>("normal");
  const [ruleServices, setRuleServices] = useState<string[]>([]);
  const [ruleStart, setRuleStart] = useState("10:00");
  const [ruleEnd, setRuleEnd] = useState("18:00");
  const [calendar, setCalendar] = useState<CalendarConnection | null>(null);
  const [calendarWorking, setCalendarWorking] = useState(false);

  const pendingBookings = useMemo(() => bookings.filter((booking) => booking.status === "pending"), [bookings]);
  const upcomingBookings = useMemo(() => bookings.filter((booking) => booking.status === "confirmed"), [bookings]);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const recoveryAccessToken = hashParams.get("access_token");
    const recoveryError = hashParams.get("error_description");
    const isRecovery = hashParams.get("type") === "recovery";

    if (isRecovery && recoveryAccessToken) {
      window.sessionStorage.removeItem(SESSION_KEY);
      window.history.replaceState({}, "", `${window.location.pathname}${window.location.search}`);
      const startRecovery = window.setTimeout(() => {
        setToken("");
        setRecoveryToken(recoveryAccessToken);
        setRecoveryMode(true);
      }, 0);
      return () => window.clearTimeout(startRecovery);
    }

    if (recoveryError) {
      window.history.replaceState({}, "", `${window.location.pathname}${window.location.search}`);
      const showRecoveryError = window.setTimeout(() => {
        setAuthError(recoveryError.replaceAll("+", " "));
      }, 0);
      return () => window.clearTimeout(showRecoveryError);
    }

    const stored = window.sessionStorage.getItem(SESSION_KEY);
    if (!stored) return;
    const restoreSession = window.setTimeout(() => setToken(stored), 0);
    return () => window.clearTimeout(restoreSession);
  }, []);

  useEffect(() => {
    if (!token) return;
    const searchParams = new URLSearchParams(window.location.search);
    const oauthError = searchParams.get("error");
    if (oauthError) {
      const detail = searchParams.get("error_description")?.replaceAll("+", " ");
      window.history.replaceState({}, "", window.location.pathname);
      void loadDashboard(token).then(() => {
        setDashboardError(detail || "Google Calendar access was not approved.");
      });
    } else if (searchParams.get("code") && searchParams.get("state")) {
      void finishCalendarConnection(token, searchParams);
    } else {
      void loadDashboard(token);
    }
  // The callback functions intentionally use the token that triggered this OAuth/dashboard cycle.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function authedFetch(path: string, accessToken: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);
    if (init.body) headers.set("Content-Type", "application/json");
    return fetch(path, { ...init, headers, cache: "no-store" });
  }

  async function loadDashboard(accessToken = token) {
    if (!accessToken) return;
    setLoading(true);
    setDashboardError("");
    try {
      const [bookingsResponse, rulesResponse, settingsResponse, calendarResponse] = await Promise.all([
        authedFetch("/api/santa/admin/bookings", accessToken),
        authedFetch("/api/santa/admin/day-rules", accessToken),
        authedFetch("/api/santa/admin/settings", accessToken),
        authedFetch("/api/santa/admin/calendar", accessToken, {
          method: "POST",
          body: JSON.stringify({ action: "status" }),
        }),
      ]);
      if ([bookingsResponse, rulesResponse, settingsResponse, calendarResponse].some((response) => response.status === 401)) {
        signOut();
        throw new Error("Your admin session expired. Sign in again.");
      }
      if (!bookingsResponse.ok || !rulesResponse.ok || !settingsResponse.ok) throw new Error("The scheduler dashboard could not be loaded.");

      const bookingData = await bookingsResponse.json() as { bookings: Booking[] };
      const ruleData = await rulesResponse.json() as { dayRules: DayRule[] };
      const settingsData = await settingsResponse.json() as {
        settings: Record<string, unknown> | null;
        services: Array<Record<string, unknown>>;
      };
      const calendarData = await calendarResponse.json().catch(() => ({})) as CalendarConnection;
      setBookings(bookingData.bookings ?? []);
      setDayRules(ruleData.dayRules ?? []);
      if (settingsData.settings) {
        setSettings({
          seasonStart: String(settingsData.settings.season_start),
          seasonEnd: String(settingsData.settings.season_end),
          defaultStartTime: shortTime(String(settingsData.settings.default_start_time)),
          defaultEndTime: shortTime(String(settingsData.settings.default_end_time)),
          slotStepMinutes: Number(settingsData.settings.slot_step_minutes),
          pendingHoldMinutes: Number(settingsData.settings.pending_hold_minutes),
          timezone: String(settingsData.settings.timezone),
        });
      }
      setServices((settingsData.services ?? []).map((service) => ({
        slug: String(service.slug),
        name: String(service.name),
        durationMinutes: Number(service.duration_minutes),
        bufferMinutes: Number(service.buffer_minutes),
        active: Boolean(service.active),
      })));
      setCalendar(calendarResponse.ok ? calendarData : {
        configured: false,
        connected: false,
        calendarId: null,
        connectedAt: null,
        lastSyncAt: null,
        error: calendarData.error || "Google Calendar status is unavailable.",
      });
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "The scheduler dashboard could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSigningIn(true);
    setAuthError("");
    setAuthNotice("");
    try {
      const response = await fetch(`${SANTA_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          apikey: SANTA_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const result = await response.json().catch(() => ({})) as { access_token?: string; error_description?: string; msg?: string };
      if (!response.ok || !result.access_token) throw new Error(result.error_description || result.msg || "Email or password was not accepted.");
      window.sessionStorage.setItem(SESSION_KEY, result.access_token);
      setToken(result.access_token);
      setPassword("");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Sign in failed.");
    } finally {
      setSigningIn(false);
    }
  }

  function signOut() {
    window.sessionStorage.removeItem(SESSION_KEY);
    setToken("");
    setBookings([]);
    setDayRules([]);
    setSettings(null);
    setServices([]);
    setCalendar(null);
  }

  async function updateBooking(id: string, status: "confirmed" | "declined") {
    setNotice("");
    setDashboardError("");
    const response = await authedFetch("/api/santa/admin/bookings", token, {
      method: "PATCH",
      body: JSON.stringify({ id, status }),
    });
    const result = await response.json().catch(() => ({})) as { error?: string; warning?: string };
    if (!response.ok) {
      setDashboardError(result.error || "The booking request could not be updated.");
      return;
    }
    setNotice(result.warning || (status === "confirmed" ? "Request accepted." : "Request declined and the time was released."));
    await loadDashboard();
  }

  async function connectGoogleCalendar() {
    setCalendarWorking(true);
    setDashboardError("");
    try {
      const redirectUri = `${window.location.origin}${window.location.pathname}`;
      const response = await authedFetch("/api/santa/admin/calendar", token, {
        method: "POST",
        body: JSON.stringify({ action: "auth-url", redirectUri }),
      });
      const result = await response.json().catch(() => ({})) as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "Google Calendar connection could not be started.");
      window.location.assign(result.url);
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Google Calendar connection could not be started.");
      setCalendarWorking(false);
    }
  }

  async function requestPasswordReset() {
    const normalizedEmail = email.trim();
    setAuthError("");
    setAuthNotice("");
    setResetRequested(false);
    if (!normalizedEmail) {
      setAuthError("Enter your email address first, then select Forgot your password?");
      return;
    }

    setRequestingReset(true);
    try {
      const redirectTo = `${window.location.origin}${window.location.pathname}`;
      const response = await fetch(`${SANTA_SUPABASE_URL}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`, {
        method: "POST",
        headers: {
          apikey: SANTA_SUPABASE_PUBLISHABLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      if (!response.ok) throw new Error("Password recovery is temporarily unavailable. Please try again.");
      setResetRequested(true);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Password recovery is temporarily unavailable. Please try again.");
    } finally {
      setRequestingReset(false);
    }
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");
    if (newPassword.length < 12) {
      setAuthError("Your new password must be at least 12 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setAuthError("The passwords do not match.");
      return;
    }

    setUpdatingPassword(true);
    try {
      const response = await fetch(`${SANTA_SUPABASE_URL}/auth/v1/user`, {
        method: "PUT",
        headers: {
          apikey: SANTA_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${recoveryToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPassword }),
      });
      const result = await response.json().catch(() => ({})) as { message?: string; msg?: string };
      if (!response.ok) throw new Error(result.message || result.msg || "Your password could not be updated. Request a new recovery email and try again.");

      setRecoveryMode(false);
      setRecoveryToken("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPassword("");
      setAuthNotice("Password updated. You can now sign in with your new password.");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Your password could not be updated. Request a new recovery email and try again.");
    } finally {
      setUpdatingPassword(false);
    }
  }

  async function finishCalendarConnection(accessToken: string, searchParams: URLSearchParams) {
    setCalendarWorking(true);
    setDashboardError("");
    try {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const redirectUri = `${window.location.origin}${window.location.pathname}`;
      const response = await authedFetch("/api/santa/admin/calendar", accessToken, {
        method: "POST",
        body: JSON.stringify({ action: "exchange", code, state, redirectUri }),
      });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Google Calendar could not be connected.");
      window.history.replaceState({}, "", window.location.pathname);
      setNotice("Google Calendar connected.");
      await loadDashboard(accessToken);
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Google Calendar could not be connected.");
    } finally {
      setCalendarWorking(false);
    }
  }

  async function disconnectGoogleCalendar() {
    setCalendarWorking(true);
    setDashboardError("");
    try {
      const response = await authedFetch("/api/santa/admin/calendar", token, {
        method: "POST",
        body: JSON.stringify({ action: "disconnect" }),
      });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Google Calendar could not be disconnected.");
      setNotice("Google Calendar disconnected.");
      await loadDashboard();
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Google Calendar could not be disconnected.");
    } finally {
      setCalendarWorking(false);
    }
  }

  async function saveSettings() {
    if (!settings) return;
    setNotice("");
    setDashboardError("");
    const response = await authedFetch("/api/santa/admin/settings", token, {
      method: "PUT",
      body: JSON.stringify({ settings, services }),
    });
    const result = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) {
      setDashboardError(result.error || "Scheduler settings could not be saved.");
      return;
    }
    setNotice("Scheduler settings saved.");
    await loadDashboard();
  }

  function editRule(rule: DayRule) {
    setRuleDate(rule.date);
    setRuleMode(rule.mode);
    setRuleServices(rule.allowed_service_slugs ?? []);
    setRuleStart(shortTime(rule.windows?.[0]?.start ?? settings?.defaultStartTime ?? "10:00"));
    setRuleEnd(shortTime(rule.windows?.[0]?.end ?? settings?.defaultEndTime ?? "18:00"));
  }

  function toggleRuleService(slug: string) {
    setRuleServices((current) => current.includes(slug) ? current.filter((value) => value !== slug) : [...current, slug]);
  }

  async function saveDayRule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setDashboardError("");
    const response = await authedFetch("/api/santa/admin/day-rules", token, {
      method: "PUT",
      body: JSON.stringify({
        date: ruleDate,
        mode: ruleMode,
        allowedServiceSlugs: ruleMode === "custom" ? ruleServices : [],
        windows: ruleMode === "custom" ? [{ start: ruleStart, end: ruleEnd }] : [],
      }),
    });
    const result = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) {
      setDashboardError(result.error || "The day rule could not be saved.");
      return;
    }
    setNotice(`${dateLabel(ruleDate)} availability updated.`);
    await loadDashboard();
  }

  if (recoveryMode) {
    return (
      <section className="admin-login-card" aria-labelledby="admin-reset-title">
        <span className="admin-mark" aria-hidden="true"><ShieldCheck size={24} /></span>
        <p className="eyebrow">Secure account recovery</p>
        <h1 id="admin-reset-title">Choose a new password</h1>
        <p>Use at least 12 characters. After saving it, return here to sign in.</p>
        <form className="admin-login-form" onSubmit={updatePassword}>
          <label>
            <span>New password</span>
            <input type="password" autoComplete="new-password" minLength={12} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
          </label>
          <label>
            <span>Confirm new password</span>
            <input type="password" autoComplete="new-password" minLength={12} value={confirmNewPassword} onChange={(event) => setConfirmNewPassword(event.target.value)} required />
          </label>
          <button className="button button--gold" type="submit" disabled={updatingPassword}>{updatingPassword ? "Updating password…" : "Update password"}</button>
          {authError ? <p className="admin-error" role="alert">{authError}</p> : null}
        </form>
      </section>
    );
  }

  if (!token) {
    return (
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <span className="admin-mark" aria-hidden="true"><ShieldCheck size={24} /></span>
        <p className="eyebrow">Private owner access</p>
        <h1 id="admin-login-title">Santa Jim Scheduler</h1>
        <p>Sign in with an authorized Side Quest account to review requests and control Santa Jim&apos;s availability.</p>
        <form className="admin-login-form" onSubmit={signIn}>
          <label>
            <span>Email</span>
            <input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            <span>Password</span>
            <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <button className="button button--gold" type="submit" disabled={signingIn}>{signingIn ? "Signing in…" : "Sign in"}</button>
          <button className="admin-login-link" type="button" disabled={requestingReset} onClick={() => void requestPasswordReset()}>
            {requestingReset ? "Sending recovery email…" : "Forgot your password?"}
          </button>
          {resetRequested ? <p className="admin-login-notice" role="status">If an account exists for that email, a password recovery link has been sent.</p> : null}
          {authNotice ? <p className="admin-login-notice" role="status">{authNotice}</p> : null}
          {authError ? <p className="admin-error" role="alert">{authError}</p> : null}
        </form>
      </section>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-topbar">
        <div>
          <p className="eyebrow">Private owner dashboard</p>
          <h1>Santa Jim Scheduler</h1>
          <p>Approve requests, block special dates, and control what customers can request.</p>
        </div>
        <button className="button button--quiet" type="button" onClick={signOut}><LogOut size={17} /> Sign out</button>
      </header>

      {dashboardError ? <p className="admin-banner admin-banner--error" role="alert">{dashboardError}</p> : null}
      {notice ? <p className="admin-banner" role="status"><Check size={17} /> {notice}</p> : null}
      {loading ? <p className="admin-banner" role="status">Loading scheduler…</p> : null}

      <section className="admin-metrics" aria-label="Booking overview">
        <div><span>Pending</span><strong>{pendingBookings.length}</strong></div>
        <div><span>Confirmed</span><strong>{upcomingBookings.length}</strong></div>
        <div><span>Special dates</span><strong>{dayRules.length}</strong></div>
      </section>

      <section className="admin-section admin-calendar-card">
        <div>
          <p className="eyebrow">Schedule protection</p>
          <h2>Google Calendar</h2>
          <p>
            {calendar?.connected
              ? `Connected to ${calendar.calendarId || "the primary calendar"}. Existing events now block customer time slots, and accepted requests are added automatically.`
              : "Connect Santa Jim’s calendar so existing events block customer time slots and accepted requests are added automatically."}
          </p>
          {calendar?.error ? <small>{calendar.error}</small> : null}
        </div>
        {calendar?.connected ? (
          <button className="button button--quiet" type="button" disabled={calendarWorking} onClick={() => void disconnectGoogleCalendar()}>
            Disconnect
          </button>
        ) : (
          <button className="button button--gold" type="button" disabled={calendarWorking || calendar?.configured === false} onClick={() => void connectGoogleCalendar()}>
            {calendarWorking ? "Connecting…" : "Connect Google Calendar"}
          </button>
        )}
      </section>

      <section className="admin-section">
        <div className="admin-section__heading">
          <div><p className="eyebrow">Needs a decision</p><h2>Booking requests</h2></div>
          <button className="admin-text-button" type="button" onClick={() => void loadDashboard()}>Refresh</button>
        </div>
        <div className="admin-bookings">
          {pendingBookings.length === 0 ? <p className="admin-empty">No pending requests right now.</p> : null}
          {pendingBookings.map((booking) => (
            <article className="admin-booking-card" key={booking.id}>
              <div className="admin-booking-card__top">
                <div>
                  <span className="admin-status admin-status--pending">Pending</span>
                  <h3>{booking.customer_name}</h3>
                  <p>{titleFromSlug(booking.service_slug)}</p>
                </div>
                <div className="admin-booking-time"><CalendarDays size={16} /> {dateLabel(booking.local_date)}<br /><Clock size={16} /> {timeLabel(booking.local_start_time)}–{timeLabel(booking.local_end_time)}</div>
              </div>
              <dl className="admin-booking-details">
                <div><dt>Email</dt><dd>{booking.customer_email}</dd></div>
                <div><dt>Phone</dt><dd>{booking.customer_phone || "Not provided"}</dd></div>
                <div><dt>Location</dt><dd>{booking.event_location}</dd></div>
                <div><dt>Guests</dt><dd>{booking.guest_count ?? "Not provided"}</dd></div>
              </dl>
              {booking.notes ? <p className="admin-booking-notes">{booking.notes}</p> : null}
              <div className="admin-booking-actions">
                <button className="button button--gold" type="button" onClick={() => void updateBooking(booking.id, "confirmed")}><UserRoundCheck size={17} /> Accept</button>
                <button className="button button--quiet" type="button" onClick={() => void updateBooking(booking.id, "declined")}><X size={17} /> Decline</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-section admin-section--split">
        <div>
          <div className="admin-section__heading"><div><p className="eyebrow">Calendar rules</p><h2>Set a special day</h2></div></div>
          <form className="admin-rule-form" onSubmit={saveDayRule}>
            <label><span>Date</span><input type="date" value={ruleDate} min={settings?.seasonStart} max={settings?.seasonEnd} onChange={(event) => setRuleDate(event.target.value)} required /></label>
            <label><span>Day type</span><select value={ruleMode} onChange={(event) => setRuleMode(event.target.value as DayMode)}><option value="normal">Normal</option><option value="photos_only">Pictures with Santa only</option><option value="blocked">Blocked / off</option><option value="custom">Custom</option></select></label>
            {ruleMode === "custom" ? (
              <div className="admin-custom-rule">
                <fieldset><legend>Allowed experiences</legend>{services.filter((service) => service.active).map((service) => <label className="admin-check" key={service.slug}><input type="checkbox" checked={ruleServices.includes(service.slug)} onChange={() => toggleRuleService(service.slug)} /> <span>{service.name}</span></label>)}</fieldset>
                <div className="admin-two-col"><label><span>Custom start</span><input type="time" value={ruleStart} onChange={(event) => setRuleStart(event.target.value)} /></label><label><span>Custom end</span><input type="time" value={ruleEnd} onChange={(event) => setRuleEnd(event.target.value)} /></label></div>
              </div>
            ) : null}
            <button className="button button--gold" type="submit"><Save size={17} /> Save day</button>
          </form>
        </div>
        <div>
          <div className="admin-section__heading"><div><p className="eyebrow">Overrides</p><h2>Special dates</h2></div></div>
          <div className="admin-rule-list">
            {dayRules.length === 0 ? <p className="admin-empty">No special dates configured.</p> : dayRules.map((rule) => <button type="button" className="admin-rule-row" key={rule.id} onClick={() => editRule(rule)}><span><strong>{dateLabel(rule.date)}</strong><small>{rule.mode === "photos_only" ? "Pictures with Santa only" : rule.mode === "blocked" ? "Blocked" : rule.mode === "custom" ? "Custom availability" : "Normal override"}</small></span><CalendarDays size={17} /></button>)}
          </div>
        </div>
      </section>

      {settings ? (
        <section className="admin-section">
          <div className="admin-section__heading"><div><p className="eyebrow">Season defaults</p><h2>Scheduler settings</h2></div><button className="button button--gold" type="button" onClick={() => void saveSettings()}><Save size={17} /> Save settings</button></div>
          <div className="admin-settings-grid">
            <label><span>Season start</span><input type="date" value={settings.seasonStart} onChange={(event) => setSettings({ ...settings, seasonStart: event.target.value })} /></label>
            <label><span>Season end</span><input type="date" value={settings.seasonEnd} onChange={(event) => setSettings({ ...settings, seasonEnd: event.target.value })} /></label>
            <label><span>Default start</span><input type="time" value={settings.defaultStartTime} onChange={(event) => setSettings({ ...settings, defaultStartTime: event.target.value })} /></label>
            <label><span>Default end</span><input type="time" value={settings.defaultEndTime} onChange={(event) => setSettings({ ...settings, defaultEndTime: event.target.value })} /></label>
            <label><span>Time-slot step (minutes)</span><input type="number" min="5" max="120" value={settings.slotStepMinutes} onChange={(event) => setSettings({ ...settings, slotStepMinutes: Number(event.target.value) })} /></label>
            <label><span>Pending hold (minutes)</span><input type="number" min="15" max="10080" value={settings.pendingHoldMinutes} onChange={(event) => setSettings({ ...settings, pendingHoldMinutes: Number(event.target.value) })} /></label>
          </div>
          <div className="admin-service-settings">
            <h3>Experience duration &amp; buffer</h3>
            {services.map((service, index) => <div className="admin-service-row" key={service.slug}><div><strong>{service.name}</strong><label className="admin-check"><input type="checkbox" checked={service.active} onChange={(event) => setServices((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, active: event.target.checked } : item))} /> <span>Active</span></label></div><label><span>Duration</span><input type="number" min="5" max="720" value={service.durationMinutes} onChange={(event) => setServices((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, durationMinutes: Number(event.target.value) } : item))} /></label><label><span>Buffer</span><input type="number" min="0" max="240" value={service.bufferMinutes} onChange={(event) => setServices((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, bufferMinutes: Number(event.target.value) } : item))} /></label></div>)}
          </div>
        </section>
      ) : null}

      <section className="admin-section">
        <div className="admin-section__heading"><div><p className="eyebrow">Approved schedule</p><h2>Confirmed bookings</h2></div></div>
        <div className="admin-confirmed-list">
          {upcomingBookings.length === 0 ? <p className="admin-empty">No confirmed bookings yet.</p> : upcomingBookings.map((booking) => <div className="admin-confirmed-row" key={booking.id}><span><strong>{booking.customer_name}</strong><small>{titleFromSlug(booking.service_slug)} · {booking.event_location}</small></span><span>{dateLabel(booking.local_date)} · {timeLabel(booking.local_start_time)}</span></div>)}
        </div>
      </section>
    </div>
  );
}
