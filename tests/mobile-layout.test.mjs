import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import postcss from "postcss";

const stylesheet = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const root = postcss.parse(stylesheet);

function declarationAtWidth(selector, property, width) {
  let value;

  root.walkRules((rule) => {
    let applies = true;
    let parent = rule.parent;

    while (parent) {
      if (parent.type === "atrule" && parent.name === "media") {
        const maxWidth = parent.params.match(/max-width:\s*(\d+)px/);
        if (maxWidth && width > Number(maxWidth[1])) applies = false;
      }
      parent = parent.parent;
    }

    if (!applies || !rule.selectors?.includes(selector)) return;
    rule.walkDecls(property, (declaration) => {
      value = declaration.value;
    });
  });

  return value;
}

test("the 512px hero resolves to one readable column", () => {
  assert.equal(declarationAtWidth(".hero", "grid-template-columns", 512), "1fr");
});

test("the narrow gallery resolves to one full-width card per row", () => {
  assert.equal(declarationAtWidth(".gallery-grid", "grid-template-columns", 390), "1fr");
  assert.equal(declarationAtWidth(".gallery-card", "grid-column", 390), "auto");
});
