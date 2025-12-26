import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-note-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './note-list.component.html',
  styleUrl: './note-list.component.scss'
})
export class NoteListComponent implements OnInit {
  notes: any[] = [];
  selectedNoteId: number | null = null;
  @Output() noteSelected = new EventEmitter<number>();

  constructor(private api: ApiService) {}

  ngOnInit() { this.fetchNotes(); }

  fetchNotes(search: string = '') {
    this.api.getNotes(search).subscribe((data: any) => this.notes = data);
  }

  onSelect(note: any) {
    this.selectedNoteId = note.id;
    this.noteSelected.emit(note.id);
  }

  createNew() { this.noteSelected.emit(0); }
}