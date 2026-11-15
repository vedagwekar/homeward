"use client";

import { useState } from "react";
import { depositNeeded, nextStage, rupees } from "@/lib/project.mjs";
import { act, activeStage, homesInOrder, LIVE, postDeposit, startStage, submitVideoProof, useProjects, useStatus } from "@/lib/store";
import GateTrack from "../gate-track";
import VideoReviewPanel from "../video-review";
import BuilderSecurity from "./security";

// The builder's one screen: what to do now, the code to film, and when the money comes. Keep it light for Android.
export default function Builder() {
  const projects = useProjects();
  const active = activeStage(projects);
  const busy = useStatus().state === "loading";

  if (!active) {
    // Nothing open: offer the next locked stage. In a real launch Homeward opens it once the family has funded it.
    const project = homesInOrder(projects).find((p) => !p.frozen && nextStage(p));
    const next = project && nextStage(project);
    const waiting = next && next.stillNeeded > 0;
    const needDeposit = Boolean(project && depositNeeded(project));
    // The home whose deposit to show, even when every stage is finished.
    const secured = project ?? homesInOrder(projects).find((p) => p.security);
    return (
      <>
        <h1>No job open</h1>
        {project && next ? (
          <>
            <p className="task">
              Next: {next.stage.name}. {waiting ? `Waiting for ${rupees(next.stillNeeded)} from the family.` : needDeposit ? `Put in your ${rupees(project.security!.depositTarget)} deposit first.` : "Ready to start."}
            </p>
            {!waiting && needDeposit && (
              <button className="button" type="button" disabled={busy} onClick={() => act({ loading: "Putting in your deposit", done: "Deposit is in" }, () => postDeposit(project.id))}>
                Put in {rupees(project.security!.depositTarget)}
              </button>
            )}
            {!waiting && !needDeposit && (
              <>
                <button
                  className="button"
                  type="button"
                  disabled={busy}
                  onClick={() => act({ loading: `Starting ${next.stage.name}`, done: `${next.stage.name} started. Supplier paid` }, () => startStage(project.id, next.stage.slug))}
                >
                  Start {next.stage.name.toLowerCase()}
                </button>
                <p className="hint">Pays the supplier {rupees(next.stage.materials)}.</p>
                {project.security && project.security.deposit < project.security.depositTarget && (
                  <p className="hint">Your first payment fills the {rupees(project.security.depositTarget)} deposit.</p>
                )}
              </>
            )}
          </>
        ) : (
          <p className="task">Every stage is finished.</p>
        )}
        {secured && <BuilderSecurity project={secured} />}
      </>
    );
  }

  const { project, stage } = active;
  const sent = stage.status === "submitted";
  const task = sent ? "With the engineer." : stage.status === "rejected" ? "Sent back. Fix it, film again." : "Film the work. Show this code.";
  return (
    <>
      <h1>{stage.name}</h1>
      <p className="intro">{project.name}</p>
      <p className="task">{task}</p>

      {!sent && (
        <>
          <section className="group pad center">
            <small>Today's code</small>
            <p className="code">{stage.code}</p>
          </section>
          <ProofForm key={`${project.id}/${stage.slug}/${stage.status}`} project={project.id} stage={stage.slug} resubmit={stage.status === "rejected"} busy={busy} />
        </>
      )}

      {stage.videoReview && <VideoReviewPanel review={stage.videoReview} />}

      <h3>Your payment</h3>
      <section className="group pad">
        <GateTrack project={project} stage={stage} />
      </section>
      <BuilderSecurity project={project} />
    </>
  );
}

function ProofForm({ project, stage, resubmit, busy }: { project: string; stage: string; resubmit: boolean; busy: boolean }) {
  const [video, setVideo] = useState<File>();
  const [consent, setConsent] = useState(false);

  return (
    <form onSubmit={(event) => {
      event.preventDefault();
      act({ loading: LIVE ? "Uploading video and checking proof" : "Sending", done: "Video sent" }, () => submitVideoProof(project, stage, video));
    }}>
      {LIVE && (
        <>
          <label className="group pad proof-upload">
            <span>Film the code, then send</span>
            <input type="file" accept="video/*,.mov" capture="environment" required disabled={busy} onChange={(event) => setVideo(event.target.files?.[0])} />
          </label>
          <label className="consent">
            <input type="checkbox" checked={consent} disabled={busy} onChange={(event) => setConsent(event.target.checked)} />
            <span>Everyone in this clip agreed to be filmed, and to it being uploaded to this demo.</span>
          </label>
          <p className="hint">For AI review with Google Gemini, use a short MP4, MOV, or WebM clip up to 14 MB. The engineer reviews the submission.</p>
        </>
      )}
      <button className="button" type="submit" disabled={busy || (LIVE && (!video || !consent))}>
        {resubmit ? "Send new video" : "Send video"}
      </button>
      {LIVE && (
        <button
          className="button quiet"
          type="button"
          disabled={busy}
          onClick={() => {
            // Demo only: a small sample file stands in for a phone video. Its fingerprint goes on chain like a real one.
            const sample = new File([`Sample proof for ${stage}, ${new Date().toISOString()}`], "sample-proof.mp4", { type: "video/mp4" });
            act({ loading: "Sending sample clip", done: "Video sent" }, () => submitVideoProof(project, stage, sample));
          }}
        >
          No clip handy? Send a sample
        </button>
      )}
      {!LIVE && <p className="hint">Demo: sends sample proof. Connect the backend to upload a video for AI review.</p>}
    </form>
  );
}
