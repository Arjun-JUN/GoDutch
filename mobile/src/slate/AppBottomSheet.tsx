import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, Platform } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetScrollView,
  BottomSheetBackdropProps,
  BottomSheetModalProps,
} from '@gorhom/bottom-sheet';
import { colors } from '../theme/tokens';
import { Text } from './Text';
import { AppButton } from './AppButton';
import { X } from 'lucide-react-native';

interface AppBottomSheetProps
  extends Omit<BottomSheetModalProps, 'children' | 'snapPoints'> {
  snapPoints?: (string | number)[];
  title?: string;
  description?: string;
  /** Wrap content in a scroll view (default: true). */
  scrollable?: boolean;
  children: React.ReactNode;
}

/**
 * Slate bottom sheet — the mobile-native replacement for centered CSS modals.
 * Use for pickers, "paid by" / split configuration, payment confirmation.
 */
export const AppBottomSheet = forwardRef<BottomSheetModal, AppBottomSheetProps>(
  (
    {
      snapPoints: customSnapPoints,
      title,
      description,
      scrollable = true,
      children,
      ...rest
    },
    ref
  ) => {
    const snapPoints = useMemo(
      () => customSnapPoints ?? ['60%', '90%'],
      [customSnapPoints]
    );

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.4}
          pressBehavior="close"
        />
      ),
      []
    );

    const Container = scrollable ? BottomSheetScrollView : BottomSheetView;

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: colors.surfaceSolid,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
        }}
        handleIndicatorStyle={{
          backgroundColor: colors.mutedSubtle,
          width: 44,
          height: 4,
        }}
        enableDynamicSizing={false}
        keyboardBehavior={Platform.OS === 'ios' ? 'interactive' : 'extend'}
        keyboardBlurBehavior="restore"
        {...rest}
      >
        <Container
          // @ts-expect-error contentContainerStyle exists on scroll view only
          contentContainerStyle={
            scrollable
              ? { padding: 24, paddingBottom: 40 }
              : undefined
          }
          style={scrollable ? undefined : { flex: 1, padding: 24 }}
        >
          {title ? (
            <View style={{ marginBottom: 20 }}>
              <Text variant="titleLg">{title}</Text>
              {description ? (
                <Text variant="body" tone="muted" className="mt-1">
                  {description}
                </Text>
              ) : null}
            </View>
          ) : null}
          {children}
        </Container>
      </BottomSheetModal>
    );
  }
);
AppBottomSheet.displayName = 'AppBottomSheet';

interface SheetHeaderProps {
  title: string;
  onClose?: () => void;
  action?: React.ReactNode;
}

export const SheetHeader: React.FC<SheetHeaderProps> = ({ title, onClose, action }) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    }}
  >
    <Text variant="titleLg">{title}</Text>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {action}
      {onClose ? (
        <AppButton
          variant="icon"
          size="sm"
          onPress={onClose}
          leftIcon={<X size={18} color={colors.foreground} strokeWidth={2.5} />}
        />
      ) : null}
    </View>
  </View>
);
