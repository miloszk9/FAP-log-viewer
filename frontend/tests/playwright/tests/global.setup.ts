import { test as setup } from "@playwright/test";
import { execSync } from "child_process";

setup("setup docker", async () => {
  execSync("cd ../ && docker compose -f docker-compose-e2e.yml up -d --build", { stdio: "inherit" });
});
