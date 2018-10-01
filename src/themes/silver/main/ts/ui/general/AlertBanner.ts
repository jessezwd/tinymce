import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { AlloyTriggers, Button, Container, SketchSpec } from '@ephox/alloy';
import { formActionEvent } from 'tinymce/themes/silver/ui/general/FormEvents';
import * as Icons from '../icons/Icons';

export interface AlertDialog {
  text: string;
  level: 'info' | 'warn' | 'error' | 'success';
  icon: string;
  url?: string;
  actionLabel: string;
}

export const renderAlertDialog = (spec: AlertDialog, providersBackstage: UiFactoryBackstageProviders): SketchSpec => {
  // For using the alert banner inside a dialog
  return Container.sketch({
    dom: {
      tag: 'div',
      attributes: {
        role: 'alert'
      },
      classes: [ 'tox-notification', 'tox-notification--in', `tox-notification--${spec.level}` ]
    },
    components: [{
        dom: {
          tag: 'div',
          classes: [ 'tox-notification__icon' ],
          innerHtml: spec.icon
        }
      },
      {
        dom: {
          tag: 'div',
          classes: [ 'tox-notification__body'],
          // TODO: AP-247: Escape this text so that it can't contain script tags
          innerHtml: spec.text
        }
      },
      Button.sketch({
        dom: {
          tag: 'button',
          classes: ['tox-notification__dismiss', 'tox-button', 'tox-button--naked', 'tox-button--icon'],
          innerHtml: Icons.get('icon-close', providersBackstage.icons),
        },
        // TODO: aria label this button!
        action: (comp) => {
          AlloyTriggers.emitWith(comp, formActionEvent, { name: 'alert-banner', value: spec.url });
        }
      })
    ]
  });
};
