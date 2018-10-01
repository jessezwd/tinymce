import * as Icons from '../../../../../../themes/silver/main/ts/ui/icons/Icons';
import { window } from '@ephox/dom-globals';

export default {
  title: 'AlertBanner',
  body: {
    type: 'panel',
    items: [
      {
        type: 'alertbanner',
        text: 'Demo the alert banner message',
        level: 'warn',
        icon: Icons.getDefault('icon-help'),
        url: 'https://www.tiny.cloud/'
      }
    ]
  },
  buttons: [
    {
      type: 'submit',
      name: 'ok',
      text: 'Ok',
      primary: true
    },
    {
      type: 'cancel',
      name: 'cancel',
      text: 'Cancel'
    }
  ],
  onSubmit: (api) => {
    api.close();
  },
  onAction: (api, detail) => {
    if (detail.name === 'alert-banner' && detail.value && detail.value.substr(0, 4) === 'http') {
      window.open(detail.value);
    }
  }
};