import { calibrationScenarios } from "./fixtures";

export const calibrationFixtures = calibrationScenarios.filter(
  (scenario) => scenario.split === "calibration" || scenario.split === "validation",
);
