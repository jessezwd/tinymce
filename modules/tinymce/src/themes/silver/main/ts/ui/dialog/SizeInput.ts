/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AddEventsBehaviour,
  AlloyEvents,
  AlloyTriggers,
  Behaviour,
  CustomEvent,
  FormCoupledInputs as AlloyFormCoupledInputs,
  FormField as AlloyFormField,
  Input as AlloyInput,
  NativeEvents,
  Representing,
  SketchSpec,
  Tabstopping,
  Disabling,
  AlloyComponent
} from '@ephox/alloy';
import { Types } from '@ephox/bridge';
import { Id } from '@ephox/katamari';
import { formChangeEvent } from 'tinymce/themes/silver/ui/general/FormEvents';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as Icons from '../icons/Icons';
import { formatSize, makeRatioConverter, noSizeConversion, parseSize, SizeConversion } from '../sizeinput/SizeInputModel';
import { Omit } from '../Omit';

interface RatioEvent extends CustomEvent {
  isField1: () => boolean;
}

type SizeInputSpec = Omit<Types.SizeInput.SizeInput, 'type'>;

export const renderSizeInput = (spec: SizeInputSpec, providersBackstage: UiFactoryBackstageProviders): SketchSpec => {
  let converter: SizeConversion = noSizeConversion;

  const ratioEvent = Id.generate('ratio-event');

  const pLock = AlloyFormCoupledInputs.parts().lock({
    dom: {
      tag: 'button',
      classes: ['tox-lock', 'tox-button', 'tox-button--naked', 'tox-button--icon'],
      attributes: {
        title: providersBackstage.translate(spec.label.getOr('Constrain proportions'))  // TODO: tooltips AP-213
      }
    },
    components: [
      {
        dom: {
          tag: 'span',
          classes: ['tox-icon', 'tox-lock-icon__lock'],
          innerHtml: Icons.get('lock', providersBackstage.icons)
        }
      },
      {
        dom: {
          tag: 'span',
          classes: ['tox-icon', 'tox-lock-icon__unlock'],
          innerHtml: Icons.get('unlock', providersBackstage.icons)
        }
      }
    ],
    buttonBehaviours: Behaviour.derive([
      Tabstopping.config({})
    ])
  });

  const formGroup = (components) => {
    return {
      dom: {
        tag: 'div',
        classes: [ 'tox-form__group' ]
      },
      components
    };
  };

  const getFieldPart = (isField1) => AlloyFormField.parts().field({
    factory: AlloyInput,
    inputClasses: ['tox-textfield'],
    inputBehaviours: Behaviour.derive([
      Tabstopping.config({}),
      AddEventsBehaviour.config('size-input-events', [
        AlloyEvents.run(NativeEvents.focusin(), function (component, simulatedEvent) {
          AlloyTriggers.emitWith(component, ratioEvent, { isField1 });
        }),
        AlloyEvents.run(NativeEvents.change(), function (component, simulatedEvent) {
          AlloyTriggers.emitWith(component, formChangeEvent, { name: spec.name });
        })
      ])
    ]),
    selectOnFocus: false
  });

  const getLabel = (label: string) => {
    return {
      dom: {
        tag: 'label',
        classes: ['tox-label'],
        innerHtml: providersBackstage.translate(label)
      }
    };
  };

  const widthField = AlloyFormCoupledInputs.parts().field1(
    formGroup([ AlloyFormField.parts().label(getLabel('Width')), getFieldPart(true) ])
  );

  const heightField = AlloyFormCoupledInputs.parts().field2(
    formGroup([ AlloyFormField.parts().label(getLabel('Height')), getFieldPart(false) ])
  );

  return AlloyFormCoupledInputs.sketch({
    dom: {
      tag: 'div',
      classes: ['tox-form__group']
    },
    components: [
      {
        dom: {
          tag: 'div',
          classes: ['tox-form__controls-h-stack']
        },
        components: [
          // NOTE: Form coupled inputs to the FormField.sketch themselves.
          widthField,
          heightField,
          formGroup([
            getLabel('&nbsp;'),
            pLock
          ])
        ]
      }
    ],
    field1Name: 'width',
    field2Name: 'height',
    locked: true,

    markers: {
      lockClass: 'tox-locked'
    },
    onLockedChange(current: AlloyComponent, other: AlloyComponent, lock: AlloyComponent) {
      parseSize(Representing.getValue(current)).each((size) => {
        converter(size).each((newSize) => {
          Representing.setValue(other, formatSize(newSize));
        });
      });
    },
    coupledFieldBehaviours: Behaviour.derive([
      Disabling.config({ }),
      AddEventsBehaviour.config('size-input-events2', [
        AlloyEvents.run<RatioEvent>(ratioEvent, function (component, simulatedEvent) {
          const isField1 = simulatedEvent.event().isField1();
          const optCurrent = isField1 ? AlloyFormCoupledInputs.getField1(component) : AlloyFormCoupledInputs.getField2(component);
          const optOther = isField1 ? AlloyFormCoupledInputs.getField2(component) : AlloyFormCoupledInputs.getField1(component);
          const value1 = optCurrent.map<string>(Representing.getValue).getOr('');
          const value2 = optOther.map<string>(Representing.getValue).getOr('');
          converter = makeRatioConverter(value1, value2);
        })
      ])
    ])
  });
};