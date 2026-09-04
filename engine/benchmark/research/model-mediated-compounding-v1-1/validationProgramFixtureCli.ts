import {readFileSync} from "node:fs";import {validateSummaries} from "./validationProgram";
const fixture=JSON.parse(readFileSync(process.argv[2],"utf8"));validateSummaries(fixture.summaries,fixture.expected);console.log(JSON.stringify({result:"PASS"}));
