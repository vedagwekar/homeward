
'use client';

import { useState } from 'react';
import { project } from '../../lib/mockProject';

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

const stageStyle = {
  paid: {
    label: 'Paid',
    cls: 'bg-[#e3f1e9] text-[#1f6b45]',
  },
  waiting: {
    label: 'Waiting for you',
    cls: 'bg-[#fbe9dd] text-[#a2461f] font-bold',
  },
  locked: {
    label: 'Locked',
    cls: 'bg-[#eee8df] text-[#6b5a4a]',
  },
};

export default function AmmaPage() {
  const [choice, setChoice] =
    useState<null | 'ok' | 'recheck'>(null);

  const stage = project.stages.find(
    (s) => s.status === 'waiting'
  );

  if (!stage) {
    return <main>No stage is waiting for approval.</main>;
  }

  return (
    <main
      lang="en"
      className="mx-auto min-h-screen max-w-[480px] bg-[#faf6f0] px-5 pb-8 pt-6 text-xl leading-normal text-[#2b2118]"
    >
      <p className="m-0 text-base text-[#6b5a4a]">
        {project.house}
      </p>

      <h1 className="mb-5 mt-1 text-[2rem] font-bold leading-tight">
        {stage.name} is ready to pay
      </h1>

      <section className="mb-6 rounded-2xl border-2 border-[#e6dccf] bg-white p-5">
        <p className="mb-2">
          The engineer checked the steel and said it's correctly installed.
        </p>

        <p className="mb-2 text-4xl font-bold text-[#1f6b45]">
          {inr(stage.amount)}
        </p>

        <p>will be paid to the builder and supplier.</p>
      </section>

      {choice === null ? (
        <div className="mb-8 grid gap-4">
          <button
            className="min-h-[72px] rounded-2xl bg-[#1f6b45] text-[1.6rem] font-bold text-white"
            onClick={() => setChoice('ok')}
          >
            OK
          </button>

          <button
            className="min-h-[72px] rounded-2xl bg-[#a2461f] text-[1.6rem] font-bold text-white"
            onClick={() => setChoice('recheck')}
          >
            Check again
          </button>
        </div>
      ) : (
        <div
          role="status"
          className="mb-8 rounded-2xl border-2 border-[#e6dccf] bg-white p-5"
        >
          <p className="mb-3">
            {choice === 'ok'
              ? 'Thank you. Your OK is saved.'
              : 'Done. A second engineer will check before any money moves.'}
          </p>

          <button
            className="text-base text-[#6b5a4a] underline"
            onClick={() => setChoice(null)}
          >
            Start over (demo only)
          </button>
        </div>
      )}

      <ol
        aria-label="Build stages"
        className="mb-8 grid list-none gap-2 p-0"
      >
        {project.stages.map((s) => {
          const style =
            stageStyle[s.status as keyof typeof stageStyle];

          return (
            <li
              key={s.name}
              className={`flex justify-between rounded-xl px-4 py-3 text-lg ${style.cls}`}
            >
              <span>{s.name}</span>
              <span>{style.label}</span>
            </li>
          );
        })}
      </ol>

      <footer className="text-center text-sm text-[#6b5a4a]">
        Testnet demo: Interac, rupee payouts and SMS simulated.
      </footer>
    </main>
  );
}
