import { bindButton } from '@ui/components/Button';

export class PauseScreen {
  init(callbacks: { onResume: () => void; onMenu: () => void }): void {
    bindButton('btn-resume', callbacks.onResume);
    bindButton('btn-pause-menu', callbacks.onMenu);
  }
}
