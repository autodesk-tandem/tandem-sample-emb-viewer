// this file is used to configure different environments.  Comment or uncomment as appropriate,
// and add your Forge Keys here

const stgEnvironment = {
  name: "stg",
  oxygenHost: "https://accounts-staging.autodesk.com",
  forgeHost: "https://developer-stg.api.autodesk.com",
  forgeKey: "qGQp6HR6IRjSTPebAPYSC9DSzne8NEYS", // TODO: Replace with your Forge Key
  loginRedirect: "http://localhost:8080",
  tandemDbBaseURL: "https://tandem-stg.autodesk.com/api",
  tandemAppBaseURL: "https://tandem-stg.autodesk.com/app",
  dtLmvEnv: "DtStaging",
};

const prodEnvironment = {
  name: "prod",
  oxygenHost: "https://accounts.autodesk.com",
  forgeHost: "https://developer.api.autodesk.com",
  forgeKey: "RoeNvKJVPJoPr615usmL5RFSA5N81G39", // TODO: Replace with your Forge Key
  loginRedirect: "TODO",
  tandemDbBaseURL: "https://tandem.autodesk.com/api",
  tandemAppBaseURL: "https://tandem.autodesk.com/app",
  dtLmvEnv: "DtProduction",
};

const githubPages = {
  name: "stg",
  oxygenHost: "https://accounts-staging.autodesk.com",
  forgeHost: "https://developer-stg.api.autodesk.com",
  forgeKey: "qGQp6HR6IRjSTPebAPYSC9DSzne8NEYS", // TODO: Replace with your Forge Key
  loginRedirect: "https://autodesk-tandem.github.io/sample-emb-viewer/index.html",
  tandemDbBaseURL: "https://tandem-stg.autodesk.com/api",
  tandemAppBaseURL: "https://tandem-stg.autodesk.com/app",
  dtLmvEnv: "DtStaging",
};

export function getEnv() {
  if (window.location.hostname === "autodesk-tandem.github.io") {
    return githubPages;
  } else {
    //return prodEnvironment;       // TODO: comment/uncomment as appropriate
    return stgEnvironment;
  }
}
