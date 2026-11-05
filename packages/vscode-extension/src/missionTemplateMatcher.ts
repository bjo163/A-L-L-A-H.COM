import type { MissionTemplate } from './services/MissionTemplateService';

export interface WorkspaceTemplateContext {
  files: string[];
  frameworks: string[];
}

export function matchMissionTemplates(
  templates: MissionTemplate[],
  context: WorkspaceTemplateContext
): MissionTemplate[] {
  const files = new Set(context.files.map((file) => file.replaceAll('\\', '/')));
  const frameworks = new Set(context.frameworks.map((framework) => framework.toLowerCase()));
  const matchesRule = (rule: MissionTemplate['contextRules'][number]) => {
    const pattern = rule.pattern.replaceAll('\\', '/');
    const glob = pattern.includes('/') ? pattern : `**/${pattern}`;
    const patternRegex = new RegExp(`^${glob
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replaceAll('**/', '___GLOB_DIR___')
      .replaceAll('**', '___GLOB___')
      .replaceAll('*', '[^/]*')
      .replaceAll('___GLOB_DIR___', '(?:.*/)?')
      .replaceAll('___GLOB___', '.*')}$`, 'i');
    const matchesFile = [...files].some((file) => patternRegex.test(file));
    const matchesFramework = [...frameworks].some((framework) => pattern.toLowerCase().includes(framework));
    return matchesFile || matchesFramework;
  };
  return templates.filter((template) => {
    const includeRules = template.contextRules.filter((rule) => rule.action === 'include');
    const excludeRules = template.contextRules.filter((rule) => rule.action === 'exclude');
    return !excludeRules.some(matchesRule)
      && (includeRules.length === 0 || includeRules.some(matchesRule));
  });
}
