import { useInput } from 'ink';

interface UseKeyboardOptions {
  onEscape?: () => void;
  onEnter?: () => void;
  onUp?: () => void;
  onDown?: () => void;
  onTab?: () => void;
  isActive?: boolean;
}

export function useKeyboard(options: UseKeyboardOptions): void {
  const { onEscape, onEnter, onUp, onDown, onTab, isActive = true } = options;

  useInput(
    (input, key) => {
      if (!isActive) return;

      if (key.escape && onEscape) {
        onEscape();
      }
      if (key.return && onEnter) {
        onEnter();
      }
      if (key.upArrow && onUp) {
        onUp();
      }
      if (key.downArrow && onDown) {
        onDown();
      }
      if (key.tab && onTab) {
        onTab();
      }
    },
    { isActive }
  );
}
