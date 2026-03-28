import React, { useCallback } from 'react';
import RNBottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import type { BottomSheetProps as RNBottomSheetProps } from '@gorhom/bottom-sheet';
import { useTheme } from '../theme/useTheme';

type Props = {
  sheetRef: React.RefObject<RNBottomSheet | null>;
  snapPoints?: (string | number)[];
  onDismiss?: () => void;
  children: React.ReactNode;
};

export function BottomSheet({
  sheetRef,
  snapPoints = ['50%'],
  onDismiss,
  children,
}: Props) {
  const theme = useTheme();

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    [],
  );

  return (
    <RNBottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onDismiss}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.colors.bgSurface }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.borderStrong }}
    >
      <BottomSheetView>
        {children}
      </BottomSheetView>
    </RNBottomSheet>
  );
}
