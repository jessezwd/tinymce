import {
  AlloySpec,
  AlloyTriggers,
  Behaviour,
  Input,
  Keying,
  Memento,
  SimpleSpec
} from '@ephox/alloy';
import { Toolbar } from '@ephox/bridge';
import { Id, Option } from '@ephox/katamari';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { renderToolbar } from '../toolbar/CommonToolbar';
import { generate } from './ContextFormButtons';

const renderContextForm = (ctx: Toolbar.ContextForm, providersBackstage: UiFactoryBackstageProviders) => {
  // Cannot use the FormField.sketch, because the DOM structure doesn't have a wrapping group
  const inputId = Id.generate('context-form-field');

  const label: Option<SimpleSpec> = ctx.label.map((label) => ({
    dom: {
      tag: 'label',
      classes: [ 'tox-toolbar-label' ],
      attributes: {
        for: inputId
      },
      innerHtml: label
    }
  }));

  // Only add the ID if a label is present.
  const inputAttributes = ctx.label.fold(
    () => ({ }),
    (_) => ({ id: inputId })
  );

  const memInput = Memento.record(
    Input.sketch({
      inputClasses: [ 'tox-toolbar-textfield', 'tox-toolbar-nav-js' ],
      data: ctx.initValue(),
      inputAttributes,
      selectOnFocus: true,
      inputBehaviours: Behaviour.derive([
        Keying.config({
          mode: 'special',
          onEnter: (input) => {
            return commands.findPrimary(input).map((primary) => {
              AlloyTriggers.emitExecute(primary);
              return true;
            });
          },
          // These two lines need to be tested. They are about left and right bypassing
          // any keyboard handling, and allowing left and right to be processed by the input
          // Maybe this should go in an alloy sketch for Input?
          onLeft: (comp, se) => {
            se.cut();
            return Option.none();
          },
          onRight: (comp, se) => {
            se.cut();
            return Option.none();
          }
        })
      ])
    })
  );

  const commands = generate(memInput, ctx.commands, providersBackstage);

  return renderToolbar({
    uid: Id.generate('context-toolbar'),
    initGroups: [
      {
        items: label.toArray().concat([ memInput.asSpec() ])
      },
      {
        items: commands.asSpecs() as AlloySpec[]
      }
    ],
    onEscape: Option.none
  });
};

export const ContextForm = {
  renderContextForm
};