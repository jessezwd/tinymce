import { DomUniverse } from '@ephox/boss';
import Words from '../general/Words';

const universe = DomUniverse();

const identify = function (allText: string) {
  return Words.identify(allText);
};

const isWord = function (text: string) {
  return Words.isWord(universe, text);
};

export default {
  identify,
  isWord
};