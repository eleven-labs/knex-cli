'use strict';

const capitalize = text => !text ? '' : ''.concat(text.substr(0, 1).toUpperCase(), text.substr(1, text.length));

const pascalCase = word => word
    .split('_')
    .reduce((acc, subWord, index) => `${acc}${capitalize(subWord)}`, '');

module.exports = {
    capitalize,
    pascalCase
};