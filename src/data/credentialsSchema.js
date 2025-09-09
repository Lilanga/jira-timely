export const credentialsSchema = {
    title: 'Login credentials schema',
    description: 'Database schema for login credentials',
    version: 0,
    primaryKey: 'email',
    type: 'object',
    properties: {
      url: {
        type: 'string'
      },
      email: {
        type: 'string'
      },
      password: {
        type: 'string'
      }
    },
    required: ['url', 'email', 'password']
  }