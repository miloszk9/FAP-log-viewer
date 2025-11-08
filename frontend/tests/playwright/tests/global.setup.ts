import { test as setup } from "@playwright/test";
import { execSync } from "child_process";

setup("setup docker", async () => {
  execSync("cd ../ && docker compose up -d --build", { stdio: "inherit" });
});
