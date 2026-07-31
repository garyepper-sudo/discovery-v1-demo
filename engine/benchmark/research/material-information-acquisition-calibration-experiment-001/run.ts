import { runAblations } from "./ablation";
import { runCalibrationExperiment } from "./evaluator";
import { runSequentialCalibration } from "./sequential";

console.log(JSON.stringify({ calibration: runCalibrationExperiment(), ablations: runAblations(), sequential: runSequentialCalibration() }, null, 2));
