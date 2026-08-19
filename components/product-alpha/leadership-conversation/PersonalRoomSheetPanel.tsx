"use client";

import { useEffect, useRef, useState } from "react";
import { confirmPersonalRoomSheetAction } from "../../../app/product-alpha/leadership-conversation/actions";
import {
  PERSONAL_ROOM_SHEET_CONFIRMATION_TEXT,
  PERSONAL_ROOM_SHEET_EXPLANATION,
  serializePersonalRoomSheetPlainText,
  type ContentSafePersonalRoomSheetViewV1,
} from "../../../product/workflow/leadershipConversation/personalRoomSheetContracts";
import styles from "./PersonalRoomSheetPanel.module.css";

export function PersonalRoomSheetPanel({ initialSheet, occurrenceRef }: { initialSheet: ContentSafePersonalRoomSheetViewV1; occurrenceRef: string }) {
  const [open, setOpen] = useState(false), [reviewed, setReviewed] = useState(false), [confirmed, setConfirmed] = useState<ContentSafePersonalRoomSheetViewV1 | null>(null), [pending, setPending] = useState(false), [error, setError] = useState<string | null>(null), [copied, setCopied] = useState(false), sequence = useRef(0);
  useEffect(() => () => { sequence.current++; }, []);
  const clearConfirmation = () => { sequence.current++; setReviewed(false); setConfirmed(null); setCopied(false); setError(null); };
  const confirm = async () => { if (!reviewed || pending) return; const requestSequence = ++sequence.current; setPending(true); setError(null); try { const response = await confirmPersonalRoomSheetAction({ contractVersion: initialSheet.contractVersion, occurrenceRef, expectedSourceProjectionDigest: initialSheet.sourceProjectionDigest, expectedCandidate1AssessmentDigest: initialSheet.candidate1AssessmentDigest, expectedB11CommunicationDigest: initialSheet.b11CommunicationDigest, expectedPersonalRoomSheetDigest: initialSheet.personalRoomSheetDigest, requestSequence }); if (response.requestSequence !== sequence.current) return; setConfirmed(response.sheet); } catch { if (requestSequence === sequence.current) { setConfirmed(null); setReviewed(false); setError("The sheet changed or access is no longer available. Refresh it before confirming."); } } finally { if (requestSequence === sequence.current) setPending(false); } };
  const copy = async () => { if (!confirmed) return; await navigator.clipboard.writeText(serializePersonalRoomSheetPlainText(confirmed)); setCopied(true); };
  const print = () => { if (confirmed) window.print(); };
  const visible = confirmed ?? initialSheet;
  return <section className={styles.container} aria-labelledby="personal-room-sheet-title">
    <div className={styles.controls}><button type="button" onClick={() => { if (open) clearConfirmation(); setOpen(value => !value); }}>{open ? "Close personal meeting sheet" : "Create personal meeting sheet"}</button></div>
    {open && <div className={styles.sheet}>
      <header><h2 id="personal-room-sheet-title">Personal meeting sheet</h2><p className={styles.boundary}>{visible.boundaryLabel}</p></header>
      {visible.sections.map(section => <section key={section.sectionId}><h3>{section.label}</h3>{section.items.map(item => <p key={item.itemId}>{item.text}</p>)}</section>)}
      <div className={styles.controls}>
        <p>{PERSONAL_ROOM_SHEET_EXPLANATION}</p>
        {!confirmed && <><label><input type="checkbox" checked={reviewed} onChange={event => { setReviewed(event.target.checked); setError(null); }} /> {PERSONAL_ROOM_SHEET_CONFIRMATION_TEXT}</label><button type="button" disabled={!reviewed || pending} onClick={confirm}>{pending ? "Confirming…" : "Confirm sheet"}</button></>}
        {error && <p role="alert">{error}</p>}
        <button type="button" disabled={!confirmed} onClick={copy}>Copy plain text</button>
        <button type="button" disabled={!confirmed} onClick={print}>Print</button>
        {copied && <p role="status">Copied.</p>}
      </div>
    </div>}
  </section>;
}
