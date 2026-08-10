"use client";

import { useState } from "react";
import { Check, Send } from "lucide-react";
import { requestIntroduction } from "../../lib/kufuo/client";

export function IntroductionButton({ userId, recipientId }: { userId: string; recipientId: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("I would like to learn more about what you are building and explore whether our skills complement each other.");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  if (userId === recipientId) return <a className="button" href="/account">Edit your profile</a>;

  async function send() {
    setStatus("sending");
    setError("");
    try {
      await requestIntroduction(userId, recipientId, message.trim());
      setStatus("sent");
    } catch (cause) {
      setStatus("error");
      setError(cause instanceof Error && cause.message.includes("connection_requests_one_pending_pair") ? "You already have a pending request with this member." : (cause instanceof Error ? cause.message : "Could not send the request."));
    }
  }

  if (status === "sent") return <p className="member-save-notice" role="status"><Check size={17} />Introduction request sent</p>;

  return <div className="introduction-action">{open ? <><textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={800} rows={4} aria-label="Introduction message" /><div className="member-actions"><button className="button" type="button" onClick={send} disabled={status === "sending" || !message.trim()}><Send size={17} />{status === "sending" ? "Sending…" : "Send request"}</button><button className="button button-secondary" type="button" onClick={() => setOpen(false)}>Cancel</button></div></> : <button className="button" type="button" onClick={() => setOpen(true)}><Send size={17} />Request an introduction</button>}{error && <p className="member-save-error" role="alert">{error}</p>}</div>;
}
