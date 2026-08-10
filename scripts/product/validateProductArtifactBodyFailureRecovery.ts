import{validateCurrentAccessScenario}from"./validateProductArtifactAuthorizationBeforeBodyRead";validateCurrentAccessScenario("body-failure-recovery").catch(e=>{console.error(e);process.exitCode=1});
