import { Component, ElementRef, ViewChild } from '@angular/core';
import { JsonComparisonService } from './service/json-comparison.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TreeNodeComponent } from './tree-node/tree-node.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, TreeNodeComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
})
export class AppComponent {
  title = 'JsonComparisonApp';
  json1: string = '';
  json2: string = '';
  differences: string[] = [];
  errorMessage: string = '';
  fontSize: string = '14px';
  jsonTree1: any[] = [];
  jsonTree2: any[] = [];
  showTreeView = false;
  @ViewChild('target') targetElement!: ElementRef;
  @ViewChild('targetTreeView') targetTreeViewElement!: ElementRef;

  constructor(private jsonComparisonService: JsonComparisonService) {}

  formatJsons(): void {
    const isValidJson = (json: any) => {
      try {
        const parsed = JSON.parse(json);
        return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);
      } catch {
        return false;
      }
    };

    if (this.json1 && this.json2 && isValidJson(this.json1) && isValidJson(this.json2)) {
      this.json1 = JSON.stringify(JSON.parse(this.json1), null, 2);
      this.json2 = JSON.stringify(JSON.parse(this.json2), null, 2);
    } else {
      alert(this.json1 && this.json2 ? 'Invalid JSON. Please correct your input.' : 'Invalid JSON 1 or 2. Please correct your input.');
    }
  }

  minifyJsons(): void {
    const isValidJson = (json: any) => {
      try {
        const parsed = JSON.parse(json);
        return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);
      } catch {
        return false;
      }
    };

    if (this.json1 && this.json2 && isValidJson(this.json1) && isValidJson(this.json2)) {
      this.json1 = JSON.stringify(JSON.parse(this.json1));
      this.json2 = JSON.stringify(JSON.parse(this.json2));
    } else {
      alert(this.json1 && this.json2 ? 'Invalid JSON. Please correct your input.' : 'Invalid JSON 1 or 2. Please correct your input.');
    }
  }

  swapJsons(): void {
    if (this.json1 !== '' || this.json2 !== '') {
      [this.json1, this.json2] = [this.json2, this.json1];
    } else {
      alert('The JSON field is empty. Please input data before resetting.');
    }
  }

  toggleFontSize(): void {
    this.fontSize = this.fontSize === '14px' ? '18px' : '14px';
  }

  async compareJsons() {
    this.errorMessage = '';
    this.differences = [];
  
    // Check if both JSONs are valid
    const isValidJson = (json: string) => {
      try {
        JSON.parse(json);
        return true;
      } catch (e) {
        return false;
      }
    };
  
    if (!isValidJson(this.json1) || !isValidJson(this.json2)) {
      this.errorMessage = 'Invalid JSON input. Please enter valid JSON objects.';
      return;
    }
  
    try {
      const parsedJson1 = JSON.parse(this.json1);
      const parsedJson2 = JSON.parse(this.json2);
  
      this.differences = await this.jsonComparisonService.compareJsonObjects(parsedJson1, parsedJson2);
      
      if (this.differences.length === 0) {
        this.differences.push('The JSON objects are identical.');
      }
  
      setTimeout(() => {
        if (this.targetElement) {
          this.targetElement.nativeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 0);
  
    } catch (error) {
      this.errorMessage = 'Invalid JSON input. Please enter valid JSON objects.';
    }
  }

  toggleTreeView(): void {
    if (this.differences.length !== 0 || (this.json1 !== '' && this.json2 !== '')) {
      this.showTreeView = !this.showTreeView;
      if (this.showTreeView) {
        this.jsonTree1 = this.parseJsonToTree(JSON.parse(this.json1));
        this.jsonTree2 = this.parseJsonToTree(JSON.parse(this.json2));
        setTimeout(() => {
          if (this.targetTreeViewElement) {
            this.targetTreeViewElement.nativeElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }
        }, 0);
      }
    } else {
      this.errorMessage = 'Invalid JSON input. Please enter valid JSON objects.';
    }
  }

  parseJsonToTree(obj: any, path: string = ''): any[] {
    if (typeof obj !== 'object' || obj === null) {
      return [{ key: path || 'value', value: obj }];
    }

    return Object.keys(obj).map((key) => ({
      key: key,
      value: '',
      children: this.parseJsonToTree(obj[key], key),
      collapsed: true,
    }));
  }

  downloadJson(jsonContent: string, fileName: string): void {
    if ((this.json1 || this.json2) && confirm('Are you sure you want to download?')) {
      const blob = new Blob([jsonContent], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${fileName}.txt`;
      a.click();
      URL.revokeObjectURL(a.href);
    } else if (!(this.json1 || this.json2)) {
      alert('Please fill the JSON field before downloading.');
    }
  }

  resetFields(): void {
    if (this.json1 !== '' || this.json2 !== '') {
      if (confirm('Are you sure you want to reset?')) {
        this.json1 = '';
        this.json2 = '';
        this.differences = [];
        this.errorMessage = '';
        this.showTreeView = false;
      }
    } else {
      alert('The JSON field is empty. Please input data before resetting.');
    }
  }
}
