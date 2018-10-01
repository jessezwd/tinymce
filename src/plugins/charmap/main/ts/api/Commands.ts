/**
 * Commands.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Dialog from '../ui/Dialog';

const register = function (editor, charMap) {
  editor.addCommand('mceShowCharmap', function () {
    Dialog.open(editor, charMap);
  });
};

export default {
  register
};