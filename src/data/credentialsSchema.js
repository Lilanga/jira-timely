export const credentialsSchema = {
    title: 'Login credentials schema',
    description: 'Database schema for login credentials',
    version: 0,
    type: 'object',
    properties: {
      url: {
        type: 'string'
      },
      email: {
        type: 'string',
        primary: true
      },
      password: {
        type: 'string'
      }
    },
    required: ['url', 'email', 'password']
  }