import * as _pump from "pump";

export type Stream = _pump.Stream;

export const pump = (streams: Stream[]) =>
  new Promise((resolve, reject) => {
    _pump(streams, (error?: Error) => {
      if (error) reject(error);
      else resolve();
    });
  });
