import { runExperiment } from "./experiment";

const result = runExperiment();
console.log(JSON.stringify({
  experiment: result.experiment,
  classification: result.classification,
  metrics: result.metrics,
  optimizerMetrics: result.optimizerMetrics,
  resultTypes: Object.fromEntries(
    [...new Set(result.candidates.map((item) => item.resultType))]
      .sort()
      .map((type) => [type, result.candidates.filter((item) => item.resultType === type).length]),
  ),
}, null, 2));
