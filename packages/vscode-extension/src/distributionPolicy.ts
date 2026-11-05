export interface DistributionPolicy {
  channel: 'stable' | 'insiders';
  minimumVsCode: string;
  upgradeNotice: string;
  supportUrl: string;
}

export const distributionPolicy: Readonly<DistributionPolicy> = {
  channel: 'stable',
  minimumVsCode: '^1.90.0',
  upgradeNotice: 'Review the changelog and run extension checks before upgrading.',
  supportUrl: 'https://github.com/bjo163/A-L-L-A-H.COM/issues',
};
