import React from 'react';
import { render } from '@testing-library/react-native';
import { PageContent } from '../AppShell';
import { spacing } from '../../theme/tokens';
import { View } from 'react-native';

describe('PageContent', () => {
  it('applies horizontal padding by default based on spacing.lg', () => {
    const { getByTestId } = render(
      <PageContent testID="page-content-default">
        <View />
      </PageContent>
    );

    const element = getByTestId('page-content-default');
    expect(element.props.style).toContainEqual({ paddingHorizontal: spacing.lg });
  });

  it('removes horizontal padding when padded is false', () => {
    const { getByTestId } = render(
      <PageContent padded={false} testID="page-content-unpadded">
        <View />
      </PageContent>
    );

    const element = getByTestId('page-content-unpadded');
    expect(element.props.style).not.toContainEqual({ paddingHorizontal: spacing.lg });
  });

  it('applies custom style alongside default padded style', () => {
    const { getByTestId } = render(
      <PageContent style={{ backgroundColor: 'red' }} testID="page-content-custom">
        <View />
      </PageContent>
    );

    const element = getByTestId('page-content-custom');
    expect(element.props.style).toContainEqual({ paddingHorizontal: spacing.lg });
    expect(element.props.style).toContainEqual({ backgroundColor: 'red' });
  });
});
