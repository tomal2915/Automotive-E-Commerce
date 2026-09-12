// Given a list of attributes, each with an array of possible value IDs,
// generates every possible combination (the Cartesian product) — e.g.
// [Color: Red/Blue] x [Size: S/M] produces 4 combinations:
// Red-S, Red-M, Blue-S, Blue-M
export const generateVariantCombinations = (attributeSelections) => {
  // attributeSelections: [{ attributeId, attributeName, values: [{ valueId, valueLabel }] }]
  if (attributeSelections.length === 0) return [];

  return attributeSelections.reduce(
    (combinations, attr) => {
      const next = [];
      for (const combo of combinations) {
        for (const val of attr.values) {
          next.push([
            ...combo,
            {
              attribute: attr.attributeId,
              attributeName: attr.attributeName,
              value: val.valueId,
              valueLabel: val.valueLabel,
            },
          ]);
        }
      }
      return next;
    },
    [[]],
  );
};
