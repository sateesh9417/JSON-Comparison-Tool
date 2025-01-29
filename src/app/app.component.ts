import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { JsonComparisonService } from './service/json-comparison.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TreeNodeComponent } from './tree-node/tree-node.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule, TreeNodeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true
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

  constructor(
    private jsonComparisonService: JsonComparisonService
  ) {}

  formatJsons(): void {
    try {
      this.json1 = JSON.stringify(JSON.parse(this.json1), null, 2);
      this.json2 = JSON.stringify(JSON.parse(this.json2), null, 2);
    } catch {
      alert('Invalid JSON. Please correct your input.');
    }
  }

  minifyJsons(): void {
    try {
      this.json1 = JSON.stringify(JSON.parse(this.json1));
      this.json2 = JSON.stringify(JSON.parse(this.json2));
    } catch {
      alert('Invalid JSON. Please correct your input.');
    }
  }

  swapJsons(){
    [this.json1,this.json2] = [this.json2,this.json1]
  }

  toggleFontSize(): void {
    this.fontSize = this.fontSize === '14px' ? '18px' : '14px';
  }

  resetFields(): void {
    if(this.json1 !== '' || this.json2 !== ''){
      if(confirm('Are you sure want to reset?')){
        this.json1 = '';
        this.json2 = '';
        this.differences = [];
        this.errorMessage = '';
        this.showTreeView = false;
      }
    }else{
      alert('The JSON field is empty. Please input data before resetting.');
    }
  }

  compareJsons(): void {
    this.errorMessage = '';
    this.differences = [];

    try {
      const parsedJson1 = JSON.parse(this.json1);
      const parsedJson2 = JSON.parse(this.json2);
      this.jsonTree1 = this.parseJsonToTree(JSON.parse(this.json1));
      this.jsonTree2 = this.parseJsonToTree(JSON.parse(this.json2));
      this.differences = this.jsonComparisonService.compareJsonObjects(parsedJson1, parsedJson2);
      if (this.differences.length === 0) {
        this.differences.push('The JSON objects are identical.');
      }
    } catch (error) {
      this.errorMessage = 'Invalid JSON input. Please enter valid JSON objects.';
    }
  }

  toggleTreeView(): void {
    if(this.differences.length !== 0 || (this.json1 !== '' && this.json2 !== '')){
      this.showTreeView = !this.showTreeView;
      if(this.showTreeView){
        this.jsonTree1 = this.parseJsonToTree(JSON.parse(this.json1));
        this.jsonTree2 = this.parseJsonToTree(JSON.parse(this.json2));
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
}
