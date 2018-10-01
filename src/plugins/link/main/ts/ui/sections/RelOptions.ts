import { Option } from '@ephox/katamari';

import Settings from '../../api/Settings';
import Utils from '../../core/Utils';
import { ListOptions } from '../../core/ListOptions';
import { ListItem } from '../DialogTypes';

const getRels = (editor, initialTarget: Option<string>): Option<ListItem[]> => {
  if (Settings.hasRelList(editor.settings)) {
    const list = Settings.getRelList(editor.settings);
    const isTargetBlank = initialTarget.is('_blank');
    const enforceSafe = Settings.allowUnsafeLinkTarget(editor.settings) === false;
    const safeRelExtractor = (item) => Utils.toggleTargetRules(ListOptions.getValue(item), isTargetBlank);
    const sanitizer = enforceSafe ? ListOptions.sanitizeWith(safeRelExtractor) : ListOptions.sanitize;
    return sanitizer(list);
  }
  return Option.none();
};

export const RelOptions = {
  getRels
};