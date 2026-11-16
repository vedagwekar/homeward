"use client";

import { useState } from "react";
import { allIn, breakEven, MARKET, otherCosts, reviewCost, SITE_VISIT, TEAMS, TRANSFER, percent } from "@/lib/price.mjs";
import { rupees } from "@/lib/project.mjs";
import { Back } from "../icons";

// For the showcase table: a judge picks a build size and sees what a family really pays, all in.
// Video review prices are quotes from eight Kerala engineers. Everything else is our assumption.
export default function Price() {
  const [lakhs, setLakhs] = useState(30);
  const [siteVisits, setSiteVisits] = useState(3);
  const [sitePrice, setSitePrice] = useState(SITE_VISIT);
  const [transfer, setTransfer] = useState<keyof typeof TRANSFER>("digital");
  const [team, setTeam] = useState<keyof typeof TEAMS>("lean");

  const budget = lakhs * 1_00_000;
  const r = allIn({ budget, siteVisits, sitePrice, transfer });
  const be = breakEven({ budget, team });

  return (
    <>
      <Back href="/" label="Homes" />
      <h1>What a family really pays</h1>
      <p className="hint">Video review prices are quotes from eight Kerala engineers. Site visits and the rest are our estimates.</p>

      <h3>The build</h3>
      <section className="group pad price-inputs">
        <label>
          <span>Build size: <strong>₹{lakhs} lakh</strong></span>
          <input type="range" min={10} max={50} step={1} value={lakhs} onChange={(e) => setLakhs(Number(e.target.value))} />
        </label>
        <label>
          <span>Site visits before concrete is poured</span>
          <select value={siteVisits} onChange={(e) => setSiteVisits(Number(e.target.value))}>
            {[0, 1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label>
          <span>One site visit, our estimate</span>
          <input type="number" min={0} step={500} value={sitePrice} onChange={(e) => setSitePrice(Math.max(0, Number(e.target.value)))} />
        </label>
        <label>
          <span>How the family sends money</span>
          <select value={transfer} onChange={(e) => setTransfer(e.target.value as keyof typeof TRANSFER)}>
            {Object.entries(TRANSFER).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}
          </select>
        </label>
      </section>

      <h3>What it costs</h3>
      <section className="group">
        <div className="row"><div className="grow">Homeward fee, 1.5%<small>Covers the engineer's {r.reviews} video reviews.</small></div><span>{rupees(r.fee)}</span></div>
        <div className="row"><div className="grow">Site visits<small>For stages concrete will hide.</small></div><span>{rupees(r.visits)}</span></div>
        <div className="row"><strong className="grow">Homeward and visits</strong><strong>{rupees(r.homeward)} · {percent(r.homewardShare)}</strong></div>
        <div className="row"><div className="grow">Moving the money<small>The family pays this with or without Homeward.</small></div><span className="muted">{rupees(r.moveLow)} to {rupees(r.moveHigh)}</span></div>
        <div className="row price-total"><strong className="grow">All in</strong><strong>{percent(r.shareLow)} to {percent(r.shareHigh)} of the build</strong></div>
      </section>

      <section className="group pad price-compare">
        <strong>One stage paid without a check: about {rupees(r.unchecked)}</strong>
        <p>That is {Math.round(r.unchecked / r.fee)} times the Homeward fee.</p>
      </section>

      <h3>What Homeward needs to break even</h3>
      <section className="group pad price-inputs">
        <label>
          <span>Team</span>
          <select value={team} onChange={(e) => setTeam(e.target.value as keyof typeof TEAMS)}>
            {Object.entries(TEAMS).map(([k, t]) => <option key={k} value={k}>{t.label}, {rupees(t.cost)} a year</option>)}
          </select>
        </label>
      </section>
      <section className="group">
        <div className="row"><div className="grow">Fee</div><span>{rupees(r.fee)}</span></div>
        <div className="row"><div className="grow">Engineers' video reviews<small>At the average quote.</small></div><span className="muted">− {rupees(reviewCost(budget))}</span></div>
        <div className="row"><div className="grow">Other costs per build<small>Payment partner, support, reserve, winning the family.</small></div><span className="muted">− {rupees(otherCosts(budget))}</span></div>
        <div className="row"><strong className="grow">Left per build</strong><strong>{rupees(be.per)}</strong></div>
        {be.builds === null ? (
          <div className="row"><strong className="grow">Builds a year</strong><strong>Never at this size</strong></div>
        ) : (
          <>
            <div className="row"><strong className="grow">Builds a year to break even</strong><strong>{be.builds.toLocaleString("en-IN")}</strong></div>
            <div className="row"><div className="grow">Share of Kerala builds we could serve</div><span className="muted">{percent(be.shareBase!)} of {MARKET.base.toLocaleString("en-IN")} (base) · {percent(be.shareLow!)} of {MARKET.low.toLocaleString("en-IN")} (low)</span></div>
          </>
        )}
      </section>
      <p className="hint">Market size and the other costs are our assumptions. The pilot replaces them. Details: docs/engineer-quotes.md.</p>
    </>
  );
}
