"use client";

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { useProjects } from "@/lib/store";
import { Back, Tile } from "../../../icons";

const siteTime = () =>
  new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", second: "2-digit" });

export default function View({ id }: { id: string }) {
  const project = useProjects().find((p) => p.id === id);
  const [time, setTime] = useState(""); // set after load, so server and browser render the same thing
  useEffect(() => {
    setTime(siteTime());
    const timer = setInterval(() => setTime(siteTime()), 1000);
    return () => clearInterval(timer);
  }, []);
  if (!project) notFound();

  return (
    <>
      <Back href={`/homes/${project.id}`} label={project.name} />
      <h1>Site camera</h1>
      <p className="intro">A fixed camera on the build, so you can check any time without waiting for someone on site.</p>

      <figure className="live">
        {/* shortcut: a still sample image stands in for the stream; a real launch embeds the camera's feed here */}
        <img src="/samples/site-camera.svg" alt="Sample view of the house being built" />
        <span className="live-badge">LIVE</span>
        <span className="live-time">{time && `${time} at the site`}</span>
        <figcaption>
          {project.place}
          <small>Sample feed, simulated</small>
        </figcaption>
      </figure>

      <h3>Privacy</h3>
      <section className="group">
        <div className="row">
          <Tile name="home" tone="blue" />
          <div className="grow">Points at the building, not at people</div>
        </div>
        <div className="row">
          <Tile name="lock" tone="gray" />
          <div className="grow">Only your family and the engineer can watch</div>
        </div>
        <div className="row">
          <Tile name="clock" tone="orange" />
          <div className="grow">Clips are deleted after 7 days</div>
        </div>
        <div className="row">
          <Tile name="person" tone="green" />
          <div className="grow">Workers are told there's a camera, with a sign on site</div>
        </div>
      </section>
    </>
  );
}
