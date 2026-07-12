import { describe, expect, it } from 'vitest';

import { designLabAnchorForInventoryId, designLabCatalogEntries } from './catalog-data';
import { designLabAuditGroups } from './audit-groups';

describe('Design Lab current inventory data', () => {
  it('keeps all Phase 2 stable IDs unique and partitioned by layer', () => {
    const ids = designLabCatalogEntries.map((entry) => entry.id);

    expect(ids).toHaveLength(40);
    expect(new Set(ids).size).toBe(40);
    expect(designLabCatalogEntries.filter((entry) => entry.layer === 'Foundation')).toHaveLength(
      23,
    );
    expect(designLabCatalogEntries.filter((entry) => entry.layer === 'Primitive')).toHaveLength(17);
  });

  it('derives deterministic anchors from inventory IDs', () => {
    expect(designLabAnchorForInventoryId('FND-THEME-PROVIDER')).toBe(
      'design-lab-fnd-theme-provider',
    );
    expect(designLabAnchorForInventoryId('PRM-C06')).toBe('design-lab-prm-c06');
  });

  it('places every current inventory item in exactly one Phase 3 comparison family', () => {
    const groupedIds = designLabAuditGroups.flatMap((group) => group.entryIds);
    const inventoryIds = designLabCatalogEntries.map((entry) => entry.id);

    expect(designLabAuditGroups).toHaveLength(10);
    expect(groupedIds).toHaveLength(40);
    expect(new Set(groupedIds).size).toBe(40);
    expect(new Set(groupedIds)).toEqual(new Set(inventoryIds));
  });
});
