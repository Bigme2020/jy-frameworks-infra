'use strict';

const vueComponents = require('..');
const assert = require('assert').strict;

assert.strictEqual(vueComponents(), 'Hello from vueComponents');
console.info("vueComponents tests passed");
