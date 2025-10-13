// this file is used to configure different environments.  Comment or uncomment as appropriate,
// and add your APS Keys here

const stgEnvironment = {
  name: "stg",
  oxygenHost: "https://accounts-staging.autodesk.com",
  apsHost: "https://developer-stg.api.autodesk.com",
  apsKey: "hZy6ABuq8STldhv3X6IDrgyXUOVZZHtW", // TODO: Replace with your APS Key to develop locally
  loginRedirect: "http://localhost:8000",
  tandemDbBaseURL: "https://tandem-stg.autodesk.com/api/v1",
  tandemAppBaseURL: "https://tandem-stg.autodesk.com/app",
  dtLmvEnv: "DtStaging",
};

const prodEnvironment = {
  name: "prod",
  oxygenHost: "https://accounts.autodesk.com",
  apsHost: "https://developer.api.autodesk.com",
  apsKey: "tvyaGMqCOud2PA96T0vpw5fIeZFnYXSIwSjjnE3AmGjUiTFu", // TODO: Replace with your APS Key to develop locally
  loginRedirect: "http://localhost:8000",
  tandemDbBaseURL: "https://developer.api.autodesk.com/tandem/v1",
  tandemAppBaseURL: "https://tandem.autodesk.com/app",
  dtLmvEnv: "DtProduction",
};

const githubPages = {
  name: "githubPages",
  oxygenHost: "https://accounts.autodesk.com",
  apsHost: "https://developer.api.autodesk.com",
  apsKey: "tvyaGMqCOud2PA96T0vpw5fIeZFnYXSIwSjjnE3AmGjUiTFu", // Do not replace, this is for deployed version
  loginRedirect: "https://autodesk-tandem.github.io/tandem-sample-emb-viewer",
  tandemDbBaseURL: "https://developer.api.autodesk.com/tandem/v1",
  tandemAppBaseURL: "https://tandem.autodesk.com/app",
  dtLmvEnv: "DtProduction",
};

export function getEnv() {
  if (window.location.hostname === "autodesk-tandem.github.io") {
    //console.log("TANDEM_ENV: using GitHubPages environment");
    return githubPages;
  }
  else {
    //console.log("TANDEM_ENV: using PROD environment");
    return prodEnvironment;       // TODO: comment/uncomment as appropriate
    //return stgEnvironment;
  }
}
