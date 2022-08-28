import type { Config } from '@/infra/config';
import type { ScheduledLambdaProps } from '@/infra/types';
import { Rule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';
import type { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import type { Construct } from 'constructs';
import type { LambdaIntegrationOptions } from 'aws-cdk-lib/aws-apigateway';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';

type NodeLambdaContructorProps = {
  scope: Construct;
  name: string;
  props?: NodejsFunctionProps;
  config: Config;
};

export class NodeLambda extends NodejsFunction {
  constructor(private args: NodeLambdaContructorProps) {
    super(args.scope, args.config.scopedId(args.name), {
      runtime: Runtime.NODEJS_16_X,
      architecture: Architecture.ARM_64,
      entry: `src/handlers/${args.name}.ts`,
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'es2022',
        mainFields: ['module', 'main'],
        externalModules: [
          'pg-native',
          'mysql2',
          'better-sqlite3',
          'sqlite3',
          'tedious',
          'oracledb',
          'mysql',
          'pg-query-stream',
        ],
      },
      ...args.props,
    });
    this.loadEnviroment();
  }

  schedule(props: ScheduledLambdaProps) {
    const { config, name } = this.args;

    const rule = new Rule(this, config.scopedId(`${name}-schedule-rule`), props);
    rule.addTarget(new LambdaFunction(this));
  }

  onAthenaQueryStateChange() {
    const { config, name } = this.args;

    const rule = new Rule(this, config.scopedId(`${name}-athena-query-state-change-rule`), {
      eventPattern: {
        source: ['aws.athena'],
        detailType: ['Athena Query State Change'],
      },
    });
    rule.addTarget(new LambdaFunction(this));
  }

  asS3Destination() {
    return new LambdaDestination(this);
  }

  asIntegration(options?: LambdaIntegrationOptions) {
    return new LambdaIntegration(this, options);
  }

  private loadEnviroment() {
    const { config } = this.args;
    for (const [key, value] of Object.entries(config.lambdaEnvironment)) {
      this.addEnvironment(key, value);
    }
  }
}
