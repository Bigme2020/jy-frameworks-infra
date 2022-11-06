'use strict';

var React = require('react');

const Silly = () => {
    return React.createElement("div", null, "\"sillyMan\"");
};
const Smart = () => {
    return React.createElement("div", null, "\"smartMan\"");
};

exports.Silly = Silly;
exports.Smart = Smart;
