const awsconfig = {
  Auth: {
    region: 'eu-central-1',
    userPoolId: 'eu-central-1_EzUfGhX4Q',
    userPoolWebClientId: 'ukm4ait9ubtm12mrji6trjfhg',
    identityPoolId: 'eu-central-1:0e6b9205-a0fb-40ff-9f6e-d020afc13369',
    oauth: {
      domain: 'gpt-wrapper', // e.g. gpt-wrapper.auth.eu-central-1.amazoncognito.com
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: 'http://localhost:5173/',
      redirectSignOut: 'http://localhost:5173/',
      responseType: 'code',
    },
  },
};

export default awsconfig; 