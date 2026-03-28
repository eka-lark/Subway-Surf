import { setProgressBar } from '@ui/components/ProgressBar';

export class LoadingScreen {
  setProgress(progress: number): void { setProgressBar('loading-bar', progress); }
  setText(text: string): void {
    const el = document.getElementById('loading-text');
    if (el) el.textContent = text;
  }
}
