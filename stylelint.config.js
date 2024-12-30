import sortOrderSmacss from 'stylelint-config-property-sort-order-smacss/generate';

export const plugins = ['stylelint-order'];
export const rules = {
  'order/properties-order': [
    sortOrderSmacss()
  ],
};