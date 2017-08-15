"use strict";

function Context() {
  this._mutable = new Set();
}

Context.prototype.asMutable = function(obj) {
  if (obj && this._mutable.has(obj)) {
    return obj;
  }
  // note: obj can be null
  const obj3 = Object.assign({}, obj); // babel will fix this for IE11...
  this._mutable.add(obj3);
  return obj3;
};

Context.prototype.asMutableArray = function(arr) {
  if (arr && this._mutable.has(arr)) {
    return arr;
  }
  const arr2 = arr ? arr.slice() : [];
  this._mutable.add(arr2);
  return arr2;
};

function _apply3(state, patch, context) {
  switch (typeof patch) {
    case "object":
      if (Array.isArray(patch)) {
        return patch; // Array value
      }
      // merge
      let state2 = state;
      if (state2) {
        console.assert(typeof state === "object");
        for (const k in patch) {
          // note: object keys only support the type of string
          const a = state[k];
          const b = _apply3(a, patch[k], context);
          if (a !== b) {
            if (state2 === state) {
              state2 = context.asMutable(state);
            }
            state2[k] = b;
          }
        }
      } else {
        // fast merge
        state2 = context.asMutable(null);
        for (const k in patch) {
          const b = _apply3(undefined, patch[k], context);
          state2[k] = b;
        }
      }
      return state2;
    case "function":
      return patch(state, context);
  }
  return patch; // value
}

function apply(state) {
  if (!(state && typeof state === "object"))
    throw new TypeError(`state must be object`);
  const context = new Context();
  for (let i = 1; i < arguments.length; i++) {
    const patch = arguments[i];
    if (!(patch && (typeof patch === "object" || typeof patch === "function")))
      throw new TypeError(`patch must be object or function`);
    state = _apply3(state, patch, context);
  }
  return state;
}

function add(value) {
  if (arguments.length !== 1) {
    throw new RangeError("patch.add expects 1 argument");
  }
  return (state, context) => {
    if (!(typeof state === "undefined" || Array.isArray(state)))
      throw TypeError(`expected undefined or Array (actual ${typeof state})`);
    const state2 = context.asMutableArray(state);
    state2.push(value);
    return state2;
  };
}

function _delete(key) {
  if (arguments.length !== 1) {
    throw new RangeError("patch.delete expects 1 argument");
  }
  return (state, context) => {
    if (Array.isArray(state)) {
      const i = state.indexOf(key);
      if (i !== -1) {
        return state.slice(0, i).concat(state.slice(i + 1));
      }
    } else {
      if (typeof state[key] !== "undefined") {
        const state2 = context.asMutable(state);
        delete state2[key];
        return state2;
      }
    }
    return state;
  };
}

function set(k, v) {
  if (arguments.length !== 2) {
    throw new RangeError("patch.set expects 2 arguments");
  }
  console.assert(typeof k === "string" || typeof k === "number");
  return (state, context) => {
    if (state[k] !== v) {
      let state2;
      if (typeof k === "string") {
        state2 = context.asMutable(state);
      } else {
        state2 = context.asMutableArray(state);
      }
      state2[k] = v;
      return state2;
    }
    return state;
  };
}

function _in5(state, path, index, patch, context) {
  if (index < path.length) {
    const k = path[index];
    console.assert(typeof k === "string" || typeof k === "number");
    const a = state ? state[k] : undefined;
    const b = _in5(a, path, index + 1, patch, context);
    if (a !== b) {
      let state2;
      if (typeof k === "string") {
        state2 = context.asMutable(state);
      } else {
        state2 = context.asMutableArray(state);
      }
      state2[k] = b;
      return state2;
    }
    return state;
  }
  return _apply3(state, patch, context);
}

function _in(path, patch) {
  if (!Array.isArray(path)) throw new TypeError("path should be Array");
  return (state, context) => {
    return _in5(state, path, 0, patch, context);
  };
}

module.exports = {
  ["apply"]: apply,
  ["add"]: add,
  ["delete"]: _delete,
  ["set"]: set,
  ["in"]: _in
};
