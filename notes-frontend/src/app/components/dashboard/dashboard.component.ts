import { Component, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NoteListComponent } from '../note-list/note-list.component';
import { NoteDetailComponent } from '../note-detail/note-detail.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, NoteListComponent, NoteDetailComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  selectedNoteId: number | null = null;
  isMobile = window.innerWidth <= 768;

  @ViewChild(NoteListComponent) noteList!: NoteListComponent;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) { this.isMobile = event.target.innerWidth <= 768; }

  onNoteSelected(id: number) { this.selectedNoteId = id; }

  refreshList() {
    this.noteList.fetchNotes();
    if (this.isMobile) this.selectedNoteId = null;
  }
}