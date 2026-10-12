/* ============================================================
   ProMeat — components/icons.jsx
   Turns the string icon registry (assets/icons/registry.js) into
   React elements once, so the DOM stays identical: <svg> as the
   direct child of its span, no extra wrappers.
   ============================================================ */
import React from 'react';
import { I } from '../assets/icons/registry.js';

const cache = new Map();

const ATTR = {
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-dasharray': 'strokeDasharray',
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
  'class': 'className'
};

function attrsToProps(str) {
  const out = {};
  const re = /([a-zA-Z][\w-]*)="([^"]*)"/g;
  let m;
  while ((m = re.exec(str))) out[ATTR[m[1]] || m[1]] = m[2];
  return out;
}

function parse(html) {
  const open = /^<svg\s*([^>]*)>/.exec(html);
  if (!open) return null;
  const svgProps = attrsToProps(open[1]);
  const inner = html.slice(open[0].length, html.lastIndexOf('</svg>'));
  const children = [];
  const re = /<(path|circle|rect|ellipse|line|polyline|polygon|g|defs|linearGradient|stop)\b([^>]*?)\/>/g;
  let consumed = 0;
  let m;
  while ((m = re.exec(inner))) {
    if (m.index !== consumed) return null;         /* unexpected raw text — bail out */
    children.push(React.createElement(m[1], attrsToProps(m[2])));
    consumed = re.lastIndex;
  }
  if (inner.slice(consumed).replace(/<\/g>/g, '').trim() !== '') return null;
  /* children passed as varargs: a static child list, so React needs no keys */
  return React.createElement('svg', svgProps, ...children);
}

export function svg(name) {
  const src = I[name];
  if (!src) return null;
  if (!cache.has(src)) {
    let el = null;
    try { el = parse(src); } catch (e) { el = null; }
    if (!el) {
      /* safe fallback: keep raw markup, DOM is still an <svg> in a wrapper-free element */
      el = React.createElement('span', {
        className: 'icon-raw',
        dangerouslySetInnerHTML: { __html: src },
        'aria-hidden': 'true',
        focusable: 'false'
      });
    }
    cache.set(src, el);
  }
  return cache.get(src);
}
