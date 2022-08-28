import { CfnOutput, Duration, Stack, Tags } from 'aws-cdk-lib';
import type { StackConstructProps } from '@/infra/types';
import { GithubActionsIdentityProvider, GithubActionsRole } from 'aws-cdk-github-oidc';
import { ManagedPolicy } from 'aws-cdk-lib/aws-iam';

export class MainStack extends Stack {
  constructor({ config, scope, props }: StackConstructProps) {
    super(scope, config.scopedId('main'), props);

    const provider = new GithubActionsIdentityProvider(this, config.scopedId('github-provider'));

    const deployRole = new GithubActionsRole(this, config.scopedId('github-deploy-role'), {
      provider,
      owner: 'muchobien',
      repo: '*',
      roleName: 'GithubActions',
      description: 'This role deploys stuff to AWS',
      maxSessionDuration: Duration.hours(2),
    });

    Tags.of(deployRole).add('Owner', 'muchobien');

    // TODO: define specific permissions for the deploy role
    deployRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'));

    new CfnOutput(this, config.scopedId('github-deploy-role-arn'), {
      value: deployRole.roleArn,
    });
  }
}
