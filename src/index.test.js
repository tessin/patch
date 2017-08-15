const patch = require("./index");

const EMPTY_ARRAY = [];

test("argument state must be object", () => {
  expect(() => patch.apply(1, {})).toThrow();
  expect(() => patch.apply("", {})).toThrow();
  expect(() => patch.apply(null, {})).toThrow();
});

test("argument patch must be object", () => {
  expect(() => patch.apply({}, 3)).toThrow();
  expect(() => patch.apply({}, "")).toThrow();
  expect(() => patch.apply({}, null)).toThrow();
});

test("set property #1", () => {
  const state = patch.apply({}, { a: 1 });
  expect(state.a).toBe(1);
});

test("set property noop #1", () => {
  const state = { a: 1 };
  const state2 = patch.apply(state, { a: 1 });
  expect(state2).toBe(state);
  expect(state2.a).toBe(state.a);
});

test("set property noop #2", () => {
  const state = { a: { b: 2 } };
  const state2 = patch.apply(state, { a: { b: 2 } });
  expect(state2).toBe(state);
  expect(state2.a).toBe(state.a);
  expect(state2.a.b).toBe(state.a.b);
});

test("set property multiple #1", () => {
  const state = patch.apply({}, { a: 1 }, { b: 2 });
  expect(state.a).toBe(1);
  expect(state.b).toBe(2);
});

test("set property multiple #2", () => {
  const state = patch.apply({}, { a: 1 }, { b: 2, c: 3 });
  expect(state.a).toBe(1);
  expect(state.b).toBe(2);
  expect(state.c).toBe(3);
});

test("set property multiple #3", () => {
  const state = patch.apply(
    {},
    { a: 1 },
    { b: 2, c: 3 },
    { d: { e: 4 } },
    { d: { f: 5 } }
  );
  expect(state.a).toBe(1);
  expect(state.b).toBe(2);
  expect(state.c).toBe(3);
  expect(state.d.e).toBe(4);
  expect(state.d.f).toBe(5);
});

test("set property #2", () => {
  const state = patch.apply({}, { a: EMPTY_ARRAY });
  expect(state.a).toBe(EMPTY_ARRAY);
});

test("set property #3", () => {
  const state = patch.apply({ a: 1 }, { b: 3 });
  expect(state.a).toBe(1);
  expect(state.b).toBe(3);
});

test("set property #4", () => {
  const state = patch.apply({}, { a: { b: 3 } });
  expect(state.a.b).toBe(3);
});

test("set property #5", () => {
  const state = patch.apply({ a: {} }, { a: { b: 5 } });
  expect(state.a.b).toBe(5);
});

test("set property #6", () => {
  const state = patch.apply({ a: {} }, { a: patch.set("b", 5) });
  expect(state.a.b).toBe(5);
});

test("set property expects 2 arguments", () => {
  expect(() => patch.set()).toThrow();
  expect(() => patch.set(1)).toThrow();
  expect(() => patch.set("k")).toThrow();
});

test("delete property", () => {
  const state = patch.apply({ a: { b: 3 } }, { a: patch.delete("b") });
  expect(state).toHaveProperty("a");
  expect(state.a).not.toHaveProperty("b");
});

test("add array element", () => {
  const state = patch.apply({}, { a: patch.add(1) });
  expect(state).toHaveProperty("a");
  expect(state.a).toEqual([1]);
});

test("add array element multiple", () => {
  const state = patch.apply({}, { a: patch.add(1) }, { a: patch.add(2) });
  expect(state).toHaveProperty("a");
  expect(state.a).toEqual([1, 2]);
});

test("cannot add array element to object", () => {
  expect(() => patch.apply({}, patch.add(1))).toThrow(
    "expected undefined or Array (actual object)"
  );
});

test("delete array element #1", () => {
  const state = patch.apply({ a: [1, 2, 3] }, { a: patch.delete(1) });
  expect(state.a).toEqual([2, 3]);
});

test("delete array element #2", () => {
  const state = patch.apply({ a: [1, 2, 3] }, { a: patch.delete(2) });
  expect(state.a).toEqual([1, 3]);
});

test("delete array element #3", () => {
  const state = patch.apply({ a: [1, 2, 3] }, { a: patch.delete(3) });
  expect(state.a).toEqual([1, 2]);
});

test("delete array element #4", () => {
  const state = patch.apply({ a: [1, 2, 3] }, { a: patch.delete(4) });
  expect(state.a).toEqual([1, 2, 3]);
});

test("set array element #1", () => {
  const state = patch.apply({ a: [1, 2, 3] }, { a: patch.set(2, 4) });
  expect(state.a).toEqual([1, 2, 4]);
});

test("set array element #2", () => {
  const state = patch.apply({ a: [1, 2, 3] }, { a: patch.set(3, 4) });
  expect(state.a).toEqual([1, 2, 3, 4]);
});

// ================

// Reference equality

test("set prop reference equality", () => {
  const a = { c: 1 };
  const b = patch.apply(a, { c: 1 });
  expect(a).toBe(a);
});

test("delete prop reference equality", () => {
  const a = {};
  const b = patch.apply(a, patch.delete("c"));
  expect(a).toBe(a);
});

test("set array element reference equality", () => {
  const a = { c: [1] };
  const b = patch.apply(a, { c: patch.set(0, 1) });
  expect(a).toBe(b);
  expect(a.c).toBe(b.c);
});

test("delete array element reference equality", () => {
  const a = { c: [] };
  const b = patch.apply(a, { c: patch.delete(0) });
  expect(a).toBe(b);
  expect(a.c).toBe(b.c);
});

// ================

// Navigation

test("nav set property", () => {
  const state = patch.apply({}, patch.in(["a", "b", "c"], { d: 4 }));
  expect(state.a.b.c.d).toBe(4);
});

test("nav set property (noop)", () => {
  const state = { a: { b: 1 } };
  const state2 = patch.apply(state, patch.in(["a"], { b: 1 }));
  expect(state2.a).toBe(state.a);
});

test("nav set array element", () => {
  const state = patch.apply({}, patch.in(["a", 0, "c"], { d: 4 }));
  expect(state.a).toHaveLength(1);
  expect(state.a[0].c.d).toBe(4);
});

// ================
