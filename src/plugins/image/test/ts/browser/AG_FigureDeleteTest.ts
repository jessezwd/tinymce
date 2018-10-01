import { Chain, Log, Mouse, Pipeline, UiControls, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import ImagePlugin from 'tinymce/plugins/image/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

import { cInputForLabel } from '../module/Helpers';

UnitTest.asynctest('browser.tinymce.plugins.image.FigureDeleteTest', (success, failure) => {

  SilverTheme();
  ImagePlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor, {
      toolBarSelector: '.tox-toolbar'
    });

    Pipeline.async({}, [
      tinyApis.sFocus,
      Log.stepsAsStep('TBA', 'Image: removing src in dialog should remove figure element', [
        tinyApis.sSetContent('<figure class="image"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" /><figcaption>x</figcaption></figure>'),
        tinyApis.sSetSelection([], 1, [], 2),
        tinyUi.sClickOnToolbar('click on image button', 'button[aria-label="Insert/edit image"]'),
        Chain.asStep({}, [
          tinyUi.cWaitForPopup('Wait for dialog', 'div[role="dialog"]'),
          cInputForLabel('Source'),
          UiControls.cSetValue('')
        ]),
        Chain.asStep({}, [
          tinyUi.cWaitForPopup('Wait for dialog', 'div[role="dialog"]'),
          Mouse.cClickOn('button:contains("Ok")')
        ]),
        tinyApis.sAssertContent('')
      ]),

      Log.stepsAsStep('TBA', 'Image: clicking caption textbox removes figure and adds image only', [
        tinyApis.sSetContent('<figure class="image"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" /><figcaption>x</figcaption></figure>'),
        tinyApis.sSetSelection([], 1, [], 2),
        tinyUi.sClickOnToolbar('click on image button', 'button[aria-label="Insert/edit image"]'),
        Chain.asStep({}, [
          tinyUi.cWaitForPopup('Wait for dialog', 'div[role="dialog"]'),
          UiFinder.cFindIn('label:contains("Show caption") input[type="checkbox"]'),
          Mouse.cClick,
        ]),
        Chain.asStep({}, [
          tinyUi.cWaitForPopup('Find dialog', 'div[role="dialog"]'),
          Mouse.cClickOn('button:contains("Ok")'),
        ]),
        tinyApis.sAssertContentPresence({ img: 1, figure: 0, figcaption: 0 })
      ])

    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'image',
    toolbar: 'image',
    image_caption: true,
    skin_url: '/project/js/tinymce/skins/oxide/',
  }, success, failure);
});
