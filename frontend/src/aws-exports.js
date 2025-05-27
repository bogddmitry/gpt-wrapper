const awsconfig = {
  Auth: {
    region: 'us-east-1', // update if needed
    userPoolId: '<COGNITO_USER_POOL_ID>',
    userPoolWebClientId: '<COGNITO_USER_POOL_CLIENT_ID>',
    identityPoolId: '<COGNITO_IDENTITY_POOL_ID>',
    oauth: {
      domain: '<COGNITO_DOMAIN>', // e.g. gpt-wrapper.auth.us-east-1.amazoncognito.com
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: 'http://localhost:5173/',
      redirectSignOut: 'http://localhost:5173/',
      responseType: 'code',
    },
  },
};

export default awsconfig; 