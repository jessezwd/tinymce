import WindowManager from 'tinymce/themes/silver/ui/dialog/WindowManager';

import { setupDemo } from '../DemoHelpers';

const helpers = setupDemo();
const winMgr = WindowManager.setup(helpers.extras);

export const SearchReplaceDialogSpec = {
  title: 'Find and replace',
  body: {
    type: 'panel',
    items: [
      {
        type: 'input',
        name: 'findtext',
        label: 'Find'
      },
      {
        type: 'input',
        name: 'replacetext',
        label: 'Replace with'
      },
      {
        type: 'grid',
        columns: 2,
        items: [
          {
            type: 'checkbox',
            name: 'matchcase',
            label: 'Match case'
          },
          {
            type: 'checkbox',
            name: 'wholewords',
            label: 'Whole words'
          }
        ]
      }
    ]
  },
  buttons: [
    {
      type: 'custom',
      name: 'findbutton',
      text: 'Find',
      align: 'start',
      primary: true
    },
    {
      type: 'custom',
      name: 'replacebutton',
      text: 'Replace',
      align: 'start'
    },
    {
      type: 'custom',
      name: 'replaceall',
      text: 'Replace All',
      align: 'start'
    },
    {
      type: 'custom',
      name: 'prev',
      text: 'Prev',
      align: 'end'
    },
    {
      type: 'custom',
      name: 'next',
      text: 'Next',
      align: 'end'
    }
  ],
  initialData: {
    findtext: '',
    replacetext: '',
    matchcase: 'checked',
    wholewords: 'unchecked'
  },
  onAction: (api, details) => {
    const data = api.getData();

    // tslint:disable-next-line:no-console
    console.log(details.name); // Show action find/replace etc

    // tslint:disable-next-line:no-console
    console.log({
      find: data.find,
      replace: data.replace,
      matchcase: data.matchcase,
      wholewords: data.wholewords
    });
  },
  onClose: () => {
    console.log('dialog closing');
  }
};
export const open = () => {
  // The end user will use this as config
  winMgr.open(SearchReplaceDialogSpec, {}, () => {});
};
