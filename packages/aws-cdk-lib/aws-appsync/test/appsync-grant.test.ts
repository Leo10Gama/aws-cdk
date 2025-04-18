import { join } from 'path';
import { Template } from '../../assertions';
import * as iam from '../../aws-iam';
import * as cdk from '../../core';
import * as appsync from '../lib';

let stack: cdk.Stack;
let role: iam.Role;
let api: appsync.GraphqlApi;
beforeEach(() => {
  // GIVEN
  stack = new cdk.Stack();
  role = new iam.Role(stack, 'Role', {
    assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
  });
  api = new appsync.GraphqlApi(stack, 'API', {
    name: 'demo',
    schema: appsync.SchemaFile.fromAsset(join(__dirname, 'appsync.test.graphql')),
    authorizationConfig: {
      defaultAuthorization: {
        authorizationType: appsync.AuthorizationType.IAM,
      },
    },
  });
});

describe('grant Permissions', () => {
  test('IamResource throws error when custom is called with no arguments', () => {
    // THEN
    expect(() => {
      api.grant(role, appsync.IamResource.custom(), 'appsync:GraphQL');
    }).toThrow('At least 1 custom ARN must be provided.');
  });

  test('grant provides custom permissions when called with `custom` argument', () => {
    // WHEN
    api.grant(role, appsync.IamResource.custom('types/Mutation/fields/addTest'), 'appsync:GraphQL');

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Action: 'appsync:GraphQL',
            Effect: 'Allow',
            Resource: {
              'Fn::Join': ['', [
                'arn:',
                { Ref: 'AWS::Partition' },
                ':appsync:',
                { Ref: 'AWS::Region' },
                ':',
                { Ref: 'AWS::AccountId' },
                ':apis/',
                { 'Fn::GetAtt': ['API62EA1CFF', 'ApiId'] },
                '/types/Mutation/fields/addTest',
              ]],
            },
          },
        ],
      },
    });
  });

  test('grant provides [type parameter]/* permissions when called with `type` argument', () => {
    // WHEN
    api.grant(role, appsync.IamResource.ofType('Mutation'), 'appsync:GraphQL');

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Action: 'appsync:GraphQL',
            Effect: 'Allow',
            Resource: {
              'Fn::Join': ['', [
                'arn:',
                { Ref: 'AWS::Partition' },
                ':appsync:',
                { Ref: 'AWS::Region' },
                ':',
                { Ref: 'AWS::AccountId' },
                ':apis/',
                { 'Fn::GetAtt': ['API62EA1CFF', 'ApiId'] },
                '/types/Mutation/*',
              ]],
            },
          },
        ],
      },
    });
  });

  test('grant provides fields/[field param] permissions when called with `type` and `field` argument', () => {
    // WHEN
    api.grant(role, appsync.IamResource.ofType('Mutation', 'addTest'), 'appsync:GraphQL');

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Action: 'appsync:GraphQL',
            Effect: 'Allow',
            Resource: {
              'Fn::Join': ['', [
                'arn:',
                { Ref: 'AWS::Partition' },
                ':appsync:',
                { Ref: 'AWS::Region' },
                ':',
                { Ref: 'AWS::AccountId' },
                ':apis/',
                { 'Fn::GetAtt': ['API62EA1CFF', 'ApiId'] },
                '/types/Mutation/fields/addTest',
              ]],
            },
          },
        ],
      },
    });
  });

  test('grant provides all permissions when called with IamResource.all()', () => {
    // WHEN
    api.grant(role, appsync.IamResource.all(), 'appsync:GraphQL');

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Action: 'appsync:GraphQL',
            Effect: 'Allow',
            Resource: {
              'Fn::Join': ['', [
                'arn:',
                { Ref: 'AWS::Partition' },
                ':appsync:',
                { Ref: 'AWS::Region' },
                ':',
                { Ref: 'AWS::AccountId' },
                ':apis/',
                { 'Fn::GetAtt': ['API62EA1CFF', 'ApiId'] },
                '/*',
              ]],
            },
          },
        ],
      },
    });
  });

  test('grant provides multiple permissions using one IamResource custom call', () => {
    // WHEN
    api.grant(role, appsync.IamResource.custom('I', 'am', 'custom'), 'appsync:GraphQL');

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Action: 'appsync:GraphQL',
            Effect: 'Allow',
            Resource: [
              {
                'Fn::Join': ['', [
                  'arn:',
                  { Ref: 'AWS::Partition' },
                  ':appsync:',
                  { Ref: 'AWS::Region' },
                  ':',
                  { Ref: 'AWS::AccountId' },
                  ':apis/',
                  { 'Fn::GetAtt': ['API62EA1CFF', 'ApiId'] },
                  '/I',
                ]],
              },
              {
                'Fn::Join': ['', [
                  'arn:',
                  { Ref: 'AWS::Partition' },
                  ':appsync:',
                  { Ref: 'AWS::Region' },
                  ':',
                  { Ref: 'AWS::AccountId' },
                  ':apis/',
                  { 'Fn::GetAtt': ['API62EA1CFF', 'ApiId'] },
                  '/am',
                ]],
              },
              {
                'Fn::Join': ['', [
                  'arn:',
                  { Ref: 'AWS::Partition' },
                  ':appsync:',
                  { Ref: 'AWS::Region' },
                  ':',
                  { Ref: 'AWS::AccountId' },
                  ':apis/',
                  { 'Fn::GetAtt': ['API62EA1CFF', 'ApiId'] },
                  '/custom',
                ]],
              },
            ],
          },
        ],
      },
    });
  });

  test('grant provides multiple permissions using one IamResource ofType call', () => {
    // WHEN
    api.grant(role, appsync.IamResource.ofType('I', 'am', 'custom'), 'appsync:GraphQL');

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Action: 'appsync:GraphQL',
            Effect: 'Allow',
            Resource: [
              {
                'Fn::Join': ['', [
                  'arn:',
                  { Ref: 'AWS::Partition' },
                  ':appsync:',
                  { Ref: 'AWS::Region' },
                  ':',
                  { Ref: 'AWS::AccountId' },
                  ':apis/',
                  { 'Fn::GetAtt': ['API62EA1CFF', 'ApiId'] },
                  '/types/I/fields/am',
                ]],
              },
              {
                'Fn::Join': ['', [
                  'arn:',
                  { Ref: 'AWS::Partition' },
                  ':appsync:',
                  { Ref: 'AWS::Region' },
                  ':',
                  { Ref: 'AWS::AccountId' },
                  ':apis/',
                  { 'Fn::GetAtt': ['API62EA1CFF', 'ApiId'] },
                  '/types/I/fields/custom',
                ]],
              },
            ],
          },
        ],
      },
    });
  });
});

describe('grantMutation Permissions', () => {
  test('grantMutation provides Mutation/* permissions when called with no `fields` argument', () => {
    // WHEN
    api.grantMutation(role);

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Action: 'appsync:GraphQL',
            Effect: 'Allow',
            Resource: {
              'Fn::Join': ['', [
                'arn:',
                { Ref: 'AWS::Partition' },
                ':appsync:',
                { Ref: 'AWS::Region' },
                ':',
                { Ref: 'AWS::AccountId' },
                ':apis/',
                { 'Fn::GetAtt': ['API62EA1CFF', 'ApiId'] },
                '/types/Mutation/*',
              ]],
            },
          },
        ],
      },
    });
  });

  test('grantMutation provides fields/[field param] permissions when called with `fields` argument', () => {
    // WHEN
    api.grantMutation(role, 'addTest');

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Action: 'appsync:GraphQL',
            Effect: 'Allow',
            Resource: {
              'Fn::Join': ['', [
                'arn:',
                { Ref: 'AWS::Partition' },
                ':appsync:',
                { Ref: 'AWS::Region' },
                ':',
                { Ref: 'AWS::AccountId' },
                ':apis/',
                { 'Fn::GetAtt': ['API62EA1CFF', 'ApiId'] },
                '/types/Mutation/fields/addTest',
              ]],
            },
          },
        ],
      },
    });
  });

  test('grantMutation provides multiple permissions when called with `fields` argument', () => {
    // WHEN
    api.grantMutation(role, 'addTest', 'removeTest');

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Action: 'appsync:GraphQL',
            Effect: 'Allow',
            Resource: [
              {
                'Fn::Join': ['', [
                  'arn:',
                  { Ref: 'AWS::Partition' },
                  ':appsync:',
                  { Ref: 'AWS::Region' },
                  ':',
                  { Ref: 'AWS::AccountId' },
                  ':apis/',
                  { 'Fn::GetAtt': ['API62EA1CFF', 'ApiId'] },
                  '/types/Mutation/fields/addTest',
                ]],
              },
              {
                'Fn::Join': ['', [
                  'arn:',
                  { Ref: 'AWS::Partition' },
                  ':appsync:',
                  { Ref: 'AWS::Region' },
                  ':',
                  { Ref: 'AWS::AccountId' },
                  ':apis/',
                  { 'Fn::GetAtt': ['API62EA1CFF', 'ApiId'] },
                  '/types/Mutation/fields/removeTest',
                ]],
              },
            ],
          },
        ],
      },
    });
  });
});

describe('grantQuery Permissions', () => {
  test('grantQuery provides Query/* permissions when called without the `fields` argument', () => {
    // WHEN
    api.grantQuery(role);

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Action: 'appsync:GraphQL',
            Effect: 'Allow',
            Resource: {
              'Fn::Join': ['', [
                'arn:',
                { Ref: 'AWS::Partition' },
                ':appsync:',
                { Ref: 'AWS::Region' },
                ':',
                { Ref: 'AWS::AccountId' },
                ':apis/',
                { 'Fn::GetAtt': ['API62EA1CFF', 'ApiId'] },
                '/types/Query/*',
              ]],
            },
          },
        ],
      },
    });
  });

  test('grantQuery provides fields/[field param] permissions when called with `fields` arugment', () => {
    // WHEN
    api.grantQuery(role, 'getTest');

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Action: 'appsync:GraphQL',
            Effect: 'Allow',
            Resource: {
              'Fn::Join': ['', [
                'arn:',
                { Ref: 'AWS::Partition' },
                ':appsync:',
                { Ref: 'AWS::Region' },
                ':',
                { Ref: 'AWS::AccountId' },
                ':apis/',
                { 'Fn::GetAtt': ['API62EA1CFF', 'ApiId'] },
                '/types/Query/fields/getTest',
              ]],
            },
          },
        ],
      },
    });
  });

  test('grantQuery provides multiple permissions when called with `fields` argument', () => {
    // WHEN
    api.grantQuery(role, 'getTests', 'getTest');

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Action: 'appsync:GraphQL',
            Effect: 'Allow',
            Resource: [
              {
                'Fn::Join': ['', [
                  'arn:',
                  { Ref: 'AWS::Partition' },
                  ':appsync:',
                  { Ref: 'AWS::Region' },
                  ':',
                  { Ref: 'AWS::AccountId' },
                  ':apis/',
                  { 'Fn::GetAtt': ['API62EA1CFF', 'ApiId'] },
                  '/types/Query/fields/getTests',
                ]],
              },
              {
                'Fn::Join': ['', [
                  'arn:',
                  { Ref: 'AWS::Partition' },
                  ':appsync:',
                  { Ref: 'AWS::Region' },
                  ':',
                  { Ref: 'AWS::AccountId' },
                  ':apis/',
                  { 'Fn::GetAtt': ['API62EA1CFF', 'ApiId'] },
                  '/types/Query/fields/getTest',
                ]],
              },
            ],
          },
        ],
      },
    });
  });
});

describe('grantSubscription Permissions', () => {
  test('grantSubscription provides Subscription/* permissions when called without `fields` argument', () => {
    // WHEN
    api.grantSubscription(role);

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Action: 'appsync:GraphQL',
            Effect: 'Allow',
            Resource: {
              'Fn::Join': ['', [
                'arn:',
                { Ref: 'AWS::Partition' },
                ':appsync:',
                { Ref: 'AWS::Region' },
                ':',
                { Ref: 'AWS::AccountId' },
                ':apis/',
                { 'Fn::GetAtt': ['API62EA1CFF', 'ApiId'] },
                '/types/Subscription/*',
              ]],
            },
          },
        ],
      },
    });
  });

  test('grantSubscription provides fields/[field param] when called with `field` argument', () => {
    api.grantSubscription(role, 'subscribe');

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Action: 'appsync:GraphQL',
            Effect: 'Allow',
            Resource: {
              'Fn::Join': ['', [
                'arn:',
                { Ref: 'AWS::Partition' },
                ':appsync:',
                { Ref: 'AWS::Region' },
                ':',
                { Ref: 'AWS::AccountId' },
                ':apis/',
                { 'Fn::GetAtt': ['API62EA1CFF', 'ApiId'] },
                '/types/Subscription/fields/subscribe',
              ]],
            },
          },
        ],
      },
    });
  });

  test('grantSubscription provides multiple permissions when called with `fields` argument', () => {
    // WHEN
    api.grantSubscription(role, 'subscribe', 'custom');

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: {
        Statement: [
          {
            Action: 'appsync:GraphQL',
            Effect: 'Allow',
            Resource: [
              {
                'Fn::Join': ['', [
                  'arn:',
                  { Ref: 'AWS::Partition' },
                  ':appsync:',
                  { Ref: 'AWS::Region' },
                  ':',
                  { Ref: 'AWS::AccountId' },
                  ':apis/',
                  { 'Fn::GetAtt': ['API62EA1CFF', 'ApiId'] },
                  '/types/Subscription/fields/subscribe',
                ]],
              },
              {
                'Fn::Join': ['', [
                  'arn:',
                  { Ref: 'AWS::Partition' },
                  ':appsync:',
                  { Ref: 'AWS::Region' },
                  ':',
                  { Ref: 'AWS::AccountId' },
                  ':apis/',
                  { 'Fn::GetAtt': ['API62EA1CFF', 'ApiId'] },
                  '/types/Subscription/fields/custom',
                ]],
              },
            ],
          },
        ],
      },
    });
  });
});

describe('imported API', () => {
  let importedApi: appsync.IGraphqlApi;
  beforeEach(() => {
    importedApi = appsync.GraphqlApi.fromGraphqlApiAttributes(stack, 'imported', {
      graphqlApiId: 'importedId',
    });
  });

  describe('grant Permissions', () => {
    test('IamResource throws error when custom is called with no arguments', () => {
      // THEN
      expect(() => {
        importedApi.grant(role, appsync.IamResource.custom(), 'appsync:GraphQL');
      }).toThrow('At least 1 custom ARN must be provided.');
    });

    test('grant provides custom permissions when called with `custom` argument', () => {
      // WHEN
      importedApi.grant(
        role,
        appsync.IamResource.custom('types/Mutation/fields/addTest'),
        'appsync:GraphQL',
      );

      // THEN
      Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: [
            {
              Action: 'appsync:GraphQL',
              Effect: 'Allow',
              Resource: {
                'Fn::Join': [
                  '',
                  [
                    'arn:',
                    { Ref: 'AWS::Partition' },
                    ':appsync:',
                    { Ref: 'AWS::Region' },
                    ':',
                    { Ref: 'AWS::AccountId' },
                    ':apis/importedId/types/Mutation/fields/addTest',
                  ],
                ],
              },
            },
          ],
        },
      });
    });

    test('grant provides [type parameter]/* permissions when called with `type` argument', () => {
      // WHEN
      importedApi.grant(role, appsync.IamResource.ofType('Mutation'), 'appsync:GraphQL');

      // THEN
      Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: [
            {
              Action: 'appsync:GraphQL',
              Effect: 'Allow',
              Resource: {
                'Fn::Join': [
                  '',
                  [
                    'arn:',
                    { Ref: 'AWS::Partition' },
                    ':appsync:',
                    { Ref: 'AWS::Region' },
                    ':',
                    { Ref: 'AWS::AccountId' },
                    ':apis/importedId/types/Mutation/*',
                  ],
                ],
              },
            },
          ],
        },
      });
    });

    test('grant provides fields/[field param] permissions when called with `type` and `field` argument', () => {
      // WHEN
      importedApi.grant(role, appsync.IamResource.ofType('Mutation', 'addTest'), 'appsync:GraphQL');

      // THEN
      Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: [
            {
              Action: 'appsync:GraphQL',
              Effect: 'Allow',
              Resource: {
                'Fn::Join': [
                  '',
                  [
                    'arn:',
                    { Ref: 'AWS::Partition' },
                    ':appsync:',
                    { Ref: 'AWS::Region' },
                    ':',
                    { Ref: 'AWS::AccountId' },
                    ':apis/importedId/types/Mutation/fields/addTest',
                  ],
                ],
              },
            },
          ],
        },
      });
    });

    test('grant provides all permissions when called with IamResource.all()', () => {
      // WHEN
      importedApi.grant(role, appsync.IamResource.all(), 'appsync:GraphQL');

      // THEN
      Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: [
            {
              Action: 'appsync:GraphQL',
              Effect: 'Allow',
              Resource: {
                'Fn::Join': [
                  '',
                  [
                    'arn:',
                    { Ref: 'AWS::Partition' },
                    ':appsync:',
                    { Ref: 'AWS::Region' },
                    ':',
                    { Ref: 'AWS::AccountId' },
                    ':apis/importedId/*',
                  ],
                ],
              },
            },
          ],
        },
      });
    });

    test('grant provides multiple permissions using one IamResource custom call', () => {
      // WHEN
      importedApi.grant(role, appsync.IamResource.custom('I', 'am', 'custom'), 'appsync:GraphQL');

      // THEN
      Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: [
            {
              Action: 'appsync:GraphQL',
              Effect: 'Allow',
              Resource: [
                {
                  'Fn::Join': [
                    '',
                    [
                      'arn:',
                      { Ref: 'AWS::Partition' },
                      ':appsync:',
                      { Ref: 'AWS::Region' },
                      ':',
                      { Ref: 'AWS::AccountId' },
                      ':apis/importedId/I',
                    ],
                  ],
                },
                {
                  'Fn::Join': [
                    '',
                    [
                      'arn:',
                      { Ref: 'AWS::Partition' },
                      ':appsync:',
                      { Ref: 'AWS::Region' },
                      ':',
                      { Ref: 'AWS::AccountId' },
                      ':apis/importedId/am',
                    ],
                  ],
                },
                {
                  'Fn::Join': [
                    '',
                    [
                      'arn:',
                      { Ref: 'AWS::Partition' },
                      ':appsync:',
                      { Ref: 'AWS::Region' },
                      ':',
                      { Ref: 'AWS::AccountId' },
                      ':apis/importedId/custom',
                    ],
                  ],
                },
              ],
            },
          ],
        },
      });
    });

    test('grant provides multiple permissions using one IamResource ofType call', () => {
      // WHEN
      importedApi.grant(role, appsync.IamResource.ofType('I', 'am', 'custom'), 'appsync:GraphQL');

      // THEN
      Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: [
            {
              Action: 'appsync:GraphQL',
              Effect: 'Allow',
              Resource: [
                {
                  'Fn::Join': [
                    '',
                    [
                      'arn:',
                      { Ref: 'AWS::Partition' },
                      ':appsync:',
                      { Ref: 'AWS::Region' },
                      ':',
                      { Ref: 'AWS::AccountId' },
                      ':apis/importedId/types/I/fields/am',
                    ],
                  ],
                },
                {
                  'Fn::Join': [
                    '',
                    [
                      'arn:',
                      { Ref: 'AWS::Partition' },
                      ':appsync:',
                      { Ref: 'AWS::Region' },
                      ':',
                      { Ref: 'AWS::AccountId' },
                      ':apis/importedId/types/I/fields/custom',
                    ],
                  ],
                },
              ],
            },
          ],
        },
      });
    });
  });

  describe('grantMutation Permissions', () => {
    test('grantMutation provides Mutation/* permissions when called with no `fields` argument', () => {
      // WHEN
      importedApi.grantMutation(role);

      // THEN
      Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: [
            {
              Action: 'appsync:GraphQL',
              Effect: 'Allow',
              Resource: {
                'Fn::Join': [
                  '',
                  [
                    'arn:',
                    { Ref: 'AWS::Partition' },
                    ':appsync:',
                    { Ref: 'AWS::Region' },
                    ':',
                    { Ref: 'AWS::AccountId' },
                    ':apis/importedId/types/Mutation/*',
                  ],
                ],
              },
            },
          ],
        },
      });
    });

    test('grantMutation provides fields/[field param] permissions when called with `fields` argument', () => {
      // WHEN
      importedApi.grantMutation(role, 'addTest');

      // THEN
      Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: [
            {
              Action: 'appsync:GraphQL',
              Effect: 'Allow',
              Resource: {
                'Fn::Join': [
                  '',
                  [
                    'arn:',
                    { Ref: 'AWS::Partition' },
                    ':appsync:',
                    { Ref: 'AWS::Region' },
                    ':',
                    { Ref: 'AWS::AccountId' },
                    ':apis/importedId/types/Mutation/fields/addTest',
                  ],
                ],
              },
            },
          ],
        },
      });
    });

    test('grantMutation provides multiple permissions when called with `fields` argument', () => {
      // WHEN
      importedApi.grantMutation(role, 'addTest', 'removeTest');

      // THEN
      Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: [
            {
              Action: 'appsync:GraphQL',
              Effect: 'Allow',
              Resource: [
                {
                  'Fn::Join': [
                    '',
                    [
                      'arn:',
                      { Ref: 'AWS::Partition' },
                      ':appsync:',
                      { Ref: 'AWS::Region' },
                      ':',
                      { Ref: 'AWS::AccountId' },
                      ':apis/importedId/types/Mutation/fields/addTest',
                    ],
                  ],
                },
                {
                  'Fn::Join': [
                    '',
                    [
                      'arn:',
                      { Ref: 'AWS::Partition' },
                      ':appsync:',
                      { Ref: 'AWS::Region' },
                      ':',
                      { Ref: 'AWS::AccountId' },
                      ':apis/importedId/types/Mutation/fields/removeTest',
                    ],
                  ],
                },
              ],
            },
          ],
        },
      });
    });
  });

  describe('grantQuery Permissions', () => {
    test('grantQuery provides Query/* permissions when called without the `fields` argument', () => {
      // WHEN
      importedApi.grantQuery(role);

      // THEN
      Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: [
            {
              Action: 'appsync:GraphQL',
              Effect: 'Allow',
              Resource: {
                'Fn::Join': [
                  '',
                  [
                    'arn:',
                    { Ref: 'AWS::Partition' },
                    ':appsync:',
                    { Ref: 'AWS::Region' },
                    ':',
                    { Ref: 'AWS::AccountId' },
                    ':apis/importedId/types/Query/*',
                  ],
                ],
              },
            },
          ],
        },
      });
    });

    test('grantQuery provides fields/[field param] permissions when called with `fields` arugment', () => {
      // WHEN
      importedApi.grantQuery(role, 'getTest');

      // THEN
      Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: [
            {
              Action: 'appsync:GraphQL',
              Effect: 'Allow',
              Resource: {
                'Fn::Join': [
                  '',
                  [
                    'arn:',
                    { Ref: 'AWS::Partition' },
                    ':appsync:',
                    { Ref: 'AWS::Region' },
                    ':',
                    { Ref: 'AWS::AccountId' },
                    ':apis/importedId/types/Query/fields/getTest',
                  ],
                ],
              },
            },
          ],
        },
      });
    });

    test('grantQuery provides multiple permissions when called with `fields` argument', () => {
      // WHEN
      importedApi.grantQuery(role, 'getTests', 'getTest');

      // THEN
      Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: [
            {
              Action: 'appsync:GraphQL',
              Effect: 'Allow',
              Resource: [
                {
                  'Fn::Join': [
                    '',
                    [
                      'arn:',
                      { Ref: 'AWS::Partition' },
                      ':appsync:',
                      { Ref: 'AWS::Region' },
                      ':',
                      { Ref: 'AWS::AccountId' },
                      ':apis/importedId/types/Query/fields/getTests',
                    ],
                  ],
                },
                {
                  'Fn::Join': [
                    '',
                    [
                      'arn:',
                      { Ref: 'AWS::Partition' },
                      ':appsync:',
                      { Ref: 'AWS::Region' },
                      ':',
                      { Ref: 'AWS::AccountId' },
                      ':apis/importedId/types/Query/fields/getTest',
                    ],
                  ],
                },
              ],
            },
          ],
        },
      });
    });
  });

  describe('grantSubscription Permissions', () => {
    test('grantSubscription provides Subscription/* permissions when called without `fields` argument', () => {
      // WHEN
      importedApi.grantSubscription(role);

      // THEN
      Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: [
            {
              Action: 'appsync:GraphQL',
              Effect: 'Allow',
              Resource: {
                'Fn::Join': [
                  '',
                  [
                    'arn:',
                    { Ref: 'AWS::Partition' },
                    ':appsync:',
                    { Ref: 'AWS::Region' },
                    ':',
                    { Ref: 'AWS::AccountId' },
                    ':apis/importedId/types/Subscription/*',
                  ],
                ],
              },
            },
          ],
        },
      });
    });

    test('grantSubscription provides fields/[field param] when called with `field` argument', () => {
      importedApi.grantSubscription(role, 'subscribe');

      // THEN
      Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: [
            {
              Action: 'appsync:GraphQL',
              Effect: 'Allow',
              Resource: {
                'Fn::Join': [
                  '',
                  [
                    'arn:',
                    { Ref: 'AWS::Partition' },
                    ':appsync:',
                    { Ref: 'AWS::Region' },
                    ':',
                    { Ref: 'AWS::AccountId' },
                    ':apis/importedId/types/Subscription/fields/subscribe',
                  ],
                ],
              },
            },
          ],
        },
      });
    });

    test('grantSubscription provides multiple permissions when called with `fields` argument', () => {
      // WHEN
      importedApi.grantSubscription(role, 'subscribe', 'custom');

      // THEN
      Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: [
            {
              Action: 'appsync:GraphQL',
              Effect: 'Allow',
              Resource: [
                {
                  'Fn::Join': [
                    '',
                    [
                      'arn:',
                      { Ref: 'AWS::Partition' },
                      ':appsync:',
                      { Ref: 'AWS::Region' },
                      ':',
                      { Ref: 'AWS::AccountId' },
                      ':apis/importedId/types/Subscription/fields/subscribe',
                    ],
                  ],
                },
                {
                  'Fn::Join': [
                    '',
                    [
                      'arn:',
                      { Ref: 'AWS::Partition' },
                      ':appsync:',
                      { Ref: 'AWS::Region' },
                      ':',
                      { Ref: 'AWS::AccountId' },
                      ':apis/importedId/types/Subscription/fields/custom',
                    ],
                  ],
                },
              ],
            },
          ],
        },
      });
    });
  });
});
