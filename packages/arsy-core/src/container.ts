export class Container {
  private services = new Map<string, unknown>();
  private factories = new Map<string, (c: Container) => unknown>();

  register<T>(token: string, instance: T): this {
    this.services.set(token, instance);
    return this;
  }

  factory<T>(token: string, factory: (c: Container) => T): this {
    this.factories.set(token, factory);
    return this;
  }

  resolve<T>(token: string): T {
    if (this.services.has(token)) {
      return this.services.get(token) as T;
    }

    if (this.factories.has(token)) {
      const factory = this.factories.get(token)!;
      const instance = factory(this) as T;
      this.services.set(token, instance);
      return instance;
    }

    throw new Error(`[Arsy Container] Service not found for token: ${token}`);
  }

  has(token: string): boolean {
    return this.services.has(token) || this.factories.has(token);
  }

  clear(): void {
    this.services.clear();
    this.factories.clear();
  }
}

export const container = new Container();
