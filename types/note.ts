export type Note = {
  id: string;
  content: string;
  date: string;
}

export type NotesData = {
  notes: Note[];
  total: number;
  totalPages: number;
}