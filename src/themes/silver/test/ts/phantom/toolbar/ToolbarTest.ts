import { AlloyComponent, GuiFactory, Behaviour, Focusing, Keying, Toolbar } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';

import { renderToolbar, renderToolbarGroup } from '../../../../main/ts/ui/toolbar/CommonToolbar';
import { GuiSetup } from '../../module/AlloyTestUtils';
import { Step, Assertions, ApproxStructure, FocusTools, Keyboard, Keys, GeneralSteps, Logger } from '@ephox/agar';
import { Arr } from '@ephox/katamari';

UnitTest.asynctest('Toolbar Test', (success, failure) => {

  const makeButton = (t) => {
    return {
      dom: {
        tag: 'span',
        innerHtml: t,
        // The '.tox-tbtn' class is here temporarily while we sort of the flow keying selector
        classes: [ 'test-toolbar-item', 'tox-tbtn' ]
      },
      behaviours: Behaviour.derive([
        Focusing.config({ })
      ])
    };
  };

  GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderToolbar({
          uid: 'test-toolbar-uid',
          onEscape: store.adderH('onEscape'),
          initGroups: [
            {
              items: Arr.map([ 'one', 'two', 'three' ], makeButton)
            },
            {
              items: Arr.map([ 'four', 'five' ], makeButton)
            },
            {
              items: Arr.map([ 'six' ], makeButton)
            }
          ]
        })
      );
    },
    (doc, body, gui, toolbar: AlloyComponent, store) => {
      return [
        GuiSetup.mAddStyles(doc, [
          '.tox-toolbar { padding: 0.3em; background: blue; display: flex; flex-direction: row;}',
          '.tox-toolbar__group { background: black; color: white; display: flex; margin: 0.2em; }',
          '.test-toolbar-item { margin: 0.2em; padding: 0.2em; display: flex; }'
        ]),
        Assertions.sAssertStructure(
          'Initial structure of toolbar',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [ arr.has('tox-toolbar') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-toolbar__group') ],
                  children: [
                    s.element('span', {
                      html: str.is('one')
                    }),
                    s.element('span', {
                      html: str.is('two')
                    }),
                    s.element('span', {
                      html: str.is('three')
                    })
                  ]
                }),
                s.element('div', {
                  classes: [ arr.has('tox-toolbar__group') ],
                  children: [
                    s.element('span', {
                      html: str.is('four')
                    }),
                    s.element('span', {
                      html: str.is('five')
                    })
                  ]
                }),
                s.element('div', {
                  classes: [ arr.has('tox-toolbar__group') ],
                  children: [
                    s.element('span', {
                      html: str.is('six')
                    })
                  ]
                })
              ]
            });
          }),
          toolbar.element()
        ),

        Step.sync(() => {
          Keying.focusIn(toolbar);
        }),

        Logger.t(
          'General navigation of toolbar',
          GeneralSteps.sequence([
            FocusTools.sTryOnSelector('Checking focus is on "one"', doc, 'span:contains("one")'),
            Keyboard.sKeydown(doc, Keys.right(), { }),
            FocusTools.sTryOnSelector('Checking focus is on "two"', doc, 'span:contains("two")'),

            Keyboard.sKeydown(doc, Keys.tab(), { }),
            FocusTools.sTryOnSelector('Checking focus is on "four"', doc, 'span:contains("four")'),
          ])
        ),

        Logger.t(
          'Changing the toolbar contents',
          Step.sync(() => {
            const groups = Arr.map([
              {
                items: Arr.map([ 'A', 'B' ], makeButton)
              },
              {
                items: Arr.map([ 'C' ], makeButton)
              }
            ], renderToolbarGroup);
            Toolbar.setGroups(toolbar, groups);
            Keying.focusIn(toolbar);
          })
        ),

        Logger.t(
          'General navigation of changed toolbar',
          GeneralSteps.sequence([
            FocusTools.sTryOnSelector('Checking focus is on "A"', doc, 'span:contains("A")'),
            Keyboard.sKeydown(doc, Keys.right(), { }),
            FocusTools.sTryOnSelector('Checking focus is on "B"', doc, 'span:contains("B")'),

            Keyboard.sKeydown(doc, Keys.tab(), { }),
            FocusTools.sTryOnSelector('Checking focus is on "C"', doc, 'span:contains("C")'),
          ])
        ),

        GuiSetup.mRemoveStyles
      ];
    },
    success,
    failure
  );
});