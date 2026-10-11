import { describe, it, expect } from "vitest";
import { magicOk } from "../file-check";
import { rateLimited } from "../rate-limit";

const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32)]);
const jpg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(32)]);

describe("upload file checks", () => {
  it("accepts a real PNG and JPG", () => {
    expect(magicOk("png", png)).toBe(true);
    expect(magicOk("jpg", jpg)).toBe(true);
  });
  it("refuses a text file renamed to .png", () => {
    expect(magicOk("png", Buffer.from("hello, not a picture"))).toBe(false);
  });
  it("refuses an SVG that carries a script", () => {
    const evil = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    expect(magicOk("svg", evil)).toBe(false);
  });
  it("refuses an SVG with an inline event handler", () => {
    const evil = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>');
    expect(magicOk("svg", evil)).toBe(false);
  });
  it("accepts a clean SVG", () => {
    expect(magicOk("svg", Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/></svg>'))).toBe(true);
  });
  it("refuses unknown extensions", () => {
    expect(magicOk("exe", png)).toBe(false);
  });
});

describe("rate limit", () => {
  it("allows up to the limit, then blocks", () => {
    const key = "test:" + Math.random();
    for (let i = 0; i < 3; i++) expect(rateLimited(key, 3, 60000)).toBe(false);
    expect(rateLimited(key, 3, 60000)).toBe(true);
  });
  it("keeps separate buckets per key", () => {
    const a = "a:" + Math.random();
    const b = "b:" + Math.random();
    for (let i = 0; i < 2; i++) rateLimited(a, 2, 60000);
    expect(rateLimited(a, 2, 60000)).toBe(true);
    expect(rateLimited(b, 2, 60000)).toBe(false);
  });
});
