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
  return templates.filter((template) => template.contextRules.every((rule) => {
    if (rule.action === 'exclude') return true;
    const pattern = rule.pattern.replaceAll('\\', '/');
    const basename = pattern.includes('/') ? pattern : `/${pattern}`;
    const patternRegex = new RegExp(`^${pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replaceAll('**/', '___GLOB_DIR___')
      .replaceAll('**', '___GLOB___')
      .replaceAll('*', '[^/]*')
      .replaceAll('___GLOB_DIR___', '(?:.*/)?')
      .replaceAll('___GLOB___', '.*')}$`, 'i');
    const matchesFile = [...files].some((file) => file === pattern || file.endsWith(basename) || patternRegex.test(file));
    const matchesFramework = [...frameworks].some((framework) => pattern.toLowerCase().includes(framework));
    return matchesFile || matchesFramework;
  }));
}
