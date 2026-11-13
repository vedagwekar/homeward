"use client";

import { notFound } from "next/navigation";
import directory from "@/mock/directory.json";
import { act, useProjects, useStatus } from "@/lib/store";
import { Back, Tile } from "../../../icons";

export default function View({ id }: { id: string }) {
  const project = useProjects().find((p) => p.id === id);
  const busy = useStatus().state === "loading";
  if (!project) notFound();
  const state = project.place.split(", ").pop();
  const nearby = directory.filter((d) => d.state === state);

  return (
    <>
      <Back href={`/homes/${project.id}`} label={project.name} />
      <h1>Builder and engineer</h1>

      <h3>Your team</h3>
      <section className="group">
        <div className="row">
          <Tile name="hammer" tone="orange" />
          <div className="grow">
            <span>{project.builder.name}</span>
            <small>Builder</small>
          </div>
        </div>
        <div className="row">
          <Tile name="shield" tone="indigo" />
          <div className="grow">
            <span>{project.engineer.name}</span>
            <small>Engineer. {project.engineer.licence}</small>
          </div>
        </div>
        <div className="row">
          <Tile name="shield" tone="gray" />
          <div className="grow">
            <span>{project.engineer.secondName}</span>
            <small>Second engineer, only if a second check is asked for</small>
          </div>
        </div>
      </section>

      <h3>Find someone in {state}</h3>
      <p className="note">Homeward checks each person's licence and past work, and interviews them, before they're listed. Families pay each engineer visit at a price agreed up front, through Homeward, never through the builder. These are sample profiles.</p>
      <section className="group">
        {nearby.map((d) => (
          <div className="row" key={d.name}>
            <Tile name={d.role === "Engineer" ? "shield" : "hammer"} tone={d.role === "Engineer" ? "indigo" : "orange"} />
            <div className="grow">
              <span>{d.name}</span>
              <small>
                {d.role}. {d.about}
              </small>
            </div>
            <button
              className="pill"
              type="button"
              disabled={busy}
              onClick={() => act({ loading: `Contacting ${d.name}`, done: `Quote request sent to ${d.name} (simulated)` }, () => {})}
            >
              Ask
            </button>
          </div>
        ))}
      </section>
    </>
  );
}
