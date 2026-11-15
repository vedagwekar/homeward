"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { totalFunded } from "@/lib/project.mjs";
import type { BufferGeometry } from "three";
import type { Project } from "@/lib/store";

// How one stage looks in the model.
type Look = "none" | "waiting" | "checking" | "paid" | "failed";

/** Each stage's look, from its status and from how far the family's money reaches. */
export function looks(project: Project): Record<string, Look> {
  const started = project.stages.filter((s) => s.status !== "locked");
  let spare = totalFunded(project) - started.reduce((sum, s) => sum + s.amount, 0);
  const out: Record<string, Look> = {};
  for (const s of project.stages) {
    if (s.status === "paid") out[s.slug] = "paid";
    else if (s.status === "rejected") out[s.slug] = "failed";
    else if (s.status !== "locked") out[s.slug] = "checking";
    else {
      // Money covers locked stages in build order.
      out[s.slug] = spare >= s.amount ? "waiting" : "none";
      spare = Math.max(0, spare - s.amount);
    }
  }
  return out;
}

const TEAK = 0x5a3a26, LIME = 0xf4f2ea, TILE = 0xa9492e, LATERITE = 0x99583f, LEAF = 0x3f7d4c, BAMBOO = 0xc9a56b, CONCRETE = 0xd6d2c9;
const TINT: Partial<Record<Look, number>> = { waiting: 0xbfcddb, checking: 0xc9dece, failed: 0xf0c8c3 };
const REST = 0.32; // the angle the home rests at

// The models are drawn for the two demo homes, keyed by the home's id.
export const hasModel = (id: string) => id === "thrissur" || id === "jalandhar";

/**
 * The home in 3D. A stage that isn't funded is an outline, a funded or in-progress stage is a flat
 * tint, and a paid stage takes its real materials. Drag to turn it; tap a part to open that stage.
 * The stage list on the same screen carries the same information as text.
 */
export default function House3D({ project }: { project: Project }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = useRef(looks(project));
  live.current = looks(project); // the render loop reads this every frame
  const router = useRouter();
  const open = useRef((slug: string) => {});
  open.current = (slug) => router.push(`/homes/${project.id}/stages/${slug}`);
  const home = project.id;

  useEffect(() => {
    let stop = () => {};
    let gone = false;
    import("three").then((THREE) => {
      const el = canvas.current;
      if (gone || !el) return;
      const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
      camera.position.set(7, 5.6, 9);
      camera.lookAt(0, 1.35, 0);
      scene.add(new THREE.HemisphereLight(0xffffff, 0xc9d0d4, 1.2));
      const sun = new THREE.DirectionalLight(0xfff1dc, 2.1);
      sun.position.set(4, 9, 7);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.radius = 5;
      sun.shadow.bias = -0.0005;
      Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 });
      scene.add(sun);

      const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
      const pole = (r: number, len: number) => new THREE.CylinderGeometry(r, r, len, 10);
      // A Kerala hip roof: a rectangle that rises to a short ridge.
      const hipRoof = (hx: number, hz: number, ridge: number, h: number) => {
        const A = [-hx, 0, hz], B = [hx, 0, hz], C = [hx, 0, -hz], D = [-hx, 0, -hz], L = [-ridge, h, 0], R = [ridge, h, 0];
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute([A, B, R, A, R, L, C, D, L, C, L, R, B, C, R, D, A, L].flat(), 3));
        g.computeVertexNormals();
        return g;
      };
      const frond = () => box(1.7, 0.03, 0.3).translate(0.85, 0, 0);

      // [stage slug, or null for what already stands; shape; position; real colour; rotation]
      type Part = [string | null, BufferGeometry, number[], number, number[]?];
      const kerala: Part[] = [
        ["foundation", box(5.8, 0.4, 4.6), [0, 0.2, 0.2], LATERITE],
        ["foundation", box(1.6, 0.2, 0.4), [0, 0.1, 2.7], LATERITE],
        ["walls", box(4.6, 1.7, 2.7), [0, 1.25, -0.4], LIME],
        ...[-2.3, -0.8, 0.8, 2.3].map((x): Part => ["walls", box(0.17, 1.7, 0.17), [x, 1.25, 2.2], LIME]),
        ["walls", box(4.77, 0.12, 0.17), [0, 2.04, 2.2], LIME],
        ["roof", box(6.7, 0.07, 5.6), [0, 2.13, 0.2], TEAK],
        ["roof", hipRoof(3.45, 2.9, 1.3, 1.4), [0, 2.17, 0.2], TILE],
        ["roof", box(2.75, 0.09, 0.14), [0, 3.58, 0.2], 0x8a3a24],
        ["finishing", box(0.72, 1.22, 0.07), [0, 1.01, 0.97], TEAK],
        ["finishing", box(0.78, 0.68, 0.07), [-1.5, 1.4, 0.97], TEAK],
        ["finishing", box(0.78, 0.68, 0.07), [1.5, 1.4, 0.97], TEAK],
        ["finishing", box(4.77, 0.06, 0.06), [0, 0.95, 2.2], TEAK],
        ["handover", new THREE.CylinderGeometry(0.07, 0.12, 3.4, 10), [3.9, 1.7, -1.4], 0x8a7558, [0, 0, -0.06]],
        ...[0, 1, 2, 3, 4, 5].map((i): Part => ["handover", frond(), [3.8, 3.4, -1.4], LEAF, [0, i * 1.047 + 0.3, -0.5]]),
      ];
      const punjab: Part[] = [
        [null, box(5.3, 0.3, 3.9), [0, 0.15, 0], 0xbdb8ae],
        [null, box(4.7, 2.0, 3.3), [0, 1.3, 0], 0xb65d44],
        [null, box(4.95, 0.14, 3.55), [0, 2.37, 0], 0x9d988f],
        [null, box(0.72, 1.3, 0.07), [-0.95, 0.95, 1.68], 0x3f5e73],
        [null, box(0.85, 0.72, 0.07), [1.05, 1.5, 1.68], 0x3f5e73],
        ...[-2.65, -0.9, 0.9, 2.65].flatMap((x) => [1.95, 2.5].map((z): Part => ["prep", pole(0.045, 3.0), [x, 1.5, z], BAMBOO])),
        ...[1.15, 2.25].flatMap((y) => [1.95, 2.5].map((z): Part => ["prep", pole(0.04, 5.6), [0, y, z], BAMBOO, [0, 0, Math.PI / 2]])),
        ["prep", box(5.3, 0.05, 0.5), [0, 2.3, 2.22], 0xb98f5a],
        ["repairs", box(5.05, 0.2, 3.65), [0, 2.54, 0], CONCRETE],
        ...[-1.765, 1.765].map((z): Part => ["repairs", box(5.05, 0.42, 0.12), [0, 2.85, z], CONCRETE]),
        ...[-2.465, 2.465].map((x): Part => ["repairs", box(0.12, 0.42, 3.65), [x, 2.85, 0], CONCRETE]),
        ["handover", box(1.1, 0.1, 1.1), [1.4, 2.69, -0.8], CONCRETE],
        ["handover", new THREE.CylinderGeometry(0.45, 0.45, 0.8, 20), [1.4, 3.14, -0.8], 0x2e2f33],
      ];

      const group = new THREE.Group();
      scene.add(group);
      // The plot the home stands on.
      const plot = new THREE.Mesh(new THREE.CylinderGeometry(5.3, 5.3, 0.06, 64), new THREE.MeshStandardMaterial({ color: 0xe2ddd3, roughness: 1 }));
      plot.position.y = -0.03;
      plot.receiveShadow = true;
      group.add(plot);
      const items = (home === "jalandhar" ? punjab : kerala).map(([slug, geo, pos, real, rot]) => {
        const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: real, roughness: 0.9, transparent: true, opacity: slug ? 0 : 1 }));
        mesh.position.set(pos[0], pos[1], pos[2]);
        mesh.rotation.order = "YZX";
        if (rot) mesh.rotation.set(rot[0], rot[1], rot[2]);
        mesh.castShadow = mesh.receiveShadow = true;
        mesh.userData.slug = slug;
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), new THREE.LineBasicMaterial({ color: 0x2b211b, transparent: true, opacity: 0.3 }));
        edges.position.copy(mesh.position);
        edges.rotation.copy(mesh.rotation);
        group.add(mesh, edges);
        return { slug, mesh, edges, real: new THREE.Color(real), y: pos[1], was: "" as Look | "" };
      });

      const fit = () => {
        const w = el.clientWidth, h = el.clientHeight;
        if (!w) return;
        renderer.setSize(w, h, false);
        // Fit the plot's width on a phone; on a wide screen fit its height instead.
        const aspect = w / h, across = Math.max(5.7, 3.1 * aspect);
        Object.assign(camera, { left: -across, right: across, top: across / aspect, bottom: -across / aspect });
        camera.updateProjectionMatrix();
      };
      const watcher = new ResizeObserver(fit);
      watcher.observe(el);
      fit();

      let turn = REST, angle = calm ? REST : REST - 0.9, down: { x: number; turn: number; moved: number } | null = null;
      const onDown = (e: PointerEvent) => {
        down = { x: e.clientX, turn, moved: 0 };
        el.setPointerCapture(e.pointerId);
      };
      const onMove = (e: PointerEvent) => {
        if (!down) return;
        down.moved = Math.abs(e.clientX - down.x);
        turn = down.turn + (e.clientX - down.x) * 0.012;
      };
      const onUp = (e: PointerEvent) => {
        if (down && down.moved < 5) {
          // A tap, not a drag: open that stage.
          const r = el.getBoundingClientRect(), ray = new THREE.Raycaster();
          ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
          const hit = ray.intersectObjects(items.filter((i) => i.slug).map((i) => i.mesh))[0];
          if (hit) open.current(hit.object.userData.slug);
        }
        down = null;
      };
      el.addEventListener("pointerdown", onDown);
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerup", onUp);

      const k = calm ? 1 : 0.07, tint = new THREE.Color();
      renderer.setAnimationLoop((t) => {
        angle += (turn - angle) * (calm ? 1 : 0.1);
        group.rotation.y = angle;
        for (const it of items) {
          if (!it.slug) continue;
          const look = live.current[it.slug] ?? "none", m = it.mesh.material;
          if (look !== it.was) {
            if (look === "paid" && it.was && !calm) it.mesh.position.y = it.y + 0.5; // a newly paid part drops into place
            it.was = look;
          }
          m.opacity += ((look === "none" ? 0 : 1) - m.opacity) * k;
          it.mesh.visible = m.opacity > 0.02;
          it.mesh.castShadow = m.opacity > 0.5;
          if (look === "paid") tint.copy(it.real);
          else if (TINT[look]) tint.setHex(TINT[look]!);
          if (look === "checking" && !calm) tint.offsetHSL(0, 0, Math.sin(t / 420) * 0.03);
          m.color.lerp(tint, k);
          it.mesh.position.y += (it.y - it.mesh.position.y) * 0.09;
          it.edges.position.y = it.mesh.position.y;
          it.edges.material.color.setHex(look === "failed" ? 0xb3261e : 0x2b211b);
          it.edges.material.opacity += ((look === "paid" ? 0.16 : look === "none" ? 0.3 : 0.5) - it.edges.material.opacity) * k;
        }
        renderer.render(scene, camera);
      });

      stop = () => {
        renderer.setAnimationLoop(null);
        watcher.disconnect();
        el.removeEventListener("pointerdown", onDown);
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerup", onUp);
        renderer.dispose();
      };
    });
    return () => {
      gone = true;
      stop();
    };
  }, [home]);

  return (
    <div className="house3d">
      <canvas ref={canvas} role="img" aria-label={`A 3D model of ${project.name}. Parts that are paid for look real, and the rest is an outline. The stage list below says the same in words.`} />
      <p>Drag to turn it.</p>
    </div>
  );
}
