import assert from "node:assert/strict";
import test from "node:test";
import { LANGUAGES, smsThread, t } from "./parent-text.mjs";

test("every language has every key the English screen uses", () => {
  const sample = ["myHome", "yes", "again", "neverPaid", "approved", "smsReady", "smsPaid", "listen", "bigger"];
  for (const l of LANGUAGES) for (const k of sample) assert.notEqual(t(l, k, { name: "X", stage: "Y" }), k, `${l} ${k}`);
});
test("placeholders are filled and translations differ from English", () => {
  assert.equal(t("English", "checking", { name: "R. Menon" }), "R. Menon is checking the work.");
  assert.notEqual(t("മലയാളം", "yes"), t("English", "yes"));
  assert.ok(t("ਪੰਜਾਬੀ", "approved", { name: "R. Menon" }).includes("R. Menon"));
});
const project = { engineer: { name: "A", secondName: "B" }, stages: [{ name: "Foundation", status: "paid" }, { name: "Walls", status: "submitted", engineerDecision: "approved" }] };
test("a basic phone gets a message for each paid stage and asks for a reply when it is ready", () => {
  const thread = smsThread("English", project, project.stages[1]);
  assert.equal(thread.length, 2);
  assert.match(thread[0].text, /Foundation is paid/);
  assert.equal(thread[1].reply, true);
});
test("while the engineer is checking, the parent is told, with no reply asked for", () => {
  const stage = { name: "Walls", status: "submitted" };
  const thread = smsThread("English", { ...project, stages: [project.stages[0], stage] }, stage);
  assert.equal(thread.at(-1).reply, undefined);
  assert.match(thread.at(-1).text, /A is checking/);
});
