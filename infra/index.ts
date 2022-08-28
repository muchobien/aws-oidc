import { App } from 'aws-cdk-lib';
import { loadConfig } from './config';
import { MainStack } from './stacks/main';

const entrypoint = async () => {
  const app = new App();

  const config = await loadConfig(app);

  new MainStack({ config, scope: app });
};

entrypoint();
