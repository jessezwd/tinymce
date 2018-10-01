import {
  ApproxStructure,
  Assertions,
  Chain,
  FocusTools,
  GeneralSteps,
  Keyboard,
  Keys,
  Log,
  Logger,
  Mouse,
  Pipeline,
  Step,
  UiFinder,
} from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Body, Element } from '@ephox/sugar';

import Theme from '../../../../../../silver/main/ts/Theme';

UnitTest.asynctest('Editor (Silver) test', (success, failure) => {
  Theme();
  TinyLoader.setup(
    (editor, onSuccess, onFailure) => {
      const tinyApis = TinyApis(editor);
      const doc = Element.fromDom(document);

      const sAssertFocusOnItem = (itemText: string) => {
        return FocusTools.sTryOnSelector(
          `Focus should be on ${itemText}`,
          doc,
          `.tox-collection__item:contains("${itemText}")`
        );
      };

      const sOpenMenu = (label: string, menuText: string) => {
        const menuTextParts = menuText.indexOf(':') > -1 ? menuText.split(':') : [ menuText ];
        const selector = menuTextParts[0];
        const pseudo = menuTextParts.length > 1 ? ':' + menuTextParts[1] : '';
        return Logger.t(
          `Trying to open menu: ${label}`,
          GeneralSteps.sequence([
            Mouse.sClickOn(Body.body(), `button:contains(${selector})${pseudo}`),
            Chain.asStep(Body.body(), [
              UiFinder.cWaitForVisible('Waiting for alignment menu', '[role="menu"]')
            ]),
          ])
        );
      };

      const sAssertItemTicks = (label: string, expectedTicks: boolean[]) => Logger.t(
        `Checking tick state of items (${label})`,
        Chain.asStep(Body.body(), [
          UiFinder.cFindIn('.tox-selected-menu .tox-collection__group'),
          Assertions.cAssertStructure('Checking structure', ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [ arr.has('tox-collection__group') ],
              children: Arr.map(expectedTicks, (expected) => {
                return s.element('div', {
                  attrs: {
                    'role': str.is('menuitemcheckbox'),
                    'aria-checked': str.is(expected ? 'true' : 'false')
                  }
                });
              })
            });
          }))
        ])
      );

      const sCheckItemsAtLocationPlus = (beforeStep: Step<any, any>, afterStep: Step<any, any>) => (label: string, expectedTicks: boolean[], menuText: string, path: number[], offset: number) => Logger.t(
        label,
        GeneralSteps.sequence([
          tinyApis.sSetCursor(path, offset),
            sOpenMenu('', menuText),
            beforeStep,
            sAssertItemTicks('Checking ticks at location', expectedTicks),
            afterStep,
            Keyboard.sKeydown(doc, Keys.escape(), { }),
            UiFinder.sNotExists(Body.body(), '[role="menu"]'),
        ])
      );

      const sCheckItemsAtLocation = sCheckItemsAtLocationPlus(Step.pass, Step.pass);

      const sCheckSubItemsAtLocation = (expectedSubmenu: string) => sCheckItemsAtLocationPlus(
        GeneralSteps.sequence([
          Keyboard.sKeydown(doc, Keys.right(), { }),
          sAssertFocusOnItem(expectedSubmenu)
        ]),
        // Afterwards, escape the submenu
        Keyboard.sKeydown(doc, Keys.escape(), { })
      );

      const sTestAlignment = Log.stepsAsStep('TBA', 'Checking alignment ticks and updating', [
        tinyApis.sSetContent('<p>First paragraph</p><p>Second paragraph</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 'Fi'.length),
        sOpenMenu('Alignment', 'Align'),
        sAssertFocusOnItem('Left'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Center'),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        UiFinder.sNotExists(Body.body(), '[role="menu"]'),

        sCheckItemsAtLocation(
          'First paragraph after "centering"',
          [ false, true, false, false ],
          'Center',
          [ 0, 0 ], 'Fi'.length
        ),

        sCheckItemsAtLocation(
          'Second paragraph with no set alignment',
          [ false, false, false, false ],
          'Align',
          [ 1, 0 ], 'Se'.length
        ),

        sCheckItemsAtLocation(
          'First paragraph with the alignment set to "center" previously',
          [ false, true, false, false ],
          'Center',
          [ 0, 0 ], 'Fi'.length
        )
      ]);

      const range = (num: number, f: (i: number) => any): any[] => {
        const r = [ ];
        for (let i = 0; i < num; i++) {
          r.push(f(i));
        }
        return r;
      };

      const sTestFontSelect = Log.stepsAsStep('TBA', 'Checking fontselect ticks and updating', [
        tinyApis.sSetContent('<p>First paragraph</p><p>Second paragraph</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 'Fi'.length),
        sOpenMenu('FontSelect', 'Verdana'),
        sAssertFocusOnItem('Andale Mono'),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        UiFinder.sNotExists(Body.body(), '[role="menu"]'),

        sCheckItemsAtLocation(
          'First paragraph after "Andale Mono"',
          [ true ].concat(range(16, () => false)),
          'Andale Mono',
          [ 0, 0, 0 ], 'Fi'.length
        ),

        sCheckItemsAtLocation(
          'Second paragraph with no set font',
          range(14, () => false).concat([ true ]).concat(range(2, () => false)),
          'Verdana',
          [ 1, 0 ], 'Se'.length
        ),

        sCheckItemsAtLocation(
          'First paragraph with the font set to "Andale Mono" previously',
          [ true ].concat(range(16, () => false)),
          'Andale Mono',
          [ 0, 0, 0 ], 'Fi'.length
        )
      ]);

      const sTestFontSizeSelect = Log.stepsAsStep('TBA', 'Checking fontsize ticks and updating', [
        tinyApis.sSetContent('<p>First paragraph</p><p>Second paragraph</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 'Fi'.length),
        sOpenMenu('FontSelect', '14px'), // This might be fragile.
        sAssertFocusOnItem('8pt'),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        UiFinder.sNotExists(Body.body(), '[role="menu"]'),

        sCheckItemsAtLocation(
          'First paragraph after "8pt',
          [ true ].concat(range(6, () => false)),
          '8pt',
          [ 0, 0, 0 ], 'Fi'.length
        ),

        sCheckItemsAtLocation(
          'Second paragraph with no set font size',
          range(7, () => false),
          '14px',
          [ 1, 0 ], 'Se'.length
        ),

        sCheckItemsAtLocation(
          'First paragraph with the font set to "8pt" previously',
          [ true ].concat(range(6, () => false)),
          '8pt',
          [ 0, 0, 0 ], 'Fi'.length
        )
      ]);

      const sTestFormatSelect = Log.stepsAsStep('TBA', 'Checking format ticks and updating', [
        tinyApis.sSetContent('<p>First paragraph</p><p>Second paragraph</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 'Fi'.length),
        sOpenMenu('Format', 'Paragraph:first'),
        sAssertFocusOnItem('Paragraph'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Heading 1'),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        UiFinder.sNotExists(Body.body(), '[role="menu"]'),

        sCheckItemsAtLocation(
          'First block after "h1',
          [ false, true ].concat(range(6, () => false)),
          'Heading 1:first',
          [ 0, 0 ], 'Fi'.length
        ),

        sCheckItemsAtLocation(
          'Second paragraph with no set format',
          [ true ].concat(range(7, () => false)),
          'Paragraph:first',
          [ 1, 0 ], 'Se'.length
        ),

        sCheckItemsAtLocation(
          'First block with the "h1" set previously',
          [ false, true ].concat(range(6, () => false)),
          'Heading 1:first',
          [ 0, 0 ], 'Fi'.length
        ),

        // Check that the menus are working also
        Mouse.sClickOn(Body.body(), '[role="menubar"] [role="menuitem"]:contains("Format")'),
        sAssertFocusOnItem('Bold'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Italic'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Underline'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Strikethrough'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Superscript'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Subscript'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Code'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Formats'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Blocks'),
        Keyboard.sKeydown(doc, Keys.right(), { }),
        sAssertFocusOnItem('Paragraph'),
        sAssertItemTicks('Checking blocks in menu', [ false, true ].concat(
          range(6, () => false)
        )),
        Keyboard.sKeydown(doc, Keys.escape(), { }),
        Keyboard.sKeydown(doc, Keys.escape(), { })
      ]);

      const sTestStyleSelect = Log.stepsAsStep('TBA', 'Checking style ticks and updating', [
        tinyApis.sSetContent('<p>First paragraph</p><p>Second paragraph</p>'),
        tinyApis.sSetCursor([ 0, 0 ], 'Fi'.length),
        sOpenMenu('Format', 'Paragraph:last'),
        sAssertFocusOnItem('Headings'),
        Keyboard.sKeydown(doc, Keys.right(), { }),
        sAssertFocusOnItem('Heading 1'),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        UiFinder.sNotExists(Body.body(), '[role="menu"]'),

        sCheckSubItemsAtLocation('Heading 1')(
          'First block after "h1',
          [ true ].concat(range(5, () => false)),
          'Heading 1:last',
          [ 0, 0 ], 'Fi'.length
        ),

        sCheckSubItemsAtLocation('Heading 1')(
          'Second paragraph with no set format',
          range(6, () => false),
          'Paragraph:last',
          [ 1, 0 ], 'Se'.length
        ),

        sCheckSubItemsAtLocation('Heading 1')(
          'First block with the "h1" set previously',
          [ true ].concat(range(5, () => false)),
          'Heading 1:last',
          [ 0, 0 ], 'Fi'.length
        ),

        // Check that the menus are working also
        Mouse.sClickOn(Body.body(), '[role="menubar"] [role="menuitem"]:contains("Format")'),
        sAssertFocusOnItem('Bold'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Italic'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Underline'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Strikethrough'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Superscript'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Subscript'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Code'),
        Keyboard.sKeydown(doc, Keys.down(), { }),
        sAssertFocusOnItem('Formats'),
        Keyboard.sKeydown(doc, Keys.right(), { }),
        sAssertFocusOnItem('Headings'),
        Keyboard.sKeydown(doc, Keys.right(), { }),
        sAssertFocusOnItem('Heading 1'),
        sAssertItemTicks('Checking headings in menu', [ true ].concat(
          range(5, () => false)
        )),
        Keyboard.sKeydown(doc, Keys.escape(), { }),
        Keyboard.sKeydown(doc, Keys.escape(), { }),
        Keyboard.sKeydown(doc, Keys.escape(), { })
      ]);

      Pipeline.async({ }, [
        sTestAlignment,
        sTestFontSelect,
        sTestFontSizeSelect,
        sTestFormatSelect,
        sTestStyleSelect
      ], onSuccess, onFailure);
    },
    {
      theme: 'silver',
      toolbar: 'align fontselect fontsizeselect formatselect styleselect',
      skin_url: '/project/js/tinymce/skins/oxide'
    },
    () => {
      success();
    },
    failure
  );
});