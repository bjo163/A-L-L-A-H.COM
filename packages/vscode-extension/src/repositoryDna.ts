export interface RepositoryDna {
  packageManager: string | undefined;
  frameworks: string[];
  languages: string[];
  scripts: string[];
  manifests: string[];
}

interface PackageManifest {
  packageManager?: unknown;
  scripts?: Record<string, unknown>;
  dependencies?: Record<string, unknown>;
  devDependencies?: Record<string, unknown>;
}

const frameworkPackages: Record<string, string> = {
  next: 'Next.js',
  react: 'React',
  vue: 'Vue',
  svelte: 'Svelte',
  fastify: 'Fastify',
  express: 'Express',
  '@nestjs/core': 'NestJS',
  vite: 'Vite',
};

const languageByExtension: Record<string, string> = {
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript',
  '.js': 'JavaScript',
  '.jsx': 'JavaScript',
  '.py': 'Python',
  '.go': 'Go',
  '.rs': 'Rust',
  '.java': 'Java',
  '.cs': 'C#',
};

export function buildRepositoryDna(files: string[], packageManifest?: PackageManifest): RepositoryDna {
  const dependencies = {
    ...(packageManifest?.dependencies ?? {}),
    ...(packageManifest?.devDependencies ?? {}),
  };
  const frameworks = Object.keys(frameworkPackages)
    .filter((name) => name in dependencies)
    .map((name) => frameworkPackages[name])
    .sort();
  const languages = [...new Set(
    files
      .map((file) => file.slice(file.lastIndexOf('.')).toLowerCase())
      .map((extension) => languageByExtension[extension])
      .filter((language): language is string => language !== undefined)
  )].sort();
  const packageManager = typeof packageManifest?.packageManager === 'string'
    ? packageManifest.packageManager.split('@', 1)[0]
    : files.some((file) => /(^|[\\/])pnpm-lock\.yaml$/.test(file))
      ? 'pnpm'
      : files.some((file) => /(^|[\\/])yarn\.lock$/.test(file))
        ? 'yarn'
        : files.some((file) => /(^|[\\/])package-lock\.json$/.test(file))
          ? 'npm'
          : undefined;
  const scripts = Object.keys(packageManifest?.scripts ?? {}).sort();

  return {
    packageManager,
    frameworks,
    languages,
    scripts,
    manifests: files.filter((file) => /(^|[\\/])(?:package\.json|tsconfig(?:\..+)?\.json|pyproject\.toml|go\.mod|Cargo\.toml)$/.test(file)).sort(),
  };
}
