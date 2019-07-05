import { ClientRect, Document, DOMRect } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import Element from '../../api/node/Element';
import * as Traverse from '../../api/search/Traverse';
import * as CursorPosition from '../../api/selection/CursorPosition';

/*
 * When a node has children, we return either the first or the last cursor
 * position, whichever is closer horizontally
 *
 * When a node has no children, we return the start of end of the element,
 * depending on which is closer horizontally
 * */

// TODO: Make this RTL compatible
const COLLAPSE_TO_LEFT = true;
const COLLAPSE_TO_RIGHT = false;

const getCollapseDirection = function (rect: ClientRect | DOMRect, x: number) {
  return x - rect.left < rect.right - x ? COLLAPSE_TO_LEFT : COLLAPSE_TO_RIGHT;
};

const createCollapsedNode = function (doc: Element, target: Element, collapseDirection: boolean) {
  const r = doc.dom().createRange();
  r.selectNode(target.dom());
  r.collapse(collapseDirection);
  return r;
};

const locateInElement = function (doc: Element, node: Element, x: number) {
  const cursorRange = (doc.dom() as Document).createRange();
  cursorRange.selectNode(node.dom());
  const rect = cursorRange.getBoundingClientRect();
  const collapseDirection = getCollapseDirection(rect, x);

  const f = collapseDirection === COLLAPSE_TO_LEFT ? CursorPosition.first : CursorPosition.last;
  return f(node).map(function (target: Element) {
    return createCollapsedNode(doc, target, collapseDirection);
  });
};

const locateInEmpty = function (doc: Element, node: Element, x: number) {
  const rect = node.dom().getBoundingClientRect();
  const collapseDirection = getCollapseDirection(rect, x);
  return Option.some(createCollapsedNode(doc, node, collapseDirection));
};

const search = function (doc: Element, node: Element, x: number) {
  const f = Traverse.children(node).length === 0 ? locateInEmpty : locateInElement;
  return f(doc, node, x);
};

export { search };
