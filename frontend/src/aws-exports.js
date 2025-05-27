const awsconfig = {
  Auth: {
    region: 'eu-central-1',
    userPoolId: '<COGNITO_USER_POOL_ID>',
    userPoolWebClientId: '<COGNITO_USER_POOL_CLIENT_ID>',
    identityPoolId: '<COGNITO_IDENTITY_POOL_ID>',
    oauth: {
      domain: '<COGNITO_DOMAIN>', // e.g. gpt-wrapper.auth.eu-central-1.amazoncognito.com
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: 'http://localhost:5173/',
      redirectSignOut: 'http://localhost:5173/',
      responseType: 'code',
    },
  },
};

export default awsconfig; 