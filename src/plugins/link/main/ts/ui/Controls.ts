/**
 * Controls.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
import { Option } from '@ephox/katamari';
import { Editor } from 'tinymce/core/api/Editor';

import Actions from '../core/Actions';
import Utils from '../core/Utils';

const setupButtons = function (editor: Editor) {
  editor.ui.registry.addToggleButton('link', {
    icon: 'link',
    tooltip: 'Link',
    onAction: Actions.openDialog(editor),
    onSetup: Actions.toggleActiveState(editor)
  });

  editor.ui.registry.addButton('unlink', {
    icon: 'unlink',
    onAction: Utils.unlink(editor),
    onSetup: Actions.toggleEnabledState(editor)
  });
};

const setupMenuItems = function (editor: Editor) {
  editor.ui.registry.addMenuItem('openlink', {
    text: 'Open link',
    icon: 'new-tab',
    onAction: Actions.gotoSelectedLink(editor),
    onSetup: Actions.toggleEnabledState(editor)
  });

  editor.ui.registry.addMenuItem('link', {
    icon: 'link',
    text: 'Link',
    shortcut: 'Meta+K',
    onAction: Actions.openDialog(editor)
  });

  editor.ui.registry.addMenuItem('unlink', {
    icon: 'unlink',
    text: 'Remove link',
    onAction: Utils.unlink(editor),
    onSetup: Actions.toggleEnabledState(editor)
  });
};

const setupContextMenu = function (editor: Editor) {
  const noLink = [ 'link' ];
  const inLink = [ 'link', 'unlink', 'openlink' ];
  editor.ui.registry.addContextMenu('link', {
    update: (element) => {
      return Utils.hasLinks(editor.dom.getParents(element, 'a')) ? inLink : noLink;
    }
  });
};

const setupContextToolbars = function (editor: Editor) {
  const collapseSelectionToEnd = function (editor: Editor) {
    editor.selection.collapse(false);
  };

  editor.ui.registry.addContextForm('link-form', {
    launch: {
      type: 'contextformtogglebutton',
      icon: 'link',
      onSetup: Actions.toggleActiveState(editor)
    },
    label: 'Link',
    predicate: (node) => !!Utils.getAnchorElement(editor, node),
    initValue: () => {
      return Utils.getAnchorElement(editor) || '';
    },
    commands: [
      {
        type: 'contextformtogglebutton',
        icon: 'link',
        primary: true,
        onSetup: (buttonApi) => {
          const node = editor.selection.getNode();
          // TODO: Make a test for this later.
          buttonApi.setActive(!!Utils.getAnchorElement(editor, node));
          return Actions.toggleActiveState(editor)(buttonApi);
        },
        onAction: (formApi) => {
          const anchor = Utils.getAnchorElement(editor);
          const value = formApi.getValue();
          if (!anchor) {
            const attachState = { href: value, attach: () => { } };
            const onlyText = Utils.isOnlyTextSelected(editor.selection.getContent());
            const text: Option<string> = onlyText ? Option.some(Utils.getAnchorText(editor.selection, anchor)).filter((t) => t.length > 0) : Option.none();
            Utils.link(editor, attachState)({ href: value, text: text.getOr(value) });
            formApi.hide();
          } else {
            editor.dom.setAttrib(anchor, 'href', value);
            collapseSelectionToEnd(editor);
            formApi.hide();
          }
        }
      },
      {
        type: 'contextformtogglebutton',
        icon: 'unlink',
        active: false,
        onSetup: () => () => { },
        // TODO: The original inlite action was quite complex. Are we missing something with this?
        onAction: (formApi) => {
          Utils.unlink(editor)();
          formApi.hide();
        }
      }
    ]
  });
};

export default {
  setupButtons,
  setupMenuItems,
  setupContextMenu,
  setupContextToolbars
};