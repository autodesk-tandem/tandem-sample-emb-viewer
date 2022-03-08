
// this file is used to configure different environments.  Comment or uncomment as appropriate,
// and add your Forge Keys here

const stgEnvironment = {
	name: 'stg',
	oxygenHost: 'https://accounts-staging.autodesk.com',
	forgeHost: 'https://developer-stg.api.autodesk.com',
	forgeKey: 'qGQp6HR6IRjSTPebAPYSC9DSzne8NEYS',        // TODO: Replace with your Forge Key
	appHost: 'https://tandem-stg.autodesk.com',
  tandemDbBaseURL: 'https://tandem-stg.autodesk.com/api',
  tandemAppBaseURL: 'https://tandem-stg.autodesk.com/app',
	dtLmvEnv: 'DtStaging'
};

const prodEnvironment = {
	name: 'prod',
	oxygenHost: 'https://accounts.autodesk.com',
	forgeHost: 'https://developer.api.autodesk.com',
	forgeKey: 'RoeNvKJVPJoPr615usmL5RFSA5N81G39',       // TODO: Replace with your Forge Key
	appHost: 'https://tandem.autodesk.com',
	tandemDbBaseURL: 'https://tandem.autodesk.com/api',
  tandemAppBaseURL: 'https://tandem.autodesk.com/app',
	dtLmvEnv: 'DtProduction'
};


export function getEnv() {
  //return prodEnvironment;       // TODO: comment/uncomment as appropriate
  return stgEnvironment;
}
