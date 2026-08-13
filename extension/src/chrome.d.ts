declare namespace chrome {
  namespace storage {
    const local: {
      get(keys?: string | string[] | Record<string, unknown>): Promise<Record<string, unknown>>;
      set(items: Record<string, unknown>): Promise<void>;
      remove(keys: string | string[]): Promise<void>;
    };
  }
  namespace tabs {
    function create(createProperties: { url: string }): Promise<unknown>;
  }
}
