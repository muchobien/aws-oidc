const { env } = process;

type CustomConfig = {
  STAGE: string;
};

export const buildFromShared = (custom: CustomConfig) => {
  return {
    ...custom,

    APP: 'muchobien',
    BUILD: env['GITHUB_SHA'],
    VERSION: env['npm_package_version'],
  };
};
