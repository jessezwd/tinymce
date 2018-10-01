/**
 * SuggestionsMenu.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/api/util/Tools';
import Actions, { LastSuggestion } from '../core/Actions';
import { Editor } from 'tinymce/core/api/Editor';
import { Cell } from '@ephox/katamari';
import { DomTextMatcher } from 'tinymce/plugins/spellchecker/core/DomTextMatcher';
import { HTMLElement } from '@ephox/dom-globals';

const ignoreAll = true;

const getSuggestions = (editor: Editor, pluginUrl: string, lastSuggestionsState, startedState, textMatcherState, currentLanguageState, word, spans) => {
  const items = [], suggestions = lastSuggestionsState.get().suggestions[word];

  Tools.each(suggestions, function (suggestion) {
    items.push({
      text: suggestion,
      onAction: () => {
        editor.insertContent(editor.dom.encode(suggestion));
        editor.dom.remove(spans);
        Actions.checkIfFinished(editor, startedState, textMatcherState);
      }
    });
  });
  const hasDictionarySupport = lastSuggestionsState.get().hasDictionarySupport;
  if (hasDictionarySupport) {
    items.push({
      text: 'Add to Dictionary',
      onAction: () => {
        Actions.addToDictionary(editor, pluginUrl, startedState, textMatcherState, currentLanguageState, word, spans);
      }
    });
  }

  items.push.apply(items, [
    {
      text: 'Ignore',
      onAction: () => {
        Actions.ignoreWord(editor, startedState, textMatcherState, word, spans);
      }
    },

    {
      text: 'Ignore all',
      onAction: () => {
        Actions.ignoreWord(editor, startedState, textMatcherState, word, spans, ignoreAll);
      }
    }
  ]);
  return items;
};

const setup = function (editor: Editor, pluginUrl: string, lastSuggestionsState: Cell<LastSuggestion>, startedState: Cell<boolean>, textMatcherState: Cell<DomTextMatcher>, currentLanguageState: Cell<string>) {

  const update = (element: HTMLElement) => {
    const target = element;
    if (target.className === 'mce-spellchecker-word') {
      const spans = Actions.findSpansByIndex(editor, Actions.getElmIndex(target));
      if (spans.length > 0) {
        const rng = editor.dom.createRng();
        rng.setStartBefore(spans[0]);
        rng.setEndAfter(spans[spans.length - 1]);
        editor.selection.setRng(rng);
        return getSuggestions(editor, pluginUrl, lastSuggestionsState, startedState, textMatcherState, currentLanguageState, target.getAttribute('data-mce-word'), spans);
      }
    } else {
      return [];
    }
  };

  editor.ui.registry.addContextMenu('spellchecker', {
    update
  });
};

export default {
  setup
};