// ===================================================================
// DEPRECATED: This file is kept for reference only
// 
// DO NOT hardcode the Client-side ID in environment files!
// Instead, use environment variables as shown in docs/LAUNCHDARKLY_SETUP.md
// ===================================================================
//
// The environment files now use build-time injection via webpack:
//   ldClientId: typeof __LD_CLIENT_ID__ !== 'undefined' ? __LD_CLIENT_ID__ : ''
//
// Set the LD_CLIENT_ID environment variable before building:
//   export LD_CLIENT_ID="your-client-side-id"
//   npm start
//
// See docs/LAUNCHDARKLY_SETUP.md for detailed instructions

declare const __LD_CLIENT_ID__: string;

export const environment = {
  VERSION: 'DEV',
  DEBUG_INFO_ENABLED: true,
  ldClientId: typeof __LD_CLIENT_ID__ !== 'undefined' ? __LD_CLIENT_ID__ : '',
};
