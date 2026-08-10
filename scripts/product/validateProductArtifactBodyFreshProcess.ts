import{validateCurrentAccessScenario}from"./validateProductArtifactAuthorizationBeforeBodyRead";validateCurrentAccessScenario("body-fresh-process").catch(e=>{console.error(e);process.exitCode=1});
