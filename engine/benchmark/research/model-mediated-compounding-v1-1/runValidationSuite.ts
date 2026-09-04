import {SUITES,runChild} from "./validationProgram";
const name=process.argv[2],entry=SUITES.find(x=>x.suite===name);if(!entry)throw new Error("SUITE_UNKNOWN");console.log(JSON.stringify(runChild(entry)));
