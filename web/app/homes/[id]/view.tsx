"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { budgetParts, isActive, nextStage, shortDate } from "@/lib/project.mjs";
import { CONTRACT_URL, useProjects, useMoney } from "@/lib/store";
import BudgetBar from "../../budget-bar";
import CurrencySwitch from "../../currency-switch";
import GateTrack, { StageDots } from "../../gate-track";
import { Back, Glyph, statusView, Tile } from "../../icons";

export default function View({ id }: { id: string }) {
  const money = useMoney();
  const project = useProjects().find((p) => p.id === id);
  if (!project) notFound();
  const next = nextStage(project);
  const family = [...project.sponsors.map((s) => s.name), project.parent];
  const latest = [...project.stages].reverse().find((s) => s.photos.length && s.status !== "locked" && s.status !== "open");
  const photo = latest?.photos[latest.photos.length - 1];
  const parts = budgetParts(project);
  const current = project.frozen ? undefined : project.stages.find(isActive) ?? project.stages.find((s) => s.status === "locked");

  return (
    <>
      <Back href="/" label="Homes" />
      <h1>{project.name}</h1>
      <p className="intro">{project.place}</p>
      <CurrencySwitch />
      {project.frozen && <p className="note">This build is stopped. Unspent money has gone back to the family.</p>}

      <section className="group hero">
        <span className="muted">Locked in the Homeward contract</span>
        <p className="hero-figure">{money(parts.waiting + parts.ready)}</p>
        <p className="hero-rule">
          Paid out one stage at a time, only after an independent engineer passes the work and {project.parent} approves.
        </p>
        <BudgetBar project={project} />
        {next && next.stillNeeded > 0 && (
          <Link className="button" href={`/homes/${project.id}/fund`}>
            Fund {next.stage.name.toLowerCase()}, {money(next.stillNeeded)}
          </Link>
        )}
        <a className="contract-link" href={CONTRACT_URL} target="_blank" rel="noreferrer">
          See the contract on Stellar testnet
        </a>
      </section>

      {current && (
        <>
          <h3>{isActive(current) ? "Now" : "Next"}: {current.name}</h3>
          <section className="group">
            <div className="pad">
              <StageDots project={project} current={current} />
              <GateTrack project={project} stage={current} />
            </div>
            <Link className="row" href={`/homes/${project.id}/stages/${current.slug}`}>
              <div className="grow">Photos, checks and payments</div>
              <span className="chevron">
                <Glyph name="chevron" />
              </span>
            </Link>
          </section>
        </>
      )}

      <h3>On site</h3>
      <section className="group">
        {photo && latest && (
          <Link className="row" href={`/homes/${project.id}/stages/${latest.slug}`}>
            <img className="thumb" src={photo.src} alt="" />
            <div className="grow">
              <span>{photo.caption}</span>
              <small>{latest.name}</small>
            </div>
          </Link>
        )}
        <Link className="row" href={`/homes/${project.id}/camera`}>
          <Tile name="clock" tone="red" />
          <div className="grow">
            <span>Site camera</span>
            <small>Watch the build live, any time</small>
          </div>
          <span className="chevron">
            <Glyph name="chevron" />
          </span>
        </Link>
      </section>

      <h3>Stages</h3>
      <section className="group">
        {project.stages.map((stage) => {
          const view = statusView[stage.status as keyof typeof statusView];
          return (
            <Link className="row" key={stage.slug} href={`/homes/${project.id}/stages/${stage.slug}`}>
              <Tile name={view.icon} tone={view.tone} />
              <div className="grow">
                <span>{stage.name}</span>
                <small>{view.label}</small>
              </div>
              <span className="muted nowrap">{money(stage.amount)}</span>
              <span className="chevron">
                <Glyph name="chevron" />
              </span>
            </Link>
          );
        })}
      </section>

      {project.stages.some((s) => s.status === "paid") && (
        <>
          <h3>Certificates</h3>
          <section className="group">
            {project.stages
              .filter((s) => s.status === "paid")
              .map((s) => (
                <div className="row" key={s.slug}>
                  <Tile name="shield" tone="green" />
                  <div className="grow">
                    <span>{s.name}</span>
                    <small>Approved and paid {s.paidOn ? shortDate(s.paidOn) : ""}</small>
                  </div>
                  <a className="link" href={CONTRACT_URL} target="_blank" rel="noreferrer">
                    Contract
                  </a>
                </div>
              ))}
          </section>
        </>
      )}

      <h3>Family</h3>
      <section className="group">
        <div className="row">
          <span className="avatars" aria-hidden="true">
            {family.map((name) => (
              <span className="avatar" key={name}>
                {name[0]}
              </span>
            ))}
          </span>
          <div className="grow">{family.join(", ")}</div>
        </div>
        {project.sponsors.map((s) => (
          <div className="row" key={s.name}>
            <div className="grow">
              <span>{s.name}</span>
              <small>{s.city}</small>
            </div>
            <span className="muted nowrap">{money(s.paidIn)}</span>
          </div>
        ))}
      </section>

      <section className="group spaced">
        <Link className="row" href={`/homes/${project.id}/team`}>
          <Tile name="hammer" tone="orange" />
          <div className="grow">
            <span>Builder and engineer</span>
            <small>Your team, or find someone checked by Homeward</small>
          </div>
          <span className="chevron">
            <Glyph name="chevron" />
          </span>
        </Link>
        <Link className="row" href={`/homes/${project.id}/money-back`}>
          <Tile name="back" tone="green" />
          <div className="grow">
            <span>Money back</span>
            <small>Overcharged, or the build stopped? Get unspent money back</small>
          </div>
          <span className="chevron">
            <Glyph name="chevron" />
          </span>
        </Link>
        <Link className="row" href="/help">
          <Tile name="help" tone="gray" />
          <div className="grow">If something goes wrong</div>
          <span className="chevron">
            <Glyph name="chevron" />
          </span>
        </Link>
      </section>
    </>
  );
}
