// Production environment configuration
// LD_CLIENT_ID is injected at build time via webpack DefinePlugin
// Set the LD_CLIENT_ID environment variable before building for production
declare const __VERSION__: string;
declare const __LD_CLIENT_ID__: string;

export const environment = {
  VERSION: __VERSION__,
  DEBUG_INFO_ENABLED: false,
  ldClientId: typeof __LD_CLIENT_ID__ !== 'undefined' ? __LD_CLIENT_ID__ : '',
};
