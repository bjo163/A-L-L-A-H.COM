import { ArsyLogger, logger } from './logger';
import { Container, container } from './container';

export type LifecycleHook = () => Promise<void> | void;

export class ArsyKernel {
  private initHooks: LifecycleHook[] = [];
  private bootHooks: LifecycleHook[] = [];
  private readyHooks: LifecycleHook[] = [];
  private shutdownHooks: LifecycleHook[] = [];
  private isBooted = false;
  private isShuttingDown = false;

  constructor(
    public readonly containerInstance: Container = container,
    public readonly log: ArsyLogger = logger
  ) {}

  onInit(hook: LifecycleHook): this {
    this.initHooks.push(hook);
    return this;
  }

  onBoot(hook: LifecycleHook): this {
    this.bootHooks.push(hook);
    return this;
  }

  onReady(hook: LifecycleHook): this {
    this.readyHooks.push(hook);
    return this;
  }

  onShutdown(hook: LifecycleHook): this {
    this.shutdownHooks.push(hook);
    return this;
  }

  async boot(): Promise<void> {
    if (this.isBooted) return;
    this.log.info('Initializing Arsy micro-kernel...');

    for (const hook of this.initHooks) {
      await hook();
    }

    this.log.info('Booting Arsy services...');
    for (const hook of this.bootHooks) {
      await hook();
    }

    this.isBooted = true;
    this.log.info('Arsy micro-kernel is ready.');

    for (const hook of this.readyHooks) {
      await hook();
    }
  }

  async shutdown(): Promise<void> {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;
    this.log.info('Shutting down Arsy micro-kernel...');

    for (const hook of this.shutdownHooks.reverse()) {
      try {
        await hook();
      } catch (err) {
        this.log.error({ err }, 'Error during shutdown hook execution');
      }
    }

    this.isBooted = false;
    this.log.info('Arsy micro-kernel shutdown completed.');
  }
}

