import { Tags } from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const ConfigSchema = z.object({
  STAGE: z.enum(['dev', 'prod', 'local']),
  VERSION: z.string().default('0.0.0-local'),
  BUILD: z.string().default('unknown'),
  APP: z.string().min(1),
});

export type Config = z.infer<typeof ConfigSchema> & {
  scopedId: (id: string) => string;
  isProd: boolean;
  lambdaEnvironment: Omit<z.infer<typeof ConfigSchema>, 'APP' | 'STAGE' | 'VERSION' | 'BUILD'>;
};

export const loadConfig = async (scope: Construct): Promise<Config> => {
  const stage: string | undefined = scope.node.tryGetContext('stage');

  if (!stage) {
    throw new Error('Context variable missing on CDK command. Pass in as `-c stage=dev|prod|test`');
  }
  const __basedir = dirname(dirname(fileURLToPath(import.meta.url)));

  const file = await import(`${__basedir}/config/stages/${stage}.ts`);

  const { APP, STAGE, VERSION, BUILD, ...lambdaEnvironment } = await ConfigSchema.parseAsync(file.config);

  Tags.of(scope).add('app', APP);
  Tags.of(scope).add('stage', STAGE);
  Tags.of(scope).add('version', VERSION);
  Tags.of(scope).add('build', BUILD);

  return {
    APP,
    STAGE,
    VERSION,
    BUILD,
    ...lambdaEnvironment,
    isProd: STAGE === 'prod',
    lambdaEnvironment,
    scopedId: (id: string) => `${APP}-${STAGE}-${id}`.toLowerCase(),
  };
};

export const addDefaultTags = (scope: Construct, config: Config) => {
  Tags.of(scope).add('app', config.APP);
  Tags.of(scope).add('stage', config.STAGE);
  Tags.of(scope).add('version', config.VERSION);
  Tags.of(scope).add('build', config.BUILD);
};
