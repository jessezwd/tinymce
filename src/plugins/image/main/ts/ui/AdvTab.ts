import { ImageDialogInfo } from './DialogTypes';

const makeTab = function (info: ImageDialogInfo) {
  return {
    title: 'Advanced',
    items: [
      {
        type: 'input',
        label: 'Style',
        name: 'style'
      },
      {
        type: 'grid',
        columns: 2,
        items: [
          {
            type: 'input',
            label: 'Vertical space',
            name: 'vspace'
          },
          {
            type: 'input',
            label: 'Horizontal space',
            name: 'hspace'
          },
          {
            type: 'input',
            label: 'Border width',
            name: 'border'
          },
          {
            type: 'selectbox',
            name: 'borderstyle',
            label: 'Border style',
            items: [
              { text: 'Select...', value: '' },
              { text: 'Solid', value: 'solid' },
              { text: 'Dotted', value: 'dotted' },
              { text: 'Dashed', value: 'dashed' },
              { text: 'Double', value: 'double' },
              { text: 'Groove', value: 'groove' },
              { text: 'Ridge', value: 'ridge' },
              { text: 'Inset', value: 'inset' },
              { text: 'Outset', value: 'outset' },
              { text: 'None', value: 'none' },
              { text: 'Hidden', value: 'hidden' }
            ]
          }
        ]
      },
    ]
  };
};

export const AdvTab = {
  makeTab
};