import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-note-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './note-detail.component.html',
  styleUrl: './note-detail.component.scss'
})
export class NoteDetailComponent implements OnChanges {
  @Input() noteId: number | null = null;
  @Output() refreshList = new EventEmitter<void>();
  note: any = null;
  tagInput: string = '';

  constructor(private api: ApiService) {}

  ngOnChanges() {
    if (this.noteId === 0) {
      this.note = { title: '', content: '', tags: [] };
      this.tagInput = '';
    } else if (this.noteId) {
      this.note = { id: this.noteId, title: 'Edit Note', content: 'Loading...' }; 
    } else {
      this.note = null;
    }
  }

  save() {
    if (!this.note) return;
    const tagsArray = this.tagInput.split(',').map(t => t.trim()).filter(t => t !== '');
    const payload = { ...this.note, tags: tagsArray };

    if (this.noteId === 0) {
      this.api.createNote(payload).subscribe(() => { this.tagInput = ''; this.refreshList.emit(); });
    } else if (this.noteId) {
      this.api.updateNote(this.noteId, payload).subscribe(() => this.refreshList.emit());
    }
  }

  deleteNote() {
    if (this.noteId && confirm('Delete?')) {
      this.api.deleteNote(this.noteId).subscribe(() => { this.refreshList.emit(); this.note = null; });
    }
  }
}