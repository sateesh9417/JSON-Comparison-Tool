import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class JsonComparisonService {
  private isTimestamp(value: any): boolean {
    if (typeof value === 'string') {
      const iso8601Regex =
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
      return iso8601Regex.test(value);
    }

    if (typeof value === 'number') {
      return value > 1000000000;
    }

    return false;
  }

  compareJsonObjects(obj1: any, obj2: any, path: string = ''): string[] {
    const differences: string[] = [];

    if (this.isDifferentType(obj1, obj2)) {
      const type1 = Array.isArray(obj1) ? 'array' : typeof obj1;
      const type2 = Array.isArray(obj2) ? 'array' : typeof obj2;
      differences.push(
        `Difference at '${path || 'root'}': JSON 1 has ${type1} ${JSON.stringify(
          obj1
        )}, but JSON 2 has ${type2} ${JSON.stringify(obj2)}.`
      );
      return differences;
    }

    if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
      if ((this.isTimestamp(obj1) || this.isTimestamp(obj2))) {
        differences.push(`Field '${path}' is ignored as it is a timestamp or comparable type.`);
      } else if (obj1 !== obj2) {
        differences.push(
          `Value difference at '${path || 'root'}': JSON 1 value is ${JSON.stringify(obj1)}, while JSON 2 value is ${JSON.stringify(
            obj2
          )}.`
        );
        
      }
      return differences;
    }

    const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
    for (const key of keys) {
      const newPath = path ? `${path}.${key}` : key;

      if (!(key in obj1)) {
        differences.push(`Key missing in JSON 1 at '${newPath}': JSON 2 has value ${JSON.stringify(obj2[key])}.`);
      } else if (!(key in obj2)) {
        differences.push(`Key missing in JSON 2 at '${newPath}': JSON 1 has value ${JSON.stringify(obj1[key])}.`);
      } else {
        differences.push(...this.compareJsonObjects(obj1[key], obj2[key], newPath));
      }
    }

    return differences;
  }

  // Identify if two values have different types
  private isDifferentType(value1: any, value2: any): boolean {
    return (
      (Array.isArray(value1) && !Array.isArray(value2)) ||
      (!Array.isArray(value1) && Array.isArray(value2)) ||
      typeof value1 !== typeof value2
    );
  }
}