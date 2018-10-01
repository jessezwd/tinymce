import { Arr } from '@ephox/katamari';

export interface CharItem {
  value: string;
  icon: string;
  text: string;
}

const scan = (group: { characters: Array<[ number, string ]> }, pattern: string): CharItem[] => {
  const matches = [ ];
  Arr.each(group.characters, (g) => {
    if (String.fromCharCode(g[0]).indexOf(pattern) > -1 || g[1].indexOf(pattern) > -1) {
      matches.push(g);
    }
});

  return Arr.map(matches, (m) => {
    return {
      text: m[1] + ' (' + m[0] + ')',
      value: String.fromCharCode(m[0]),
      icon: String.fromCharCode(m[0])
    };
  });
};

export default {
  scan
};
