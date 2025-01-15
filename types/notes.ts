export type AlertType = 'error' | 'success' | 'info' | 'warning';

export interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  type: AlertType;
}

export interface Note {
  id: string;
  content: string;
  contentPreview: string;
  date: string;
  tag?: string;
}
