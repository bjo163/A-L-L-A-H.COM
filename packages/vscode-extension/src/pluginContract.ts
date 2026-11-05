export interface ExtensionContribution {
  id: string;
  version: string;
  commands: string[];
  capabilities: string[];
}

export function validateContribution(contribution: ExtensionContribution): void {
  if (!/^[a-z0-9][a-z0-9.-]*$/.test(contribution.id)) throw new Error('Contribution id is invalid.');
  if (!/^\d+\.\d+\.\d+$/.test(contribution.version)) throw new Error('Contribution version must be semver.');
  if (contribution.commands.some((command) => !command.trim())) throw new Error('Contribution commands cannot be empty.');
}
