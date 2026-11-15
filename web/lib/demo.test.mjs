import assert from "node:assert/strict";
import test from "node:test";
import { demoStep, stageOwner } from "./demo.mjs";

const stage = (status, extra = {}) => ({ slug: "s", name: "Roof slab", amount: 100, materials: 0, status, ...extra });
const project = (stages, paidIn = 0, extra = {}) => ({ id: "p", sponsors: [{ paidIn }], stages, ...extra });

test("an unfunded stage starts with the family locking money", () => {
  assert.equal(demoStep(project([stage("locked")], 0)).id, "fund");
});
test("a funded, locked stage is started by the builder", () => {
  assert.equal(demoStep(project([stage("locked")], 100)).id, "start");
});
test("an open or rejected stage waits for the builder's video", () => {
  assert.equal(demoStep(project([stage("open")])).id, "proof");
  assert.equal(demoStep(project([stage("rejected", { engineerDecision: "rejected" })])).id, "proof");
});
test("a sent video waits for the engineer", () => {
  assert.equal(demoStep(project([stage("submitted")])).id, "engineer");
});
test("after the engineer approves, the parent decides", () => {
  assert.equal(demoStep(project([stage("submitted", { engineerDecision: "approved" })])).id, "parent");
});
test("after a second check is asked for, the second engineer decides", () => {
  assert.equal(demoStep(project([stage("submitted", { engineerDecision: "approved", amma: "recheck" })])).id, "second");
});
test("when the second engineer rejects, the money stays locked", () => {
  assert.equal(demoStep(project([stage("rejected", { amma: "recheck", secondDecision: "rejected" })])).id, "locked");
});
test("a stopped build and a finished build are handled", () => {
  assert.equal(demoStep(project([stage("locked")], 0, { frozen: true })).id, "stopped");
  assert.equal(demoStep(project([stage("paid")])).id, "finished");
  assert.equal(demoStep(undefined).id, "none");
});

test("a build that needs its deposit sends the builder there before starting", () => {
  const p = project([stage("locked")], 100, { security: { upfront: 50, posted: 0 } });
  assert.equal(demoStep(p).id, "deposit");
  assert.equal(demoStep({ ...p, security: { upfront: 50, posted: 50 } }).id, "start");
});
test("stageOwner says who is holding each stage up", () => {
  const p = project([stage("paid", { slug: "a" }), stage("locked", { slug: "b" }), stage("locked", { slug: "c" })], 100);
  assert.equal(stageOwner(p, p.stages[0]).text, "Paid");
  assert.equal(stageOwner(p, p.stages[1]).who, "sponsor");
  assert.equal(stageOwner(p, p.stages[2]).text, "Later");
  assert.equal(stageOwner(project([stage("open")]), stage("open")).who, "builder");
  assert.equal(stageOwner(project([]), stage("submitted")).who, "engineer");
  assert.equal(stageOwner(project([]), stage("submitted", { engineerDecision: "approved" })).who, "parent");
  assert.equal(stageOwner(project([]), stage("submitted", { engineerDecision: "approved", amma: "recheck" })).who, "engineer");
});
