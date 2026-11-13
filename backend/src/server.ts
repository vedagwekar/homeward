import { createApp } from "./routes";

const port = Number(process.env.PORT ?? 4000);
createApp().listen(port, () => console.log(`Homeward API on http://localhost:${port}/api/health`));
