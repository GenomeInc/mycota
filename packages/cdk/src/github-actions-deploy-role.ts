import { Duration, Stack } from 'aws-cdk-lib';
import {
  OpenIdConnectProvider,
  PolicyStatement,
  Role,
  WebIdentityPrincipal,
  type IOpenIdConnectProvider,
} from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export const DEFAULT_CDK_BOOTSTRAP_QUALIFIER = 'hnb659fds';

export interface GithubActionsDeployRoleProps {
  /** GitHub `owner/repo`, e.g. `bubltec/political-sloth`. */
  repository: string;
  roleName?: string;
  /**
   * Branch names that can assume this role *without* a GitHub Environment.
   * Default `['main']`. Needed for jobs (e.g. `cdk diff`) that must run
   * before an environment approval gate — those send the ref-based `sub`.
   */
  branches?: string[];
  /**
   * GitHub Environment names. A job with `environment:` sends
   * `repo:...:environment:<name>` as the OIDC `sub`, not the ref form,
   * regardless of which branch triggered the workflow.
   * Default `['development', 'production']`.
   */
  environments?: string[];
  /**
   * Existing GitHub OIDC provider. Default: import
   * `token.actions.githubusercontent.com` in this account. IAM allows only
   * one provider per URL, so creating a second would fail as a duplicate.
   */
  oidcProvider?: IOpenIdConnectProvider;
  bootstrapQualifier?: string;
}

/**
 * IAM role GitHub Actions assumes via OIDC to run `cdk deploy`.
 *
 * The role itself only gets `sts:AssumeRole` on the CDK bootstrap roles
 * (deploy, file-publishing, image-publishing, lookup). Resource mutations
 * go through those already-scoped roles, not this role's own policy.
 */
export class GithubActionsDeployRole extends Construct {
  readonly role: Role;
  readonly oidcProvider: IOpenIdConnectProvider;

  constructor(scope: Construct, id: string, props: GithubActionsDeployRoleProps) {
    super(scope, id);

    const stack = Stack.of(this);
    const qualifier = props.bootstrapQualifier ?? DEFAULT_CDK_BOOTSTRAP_QUALIFIER;
    const branches = props.branches ?? ['main'];
    const environments = props.environments ?? ['development', 'production'];
    const subs = [
      ...branches.map((branch) => `repo:${props.repository}:ref:refs/heads/${branch}`),
      ...environments.map((environment) => `repo:${props.repository}:environment:${environment}`),
    ];
    if (subs.length === 0) {
      throw new Error('GithubActionsDeployRole needs at least one branch or environment in the OIDC sub allowlist');
    }

    this.oidcProvider =
      props.oidcProvider ??
      OpenIdConnectProvider.fromOpenIdConnectProviderArn(
        this,
        'GithubOidc',
        `arn:aws:iam::${stack.account}:oidc-provider/token.actions.githubusercontent.com`,
      );

    this.role = new Role(this, 'Role', {
      roleName: props.roleName,
      maxSessionDuration: Duration.hours(1),
      assumedBy: new WebIdentityPrincipal(this.oidcProvider.openIdConnectProviderArn, {
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
        },
        StringLike: {
          'token.actions.githubusercontent.com:sub': subs,
        },
      }),
    });

    for (const bootstrapRole of [
      'deploy-role',
      'file-publishing-role',
      'image-publishing-role',
      'lookup-role',
    ]) {
      this.role.addToPolicy(
        new PolicyStatement({
          actions: ['sts:AssumeRole'],
          resources: [
            `arn:aws:iam::${stack.account}:role/cdk-${qualifier}-${bootstrapRole}-${stack.account}-${stack.region}`,
          ],
        }),
      );
    }
  }
}
