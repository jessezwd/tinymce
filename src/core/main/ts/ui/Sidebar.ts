/**
 * Sidebar.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
import { Option } from '@ephox/katamari';

import { Editor, SidebarSettings } from '../api/Editor';

/**
 * This module handle sidebar instances for the editor.
 *
 * @class tinymce.ui.Sidebar
 * @private
 */

const add = function (editor: Editor, name: string, settings: SidebarSettings) {
  const isActive = () => Option.from(editor.queryCommandValue('ToggleSidebar')).is(name);
  const sidebars = editor.sidebars ? editor.sidebars : [];
  sidebars.push({ name, settings });
  editor.sidebars = sidebars;
  editor.ui.registry.addToggleButton(name, {
    icon: settings.icon,
    tooltip: settings.tooltip,
    onAction: (buttonApi) => {
      editor.execCommand('ToggleSidebar', false, name);
      buttonApi.setActive(isActive());
    },
    onSetup: (buttonApi) => {
      const handleToggle = () => buttonApi.setActive(isActive());
      editor.on('ToggleSidebar', handleToggle);
      return () => {
        editor.off('ToggleSidebar', handleToggle);
      };
    }
  });
};

export default {
  add
};