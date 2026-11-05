const documentationOnly = (file) => file.startsWith('.plans/') || /\.md$/i.test(file);

export function selectTsconfigs(files, projectPaths) {
  if (files.length === 0) return { all: true, selected: projectPaths };
  const projects = new Set(projectPaths);
  const selected = new Set();

  for (const file of files) {
    if (documentationOnly(file)) continue;
    const match = file.match(/^(apps\/[^/]+|packages\/[^/]+)\//);
    if (!match) return { all: true, selected: projectPaths };
    const project = `${match[1]}/tsconfig.json`;
    if (!projects.has(project)) return { all: true, selected: projectPaths };
    if (match[1].startsWith('packages/')) {
      return { all: true, selected: projectPaths };
    }
    selected.add(project);
  }

  return { all: false, selected: [...selected].sort() };
}
