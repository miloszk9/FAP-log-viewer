import { test as teardown } from "@playwright/test";
import { execSync } from "child_process";

teardown("teardown docker", async () => {
  execSync("cd ../ && docker compose down -v", { stdio: "inherit" });
});
