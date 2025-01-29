import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JsonComparisonService {

  compareJsonObjects(obj1: any, obj2: any, path: string = ''): string[] {
    const differences: string[] = [];
  
    // Handle type mismatch with a detailed message
    if (this.isDifferentType(obj1, obj2)) {
      const type1 = Array.isArray(obj1) ? 'array' : typeof obj1;
      const type2 = Array.isArray(obj2) ? 'array' : typeof obj2;
      differences.push(
        `Difference at '${path || 'root'}': JSON 1 has ${type1} ${JSON.stringify(obj1)}, but JSON 2 has ${type2} ${JSON.stringify(obj2)}.`
      );
      return differences;
    }
  
    // Handle primitive or null values
    if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
      if (obj1 !== obj2) {
        differences.push(
          `Value difference at '${path || 'root'}': JSON 1 value is ${JSON.stringify(obj1)}, while JSON 2 value is ${JSON.stringify(obj2)}.`
        );
      }
      return differences;
    }
  
    // Handle nested structures by iterating over keys
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
  
  private isDifferentType(value1: any, value2: any): boolean {
    return (Array.isArray(value1) && !Array.isArray(value2)) ||
           (!Array.isArray(value1) && Array.isArray(value2)) ||
           (typeof value1 !== typeof value2);
  }  
  
}
