import React, { useEffect, useState } from "react";
import { request } from "../shared/api";
import { ErrorMessage } from "../shared/ui";

export function StaffLogin({ onLogin, denied, onLogout }) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [challenge, setChallenge] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!challenge) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [challenge]);

  async function send() {
    const next = await request("/v1/auth/challenges", { method: "POST", body: { phone } });
    setChallenge(next);
    setCode("");
  }
  async function run(action) {
    if (busy) return;
    setError(null);
    setBusy(true);
    try { await action(); }
    catch (error) { setError(error); }
    finally { setBusy(false); }
  }
  const remaining = challenge ? Math.max(0, Math.ceil((Date.parse(challenge.retryAt) - now) / 1000)) : 0;
  return <main className="staff-login">
    <section className="panel">
      <img className="staff-signature" src="/brand-signature.png" width="600" height="534" alt="Naivedya / নৈবেদ্য"/>
      <h1>Staff sign-in</h1>
      {denied ? <>
        <p>Sign in with an authorized staff mobile number.</p>
        <button className="button" disabled={busy} onClick={() => run(onLogout)}>Switch mobile number</button>
      </> : <form onSubmit={event => {
        event.preventDefault();
        run(challenge ? async () => {
          const buyer = await request("/v1/auth/challenges/verify", { method: "POST", body: { challengeId: challenge.challengeId, code } });
          onLogin(buyer);
        } : send);
      }}>
        {challenge ? <>
          <label>Verification code<input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6}
            value={code} onChange={event => setCode(event.target.value.replace(/\D/g, ""))}/></label>
        </> : <label>Mobile number (+91)<input required type="tel" autoComplete="tel-national" pattern="[6-9][0-9]{9}" maxLength={10}
          value={phone} onChange={event => setPhone(event.target.value.replace(/\D/g, ""))}/></label>}
        <button className="button" type="submit" disabled={busy}>{challenge ? "Verify code" : "Send code"}</button>
        {challenge && <>
          <button className="button secondary" type="button" disabled={busy || remaining > 0} onClick={() => run(send)}>{remaining > 0 ? "Resend in " + remaining + "s" : "Resend code"}</button>
          <button className="button secondary" type="button" onClick={() => { setChallenge(null); setError(null); }}>Change number</button>
        </>}
      </form>}
      <ErrorMessage error={error}/>
    </section>
  </main>;
}
