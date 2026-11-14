/**
 * Tiny module system. Any element with `data-module="name other"` gets an
 * instance of each named module. Instances are destroyed before Swup swaps the
 * page content and re-created for the incoming page.
 */

export interface AppModule {
  destroy?(): void;
}

export type ModuleCtor = new (el: HTMLElement) => AppModule;
type Loader = () => Promise<{ default: ModuleCtor }>;

const loaders = new Map<string, Loader>();
const instances = new Map<HTMLElement, Map<string, AppModule>>();

export function register(name: string, loader: Loader) {
  loaders.set(name, loader);
}

export async function mount(scope: ParentNode = document): Promise<void> {
  const nodes = [
    ...(scope instanceof HTMLElement && scope.matches('[data-module]') ? [scope] : []),
    ...scope.querySelectorAll<HTMLElement>('[data-module]'),
  ];

  await Promise.all(
    nodes.flatMap((el) => {
      const names = (el.dataset.module ?? '').split(/\s+/).filter(Boolean);
      const mounted = instances.get(el) ?? new Map<string, AppModule>();
      instances.set(el, mounted);

      return names.map(async (name) => {
        if (mounted.has(name)) return;
        const load = loaders.get(name);
        if (!load) {
          console.warn(`[modules] Unknown module "${name}"`);
          return;
        }
        try {
          const { default: Ctor } = await load();
          // The element may have been removed while the chunk loaded.
          if (!el.isConnected) return;
          mounted.set(name, new Ctor(el));
        } catch (error) {
          console.error(`[modules] Failed to start "${name}"`, error);
        }
      });
    }),
  );
}

export function unmount(scope: ParentNode = document) {
  for (const [el, mods] of instances) {
    if (scope === document || scope.contains(el)) {
      mods.forEach((mod, name) => {
        try {
          mod.destroy?.();
        } catch (error) {
          console.error(`[modules] Failed to stop "${name}"`, error);
        }
      });
      instances.delete(el);
    }
  }
}

export function getInstance<T extends AppModule>(el: HTMLElement, name: string): T | undefined {
  return instances.get(el)?.get(name) as T | undefined;
}
