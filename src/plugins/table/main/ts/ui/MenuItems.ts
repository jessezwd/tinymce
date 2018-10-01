/**
 * MenuItems.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Option, Thunk } from '@ephox/katamari';
import { TableLookup } from '@ephox/snooker';
import { Element } from '@ephox/sugar';
import { Editor } from 'tinymce/core/api/Editor';
import { Selections } from 'tinymce/plugins/table/selection/Selections';
import InsertTable from '../actions/InsertTable';
import { hasTableGrid } from '../api/Settings';
import TableTargets from '../queries/TableTargets';
import { MenuItemApi } from '@ephox/bridge/lib/main/ts/ephox/bridge/api/Menu';

const addMenuItems = (editor: Editor, selections: Selections) => {
  let targets = Option.none;

  // AP-172 AP-65 TODO functionality functions. do we even need half of these now?
  const noTargetDisable = (ctrl) => {
    ctrl.setDisabled(true);
  };

  const ctrlEnable = (ctrl) => {
    ctrl.setDisabled(false);
  };

  const setEnabled = (api) => {
    targets().fold(() => {
      noTargetDisable(api);
    }, (targets) => {
      ctrlEnable(api);
    });

    return () => { };
  };

  const setEnabledMerge = (api) => {
    targets().fold(() => {
      noTargetDisable(api);
    }, (targets) => {
      api.setDisabled(targets.mergable().isNone());
    });

    return () => { };
  };

  const setEnabledUnmerge = (api) => {
    targets().fold(() => {
      noTargetDisable(api);
    }, (targets) => {
      api.setDisabled(targets.unmergable().isNone());
    });

    return () => { };
  };

  const resetTargets = () => {
    targets = Thunk.cached(() => {
      const cellOpt = Option.from(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
      return cellOpt.bind((cellDom) => {
        const cell = Element.fromDom(cellDom);
        const table = TableLookup.table(cell);
        return table.map((table) => {
          return TableTargets.forMenu(selections, table, cell);
        });
      });
    });
  };

  editor.on('nodechange', resetTargets);

  const cmd = (command) => () => editor.execCommand(command);

  const insertTableAction = ({numRows, numColumns}) => {
    editor.undoManager.transact(function () {
      InsertTable.insert(editor, numColumns, numRows);
    });

    editor.addVisual();
  };

  const insertTable: MenuItemApi = hasTableGrid(editor) === false ?
    {
      text: 'Table',
      icon: 'table',
      onAction: cmd('mceInsertTable')
    } :
    {
      text: 'Table',
      icon: 'table',
      getSubmenuItems: () => [{type: 'fancymenuitem', fancytype: 'inserttable', onAction: insertTableAction}]
    };

  const tableProperties = {
    text: 'Table properties',
    onSetup: setEnabled,
    onAction: cmd('mceTableProps')
  };

  const deleteTable = {
    text: 'Delete table',
    icon: 'table-delete-table',
    onSetup: setEnabled,
    onAction: cmd('mceTableDelete')
  };

  // TODO: Get working with the new API
  const row: MenuItemApi = {
    text: 'Row',
    getSubmenuItems: () => [
      { type: 'menuitem', text: 'Insert row before', icon: 'table-insert-row-above', onAction: cmd('mceTableInsertRowBefore'), onSetup: setEnabled },
      { type: 'menuitem', text: 'Insert row after', icon: 'table-insert-row-after', onAction: cmd('mceTableInsertRowAfter'), onSetup: setEnabled },
      { type: 'menuitem', text: 'Delete row', icon: 'table-delete-row', onAction: cmd('mceTableDeleteRow'), onSetup: setEnabled },
      { type: 'menuitem', text: 'Row properties', icon: 'table-row-properties', onAction: cmd('mceTableRowProps'), onSetup: setEnabled },
      { type: 'separator' },
      { type: 'menuitem', text: 'Cut row', onAction: cmd('mceTableCutRow'), onSetup: setEnabled },
      { type: 'menuitem', text: 'Copy row', onAction: cmd('mceTableCopyRow'), onSetup: setEnabled },
      { type: 'menuitem', text: 'Paste row before', onAction: cmd('mceTablePasteRowBefore'), onSetup: setEnabled },
      { type: 'menuitem', text: 'Paste row after', onAction: cmd('mceTablePasteRowAfter'), onSetup: setEnabled }
    ]
  };

  // TODO: Get working with the new API
  const column: MenuItemApi = {
    text: 'Column',
    getSubmenuItems: () => [
      { type: 'menuitem', text: 'Insert column before', icon: 'table-insert-column-before', onAction: cmd('mceTableInsertColBefore'), onSetup: setEnabled },
      { type: 'menuitem', text: 'Insert column after', icon: 'table-insert-column-after', onAction: cmd('mceTableInsertColAfter'), onSetup: setEnabled },
      { type: 'menuitem', text: 'Delete column', icon: 'table-delete-column', onAction: cmd('mceTableDeleteCol'), onSetup: setEnabled }
    ]
  };

  // TODO: Get working with the new API
  const cell: MenuItemApi = {
    // separator: 'before',
    text: 'Cell',
    getSubmenuItems: () => [
      { type: 'menuitem', text: 'Cell properties', icon: 'table-cell-properties', onAction: cmd('mceTableCellProps'), onSetup: setEnabled },
      { type: 'menuitem', text: 'Merge cells', icon: 'table-merge-cells', onAction: cmd('mceTableMergeCells'), onSetup: setEnabledMerge },
      { type: 'menuitem', text: 'Split cell', icon: 'table-split-cells', onAction: cmd('mceTableSplitCells'), onSetup: setEnabledUnmerge }
    ]
  };

  editor.ui.registry.addMenuItem('inserttable', insertTable);
  editor.ui.registry.addMenuItem('tableprops', tableProperties);
  editor.ui.registry.addMenuItem('deletetable', deleteTable);
  editor.ui.registry.addMenuItem('row', row);
  editor.ui.registry.addMenuItem('column', column);
  editor.ui.registry.addMenuItem('cell', cell);

  editor.ui.registry.addContextMenu('table', {
    update: () => {
      // context menu fires before node change, so check the selection here first
      resetTargets();
      // ignoring element since it's monitored elsewhere
      return targets().fold(() => [], () => {
        return ['cell', 'row', 'column', '|', 'tableprops', 'deletetable'];
      });
    }
  });
};

export default {
  addMenuItems
};