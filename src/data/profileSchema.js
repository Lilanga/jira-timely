export const profileSchema = {
    title: 'User profile schema',
    description: 'Database schema for user profile',
    version: 0,
    primaryKey: 'emailAddress',
    type: 'object',
    properties: {
        self: {
            type: 'string'
        },
        key: {
            type: 'string'
        },
        name: {
            type: 'string'
        },
        emailAddress: {
            type: 'string'
        },
        avatarUrls: {
            type: 'object',
            additionalProperties: false,
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
    required: ['emailAddress']
}