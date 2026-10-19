import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const project = resolve(import.meta.dirname, "..");
const source = join(project, ".open-next");
const destination = join(project, "dist");
if (!existsSync(join(source, "worker.js"))) throw new Error("Run the OpenNext Cloudflare build first.");
rmSync(destination, { recursive: true, force: true });
mkdirSync(join(destination, "server"), { recursive: true });
cpSync(source, join(destination, "server"), { recursive: true });
cpSync(join(source, "worker.js"), join(destination, "server", "index.js"));
cpSync(join(source, "assets"), join(destination, "client"), { recursive: true });

