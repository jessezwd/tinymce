/**
 * Helpers.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
import { HTMLElement, Node } from '@ephox/dom-globals';
import { Arr, Fun, Obj, Strings } from '@ephox/katamari';
import { Css, Element } from '@ephox/sugar';
import { Editor } from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

import Styles from '../actions/Styles';
import { shouldStyleWithCss } from '../api/Settings';

/**
 * @class tinymce.table.ui.Helpers
 * @private
 */

const buildListItems = (inputList, itemCallback, startItems?) => {
  const appendItems = (values, output?) => {
    output = output || [];

    Tools.each(values, (item) => {
      const menuItem: any = { text: item.text || item.title };

      if (item.menu) {
        menuItem.menu = appendItems(item.menu);
      } else {
        menuItem.value = item.value;

        if (itemCallback) {
          itemCallback(menuItem);
        }
      }

      output.push(menuItem);
    });

    return output;
  };

  return appendItems(inputList, startItems || []);
};

const extractAdvancedStyles = (dom, elm) => {
  const rgbToHex = (value: string) => Strings.startsWith(value, 'rgb') ? dom.toHex(value) : value;

  const borderStyle = Css.getRaw(Element.fromDom(elm), 'border-style').getOr('');
  const borderColor = Css.getRaw(Element.fromDom(elm), 'border-color').map(rgbToHex).getOr('');
  const bgColor = Css.getRaw(Element.fromDom(elm), 'background-color').map(rgbToHex).getOr('');

  return {
    borderstyle: borderStyle,
    bordercolor: borderColor,
    backgroundcolor: bgColor
  };
};

const getSharedValues = (data) => {
  // Mutates baseData to return an object that contains only the values
  // that were the same across all objects in data
  const baseData = data[0];
  const comparisonData = data.slice(1);
  const keys = Obj.keys(baseData);

  Arr.each(comparisonData, (items) => {
    Arr.each(keys, (key) => {
      Obj.each(items, (itemValue, itemKey, _) => {
        const comparisonValue = baseData[key];
        if (comparisonValue !== '' && key === itemKey) {
          if (comparisonValue !== itemValue) {
            baseData[key] = '';
          }
        }
      });
    });
  });

  return baseData;
};

const getAdvancedTab = () => {
  return {
    title: 'Advanced',
    items: [
      {
        name: 'borderstyle',
        type: 'selectbox',
        label: 'Border style',
        items: [
          { text: 'Select...', value: '' },
          { text: 'Solid', value: 'solid' },
          { text: 'Dotted', value: 'dotted' },
          { text: 'Dashed', value: 'dashed' },
          { text: 'Double', value: 'double' },
          { text: 'Groove', value: 'groove' },
          { text: 'Ridge', value: 'ridge' },
          { text: 'Inset', value: 'inset' },
          { text: 'Outset', value: 'outset' },
          { text: 'None', value: 'none' },
          { text: 'Hidden', value: 'hidden' }
        ]
      },
      {
        name: 'bordercolor',
        type: 'colorinput',
        label: 'Border color'
      },
      {
        name: 'backgroundcolor',
        type: 'colorinput',
        label: 'Background color'
      }
    ]
  };
};

// The extractDataFrom... functions are in this file partly for code reuse and partly so we can test them,
// because some of these are crazy complicated

const getAlignment = (alignments, formatName, dataName, editor, elm) => {
  const alignmentData = {};
  Tools.each(alignments.split(' '), (name) => {
    if (editor.formatter.matchNode(elm, formatName + name)) {
      alignmentData[dataName] = name;
    }
  });

  if (!alignmentData[dataName]) {
    // TODO: Note, this isn't a real value. But maybe that is OK?
    alignmentData[dataName] = '';
  }

  return alignmentData;
};

const getHAlignment = Fun.curry(getAlignment, 'left center right');
const getVAlignment = Fun.curry(getAlignment, 'top middle bottom');

export interface TableData {
  height: string;
  width: string;
  cellspacing: string;
  cellpadding: string;
  caption: string;
  class: string;
  align: string;
  type: string;
  border: string;
  cols?: string;
  rows?: string;
  borderstyle?: string;
  bordercolor?: string;
  backgroundcolor?: string;
}

const extractDataFromTableElement = (editor: Editor, elm, hasAdvTableTab: boolean): TableData => {
  const getBorder = (dom, elm) => {
    // Cases (in order to check):
    // 1. shouldStyleWithCss - extract border-width style if it exists
    // 2. !shouldStyleWithCss && border attribute - set border attribute as value
    // 3. !shouldStyleWithCss && nothing on the table - grab styles from the first th or td

    const optBorderWidth = Css.getRaw(Element.fromDom(elm), 'border-width');
    if (shouldStyleWithCss(editor) && optBorderWidth.isSome()) {
      return optBorderWidth.getOr('');
    }
    return dom.getAttrib(elm, 'border') || Styles.getTDTHOverallStyle(editor.dom, elm, 'border-width')
      || Styles.getTDTHOverallStyle(editor.dom, elm, 'border');
  };

  const dom = editor.dom;

  const data: any = {
    width: dom.getStyle(elm, 'width') || dom.getAttrib(elm, 'width'),
    height: dom.getStyle(elm, 'height') || dom.getAttrib(elm, 'height'),
    cellspacing: dom.getStyle(elm, 'border-spacing') || dom.getAttrib(elm, 'cellspacing'),
    cellpadding: dom.getAttrib(elm, 'cellpadding') || Styles.getTDTHOverallStyle(editor.dom, elm, 'padding'),
    border: getBorder(dom, elm),
    caption: !!dom.select('caption', elm)[0] ? 'checked' : 'unchecked',
    class: dom.getAttrib(elm, 'class', ''),
    ...getHAlignment('align', 'align', editor, elm),
    ...(hasAdvTableTab ? extractAdvancedStyles(dom, elm) : {})
  };

  return data;
};

export interface RowData {
  height: string;
  scope: string;
  class: string;
  align: string;
  type: string;
  borderstyle?: string;
  bordercolor?: string;
  backgroundcolor?: string;
}

const extractDataFromRowElement = (editor: Editor, elm: Node, hasAdvancedRowTab: boolean): RowData => {
  const dom = editor.dom;
  const data: RowData = {
    height: dom.getStyle(elm, 'height') || dom.getAttrib(elm, 'height'),
    scope: dom.getAttrib(elm, 'scope'),
    class: dom.getAttrib(elm, 'class', ''),
    align: '',
    type: elm.parentNode.nodeName.toLowerCase(),
    ...getHAlignment('align', 'align', editor, elm),
    ...(hasAdvancedRowTab ? extractAdvancedStyles(dom, elm) : {})
  };

  return data;
};

export interface CellData {
  width: string;
  height: string;
  scope: string;
  celltype: string;
  class: string;
  halign: string;
  valign: string;
  borderstyle?: string;
  bordercolor?: string;
  backgroundcolor?: string;
}

const extractDataFromCellElement = (editor: Editor, elm: HTMLElement, hasAdvancedCellTab: boolean): CellData => {
  const dom = editor.dom;
  const data: CellData = {
    width: dom.getStyle(elm, 'width') || dom.getAttrib(elm, 'width'),
    height: dom.getStyle(elm, 'height') || dom.getAttrib(elm, 'height'),
    scope: dom.getAttrib(elm, 'scope'),
    celltype: elm.nodeName.toLowerCase(),
    class: dom.getAttrib(elm, 'class', ''),
    ...getHAlignment('align', 'halign', editor, elm),
    ...getVAlignment('valign', 'valign', editor, elm),
    ...(hasAdvancedCellTab ? extractAdvancedStyles(dom, elm) : {})
  };

  return data;
};

export default {
  buildListItems,
  extractAdvancedStyles,
  getSharedValues,
  getAdvancedTab,
  extractDataFromTableElement,
  extractDataFromRowElement,
  extractDataFromCellElement
};