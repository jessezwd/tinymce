import { AlloySpec, Behaviour, ItemWidget, Keying, Memento, Menu, SimpleOrSketchSpec } from '@ephox/alloy';
import { MenuSpec } from '@ephox/alloy/lib/main/ts/ephox/alloy/ui/types/MenuTypes';
import { Id, Option } from '@ephox/katamari';

import { dom as menuDom } from './MenuParts';

export interface WidgetMenuFoo {
  value: string;
  widget: AlloySpec;
}

export const renderWidgetMenu = (spec: WidgetMenuFoo): Partial<MenuSpec> => {
  const memWidget = Memento.record(spec.widget as SimpleOrSketchSpec);
  return {
    value: spec.value,
    items: [
      {
        type: 'widget',
        data: {
          // FIX: Widgets.
          value: Id.generate('widget-id')
        },
        autofocus: true,

        // FIX: widget classes.
        dom: {
          tag: 'div'
        },
        components: [
          ItemWidget.parts().widget(
            {
              dom: {
                tag: 'div',
                classes: [ 'tox-menu-widget-js' ]
              },
              components: [ memWidget.asSpec() ],
              behaviours: Behaviour.derive([
                Keying.config({
                  mode: 'special',
                  focusIn: (comp) => {
                    memWidget.getOpt(comp).each(Keying.focusIn);
                    return Option.some(true);
                  }
                })
              ])
            }
          )
        ],
      }
    ],
    dom: menuDom(false, 1, 'normal'),
    components: [
      Menu.parts().items({ })
    ]
  };
};