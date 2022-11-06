import React from 'react';

const Silly = () => {
    return React.createElement("div", null, "\"sillyMan\"");
};
const Smart = () => {
    return React.createElement("div", null, "\"smartMan\"");
};

export { Silly, Smart };
