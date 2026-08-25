import { defineConfig } from "@playwright/test";

const baseURL=process.env.AR2_PRE_001B_BASE_URL;
if(baseURL&&!/^http:\/\/127\.0\.0\.1:\d{4,5}$/.test(baseURL))throw new Error("Acceptance base URL must be loopback");
export default defineConfig({
  testDir:"./scripts/acceptance",testMatch:"ar3BrowserMeasurementProducer.spec.ts",workers:1,fullyParallel:false,retries:0,
  timeout:120_000,expect:{timeout:20_000},reporter:[["line"]],outputDir:process.env.AR2_PRE_001B_BROWSER_OUTPUT_ROOT??"/private/tmp/discovery-ar2-pre-001b-forbidden-default",
  use:{baseURL,headless:true,browserName:"chromium",trace:"off",video:"off",screenshot:"off",acceptDownloads:false},
});
