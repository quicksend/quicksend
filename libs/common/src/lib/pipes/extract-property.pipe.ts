import { PipeTransform } from "@nestjs/common";

export class ExtractPropertyPipe<T> implements PipeTransform {
  constructor(private readonly field: keyof T) {}

  transform(value: T): T[keyof T] {
    return value[this.field];
  }
}
