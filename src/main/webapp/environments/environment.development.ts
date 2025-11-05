// Development environment configuration
// LD_CLIENT_ID is injected at build time via webpack DefinePlugin
// Set the LD_CLIENT_ID environment variable in your .env.local file
declare const __LD_CLIENT_ID__: string;

export const environment = {
  VERSION: 'DEV',
  DEBUG_INFO_ENABLED: true,
  ldClientId: typeof __LD_CLIENT_ID__ !== 'undefined' ? __LD_CLIENT_ID__ : '',
};
