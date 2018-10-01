import { SimpleSpec } from '@ephox/alloy';
import { Types } from '@ephox/bridge';
import { Arr } from '@ephox/katamari';
import { UiFactoryBackstageShared } from '../../backstage/Backstage';

export const renderGrid = <I>(spec: Types.Grid.Grid, backstage: UiFactoryBackstageShared): SimpleSpec => {
  return {
    dom: {
      tag: 'div',
      classes: ['tox-form', `tox-form--${spec.columns}col`]
    },
    components: Arr.map(spec.items, backstage.interpreter)
  };
};