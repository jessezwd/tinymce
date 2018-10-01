import { ImageDialogInfo } from './DialogTypes';
import { Arr } from '@ephox/katamari';

const makeItems = function (info: ImageDialogInfo) {
  const imageUrl = {
    name: 'src',
    type: 'urlinput',
    filetype: 'image',
    label: 'Source'
  };
  const imageList = info.imageList.map((items) => ({
    name: 'images',
    type: 'selectbox',
    label: 'Image list',
    items
  }));
  const imageDescription = {
    name: 'alt',
    type: 'input',
    label: 'Image description'
  };
  const imageTitle = {
    name: 'title',
    type: 'input',
    label: 'Image title'
  };
  const imageDimensions = {
    name: 'dimensions',
    type: 'sizeinput'
  };
  // TODO: the original listbox supported styled items but bridge does not seem to support this
  const classList = info.classList.map((items) => ({
    name: 'classes',
    type: 'selectbox',
    label: 'Class',
    items
  }));
  const caption = {
    name: 'caption',
    type: 'checkbox',
    label: 'Show caption'
  };

  return Arr.flatten<any>([
    [imageUrl],
    imageList.toArray(),
    info.hasDescription ? [imageDescription] : [],
    info.hasImageTitle ? [imageTitle] : [],
    info.hasDimensions ? [imageDimensions] : [],
    [{
      type: 'grid',
      columns: 2,
      items: Arr.flatten([
        classList.toArray(),
        info.hasImageCaption ? [caption] : []
      ])
    }]
  ]);
};

const makeTab = function (info: ImageDialogInfo) {
  return {
    title: 'General',
    type: 'form',
    items: makeItems(info)
  };
};

export const MainTab = {
  makeTab,
  makeItems
};