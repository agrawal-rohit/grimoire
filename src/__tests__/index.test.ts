import data from "../index";

describe("Template Test", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });

  it("should return empty object", () => {
    expect(data).toEqual({});
  });
});
