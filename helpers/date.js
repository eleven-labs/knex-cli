'use strict';

const padDate = (segment) => {
    segment = segment.toString();
    return segment[1] ? segment : '0' + segment;
}

const currentDateToFlat = () => {
    var d = new Date();
    return d.getFullYear().toString() + padDate(d.getMonth() + 1) + padDate(d.getDate()) + padDate(d.getHours()) + padDate(d.getMinutes()) + padDate(d.getSeconds());
}

module.exports = {
    currentDateToFlat
};