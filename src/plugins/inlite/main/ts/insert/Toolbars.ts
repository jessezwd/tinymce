import { Element, Node, PredicateFind, SelectorFind } from '@ephox/sugar';
import Settings from '../api/Settings';
import { Editor } from 'tinymce/core/api/Editor';

const addToEditor = (editor: Editor) => {
  editor.ui.registry.addContextToolbar('quickblock', {
    predicate: (node) => {
      const sugarNode = Element.fromDom(node);
      const textBlockElementsMap = editor.schema.getTextBlockElements();
      const isRoot = (elem) => elem.dom() === editor.getBody();
      return SelectorFind.closest(sugarNode, 'table', isRoot).fold(
        () => PredicateFind.closest(sugarNode, (elem) => {
          return Node.name(elem) in textBlockElementsMap && editor.dom.isEmpty(elem.dom());
        }, isRoot).isSome(),
        () => false
      );
    },
    items: Settings.getInsertToolbarItems(editor),
    position: 'line',
    scope: 'editor'
  });
};

export default {
  addToEditor
};