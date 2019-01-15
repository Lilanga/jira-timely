export const profileSchema = {
    title: 'User profile schema',
    description: 'Database schema for user profile',
    version: 0,
    type: 'object',
    properties: {
        self: {
            type: 'string'
        },
        key: {
            type: 'string',
            primary: true
        },
        name: {
            type: 'string'
        },
        emailAddress: {
            type: 'string'
        },
        avatarUrls: {
            type: 'object',
            properties: {
                extraSmall: {
                    type: "string"
                },
                small: {
                    type: "string"
                },
                medium: {
                    type: "string"
                },
                large: {
                    type: "string"
                }
            }
        },
        displayName: {
            type: 'string'
        },
        active: {
            type: 'boolean'
        },
        timeZone: {
            type: 'string'
        },
        locale: {
            type: 'string'
        }
    },
    required: ['key', 'name', 'emailAddress']
}