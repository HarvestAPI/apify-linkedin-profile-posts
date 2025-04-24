export type AsyncFunction<TArgs extends any[] = any[], TRes = any> = (
  ...args: TArgs
) => Promise<TRes>;

export function createConcurrentQueues<TArgs extends unknown[] = unknown[], TRes = unknown>(
  concurrency: number,
  fn: AsyncFunction<TArgs, TRes>,
): AsyncFunction<TArgs, TRes> {
  if (!concurrency || isNaN(concurrency)) {
    throw new Error(
      `createConcurrentQueues: Concurrency must be a number > 0, provided: ${concurrency}`,
    );
  }

  let available = concurrency;
  const queue: Array<{
    args: TArgs;
    resolve: (value: TRes) => void;
    reject: (error: unknown) => void;
  }> = [];

  const processQueue = async () => {
    if (available > 0 && queue.length > 0) {
      available--;
      const { args, resolve, reject } = queue.shift()!;

      try {
        const result = await fn(...args);
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        available++;
        // Process the next item in the queue
        setTimeout(processQueue, 0);
      }
    }
  };

  return async (...args: TArgs): Promise<TRes> => {
    return new Promise<TRes>((resolve, reject) => {
      // Add the task to the queue
      queue.push({ args, resolve, reject });

      // Try to process the queue
      setTimeout(processQueue, 0);
    });
  };
}
