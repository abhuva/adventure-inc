import { execFileSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function collectJsFiles(dir) {
  return readdirSync(dir)
    .flatMap((entry) => {
      const path = join(dir, entry);
      const stats = statSync(path);
      if (stats.isDirectory()) return collectJsFiles(path);
      return path.endsWith(".js") ? [path] : [];
    })
    .sort();
}

const files = ["src/main.js", ...collectJsFiles("src").filter((file) => file !== "src\\main.js" && file !== "src/main.js")];

for (const file of files) {
  execFileSync(process.execPath, ["--check", file], { stdio: "inherit" });
}

console.log(`checked ${files.length} JavaScript files`);
