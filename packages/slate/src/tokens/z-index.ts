export const zIndex = {
  base: 0,
  raised: 10,
  overlay: 100,
  toast: 200,
  modal: 300,
} as const;

export type ZIndexKey = keyof typeof zIndex;
