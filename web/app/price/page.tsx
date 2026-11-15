"use client";

import { useState } from "react";
import { allIn, breakEven, MARKET, PLANS, PRICES, TEAMS, TRANSFER, percent } from "@/lib/price.mjs";
import { rupees } from "@/lib/project.mjs";
import { Back } from "../icons";

// For the showcase table: a judge picks a build size and sees what a family really pays, all in.
// Every number is an assumption from the business plan. Visit prices are placeholders until we have quotes.
export default function Price() {
  const [lakhs, setLakhs] = useState(30);
  const [plan, setPlan] = useState<keyof typeof PLANS>("prepour");
  const [transfer, setTransfer] = useState<keyof typeof TRANSFER>("digital");
  const [sitePrice, setSitePrice] = useState(PRICES.siteVisit);
  const [team, setTeam] = useState<keyof typeof TEAMS>("lean");
  const [margin, setMargin] = useState(true);

  const budget = lakhs * 1_00_000;
  const r = allIn({ budget, plan, transfer, sitePrice });
  const be = breakEven({ budget, visitSpend: r.visits, withMargin: margin, team });

  return (
    <>
      <Back href="/" label="Homes" />
      <h1>What a family really pays</h1>
      <p className="hint">Demo estimate. Visit prices are placeholders until we have real quotes.</p>

      <h3>The build</h3>
      <section className="group pad price-inputs">
        <label>
          <span>Build size: <strong>₹{lakhs} lakh</strong></span>
          <input type="range" min={10} max={50} step={1} value={lakhs} onChange={(e) => setLakhs(Number(e.target.value))} />
        </label>
        <label>
          <span>Engineer checks</span>
          <select value={plan} onChange={(e) => setPlan(e.target.value as keyof typeof PLANS)}>
            {Object.entries(PLANS).map(([k, p]) => <option key={k} value={k}>{p.label}</option>)}
          </select>
        </label>
        <label>
          <span>One site visit, placeholder</span>
          <input type="number" min={1000} step={500} value={sitePrice} onChange={(e) => setSitePrice(Math.max(0, Number(e.target.value)))} />
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
        <div className="row"><div className="grow">Homeward fee, 1.5%</div><span>{rupees(r.fee)}</span></div>
        <div className="row"><div className="grow">Engineer visits</div><span>{rupees(r.visits)}</span></div>
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
        <label className="price-check">
          <input type="checkbox" checked={margin} onChange={(e) => setMargin(e.target.checked)} />
          <span>Homeward keeps 15% of visit prices</span>
        </label>
      </section>
      <section className="group">
        <div className="row"><div className="grow">Left per build after its costs</div><span>{rupees(be.per)}</span></div>
        {be.builds === null ? (
          <div className="row"><strong className="grow">Builds a year</strong><strong>Never at this size</strong></div>
        ) : (
          <>
            <div className="row"><strong className="grow">Builds a year to break even</strong><strong>{be.builds.toLocaleString("en-IN")}</strong></div>
            <div className="row"><div className="grow">Share of Kerala builds we could serve</div><span className="muted">{percent(be.shareBase!)} of {MARKET.base.toLocaleString("en-IN")} (base) · {percent(be.shareLow!)} of {MARKET.low.toLocaleString("en-IN")} (low)</span></div>
          </>
        )}
      </section>
      <p className="hint">Market, costs and the 15% are our assumptions. The pilot replaces them. Details: docs/business-plan.md.</p>
    </>
  );
}
