import { calibrationScenarios } from "./fixtures";

export const holdoutFixtures = calibrationScenarios.filter(
  (scenario) => scenario.split === "holdout",
);

export const negativeControlFixtures = calibrationScenarios.filter(
  (scenario) => scenario.split === "negative-control",
);
