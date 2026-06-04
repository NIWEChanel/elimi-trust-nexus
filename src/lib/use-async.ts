import { useEffect, useState, type DependencyList } from "react";

export function useAsyncData<T>(
  loader: () => Promise<T>,
  deps: DependencyList = [],
  options: { enabled?: boolean } = {},
) {
  const [data, setData] = useState<T | undefined>();
  const [error, setError] = useState<unknown>();
  const [isLoading, setIsLoading] = useState(options.enabled === false ? false : true);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;
    if (options.enabled === false) {
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    setIsLoading(true);
    setError(undefined);
    loader()
      .then((value) => {
        if (active) setData(value);
      })
      .catch((err) => {
        if (active) setError(err);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [...deps, reloadToken, options.enabled]);

  return {
    data,
    setData,
    error,
    isLoading,
    reload: () => setReloadToken((value) => value + 1),
  };
}

export function useAsyncAction<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>,
  options: {
    onSuccess?: (result: TResult) => void;
    onError?: (error: Error) => void;
  } = {},
) {
  const [isPending, setIsPending] = useState(false);

  function mutate(...args: TArgs) {
    setIsPending(true);
    action(...args)
      .then((result) => options.onSuccess?.(result))
      .catch((error) => options.onError?.(error instanceof Error ? error : new Error(String(error))))
      .finally(() => setIsPending(false));
  }

  return { mutate, isPending };
}
