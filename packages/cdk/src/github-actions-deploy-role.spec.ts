import { describe, expect, it } from 'vitest';
import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { GithubActionsDeployRole } from './github-actions-deploy-role.js';

function synth(props: ConstructorParameters<typeof GithubActionsDeployRole>[2] = {
  repository: 'bubltec/political-sloth',
}) {
  const app = new App();
  const stack = new Stack(app, 'TestStack', { env: { account: '123456789012', region: 'us-east-1' } });
  const deploy = new GithubActionsDeployRole(stack, 'Ci', props);
  return { deploy, template: Template.fromStack(stack) };
}

describe('GithubActionsDeployRole', () => {
  it('trusts main plus development and production environment subs by default', () => {
    const { deploy, template } = synth();
    expect(deploy.role.roleName).toBeDefined();

    template.hasResourceProperties('AWS::IAM::Role', {
      AssumeRolePolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: 'sts:AssumeRoleWithWebIdentity',
            Condition: {
              StringEquals: { 'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com' },
              StringLike: {
                'token.actions.githubusercontent.com:sub': [
                  'repo:bubltec/political-sloth:ref:refs/heads/main',
                  'repo:bubltec/political-sloth:environment:development',
                  'repo:bubltec/political-sloth:environment:production',
                ],
              },
            },
          }),
        ]),
      },
    });
  });

  it('can assume the four CDK bootstrap roles', () => {
    const json = JSON.stringify(synth().template.toJSON());
    expect(json).toContain('cdk-hnb659fds-deploy-role-123456789012-us-east-1');
    expect(json).toContain('cdk-hnb659fds-file-publishing-role-123456789012-us-east-1');
    expect(json).toContain('cdk-hnb659fds-image-publishing-role-123456789012-us-east-1');
    expect(json).toContain('cdk-hnb659fds-lookup-role-123456789012-us-east-1');
  });
});
