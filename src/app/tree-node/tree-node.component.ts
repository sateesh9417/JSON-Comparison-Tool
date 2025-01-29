import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tree-node',
  imports: [CommonModule],
  templateUrl: './tree-node.component.html',
  styleUrl: './tree-node.component.css',
  standalone: true
})
export class TreeNodeComponent {
  @Input() node: any;

  toggleNode() {
    if (this.node.children) {
      this.node.collapsed = !this.node.collapsed;
    }
  }
}
