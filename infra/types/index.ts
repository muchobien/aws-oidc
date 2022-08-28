import type { StackProps } from 'aws-cdk-lib';
import type { RuleProps } from 'aws-cdk-lib/aws-events';
import type { Construct } from 'constructs';
import type { Config } from 'infra/config';

export type StackConstructProps = {
  config: Config;
  scope: Construct;
  props?: StackProps;
};

export type ScheduledLambdaProps = Omit<RuleProps, 'targets'> & Required<Pick<RuleProps, 'schedule'>>;
