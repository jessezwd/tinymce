import { Keys, Pipeline, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyActions, TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import SavePlugin from 'tinymce/plugins/save/Plugin';
import 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.save.SaveSanityTest', (success, failure) => {

  SavePlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor, {toolBarSelector: '.tox-toolbar'});
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    Pipeline.async({},
      Log.steps('TBA', 'Save: Assert Save button is disabled when editor is opened. Add content and assert Save button is enabled', [
        tinyUi.sWaitForUi('check button', 'button[aria-label="Save"][disabled="disabled"]'),
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetCursor([0, 0], 1),
        tinyActions.sContentKeystroke(Keys.enter(), {}),
        tinyUi.sWaitForUi('check button', 'button[aria-label="Save"]:not([disabled="disabled"])')
      ])
    , onSuccess, onFailure);
  }, {
    plugins: 'save',
    toolbar: 'save',
    skin_url: '/project/js/tinymce/skins/oxide',
    theme: 'silver'
  }, success, failure);
});
