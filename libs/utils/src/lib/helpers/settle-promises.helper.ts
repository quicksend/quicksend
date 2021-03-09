// Promise.allSettled, but will throw the first error that was found after all tasks were ran

export const settlePromises = async <T = unknown>(values: readonly T[]) => {
  const tasks = await Promise.allSettled<T>(values);

  for (const task of tasks) {
    if (task.status === "rejected") {
      throw task.reason;
    }
  }

  return tasks;
};
