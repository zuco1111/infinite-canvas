# 设计系统新旧关系追踪

状态：追踪规则已于 2026-07-11 获用户确认；阶段 1 已完成。目标 Token/组件尚未批准，因此当前不填写推断性目标映射；首页视觉冻结例外已经批准并登记。

建立日期：2026-07-11

## 1. 目的

本文件负责回答四个问题：

1. 每个新 Token、组件、Pattern 或领域 wrapper 来源于哪些旧实现？
2. 每个旧 Token、组件和生产调用点最终应迁移到哪里？
3. 哪些调用点已经迁移、仍然保留或属于用户批准的例外？
4. 某次替换属于哪个批次，使用什么证据验证，如何按批次回退？

后续迁移只能依据本文件中已经获得用户批准的关系执行。名称相同、视觉相似或底层库相同都不能单独构成替换依据。

## 2. 身份与定位规则

- 旧设计项主键使用 `INVENTORY.md` 中的稳定 ID，例如 Foundation、Primitive、Pattern、Feature Component、Domain Token、Content Effect 和例外 ID。
- 目标设计项在用户批准目标方案时获得独立稳定 ID；不得复用旧 ID 冒充等值关系。
- 生产调用点使用“旧库存 ID + feature + 文件 + 所属符号/组件 + 调用特征”定位。
- `source:line` 只用于快速跳转，不作为身份；代码移动后更新当前定位，同时保留历史迁移记录。
- 一条关系使用独立关系 ID，不能通过覆盖旧记录改变历史含义。

## 3. 三层追踪模型

### 3.1 设计项映射

记录旧库存 ID 与目标 ID 的关系。允许的关系类型为：

| 关系           | 含义                                                         |
| -------------- | ------------------------------------------------------------ |
| retain         | 保留旧设计项身份，仅按获批规格演进                           |
| merge          | 多个旧设计项合并到一个目标设计项                             |
| split          | 一个旧设计项按明确语义拆分到多个目标设计项                   |
| variant        | 旧实现映射为目标组件的明确 variant/size/state                |
| domain-wrapper | 旧实现由领域 wrapper 保留业务语义，底层消费 canonical 设计项 |
| exception      | 不迁移到 canonical 项，按用户批准的例外继续保留              |
| retire         | 旧项无保留价值且全部消费者归零后退役                         |

目标尚未批准时，关系保持 `pending`，不得自行选择最相似的目标。

### 3.2 调用点台账

每个生产调用点至少记录：

- 旧库存 ID、feature、路由、文件、所属符号/组件和当前定位。
- 当前 API、variant、Token 值或硬编码值。
- 目标 ID、目标 API/variant/语义 Token，或者批准的例外 ID。
- 所属迁移批次、迁移状态、验证状态和回退单位。

### 3.3 迁移批次

迁移批次连接已批准决策和实际调用点。批次完成前必须满足：

```text
旧调用总数 = 已迁移调用数 + 剩余调用数 + 已批准例外数
```

一个调用点只能归属一个最终目标或例外，不允许重复计数。批次验收后仍保留来源关系，不能因为旧实现退役而删除历史记录。

## 4. 双向索引

正式目标出现后，本文件同时维护两个视图：

### 4.1 旧实现 → 目标设计项

| 关系 ID            | 旧库存 ID                                      | 旧实现/调用范围                                                   | 目标 ID               | 关系                  | 决策状态             | 迁移批次                       | 已迁移/剩余/例外 | 验证                      |
| ------------------ | ---------------------------------------------- | ----------------------------------------------------------------- | --------------------- | --------------------- | -------------------- | ------------------------------ | ---------------- | ------------------------- |
| REL-HOME-FREEZE-01 | FC-HOME-01、FX-HOME-AURORA                     | `/` 首页全部非导航调用点                                          | EX-HOME-VISUAL-FREEZE | exception             | approved，2026-07-11 | 不迁移                         | 0 / 全部 / 全部  | HOMEPAGE_VISUAL_FREEZE.md |
| REL-HOME-FREEZE-02 | 首页消费的 Foundation/Primitive/第三方视觉实现 | `HomePage.tsx` 非导航调用点；按 CURRENT_*.json 与后续目标逐项展开 | EX-HOME-VISUAL-FREEZE | exception at callsite | approved，2026-07-11 | 随对应目标批次验证，不改变输出 | 0 / 全部 / 全部  | 全主题/视口/运行形态回归  |
| —                  | 其他库存项                                     | 当前没有获批目标，不建立推断映射                                  | —                     | —                     | pending              | —                              | —                | —                         |

### 4.2 目标设计项 → 旧实现

| 目标 ID               | 目标名称/API                | 来源关系 ID                            | 来源旧库存 ID                                    | 覆盖调用数       | 批次             | 验证状态               |
| --------------------- | --------------------------- | -------------------------------------- | ------------------------------------------------ | ---------------- | ---------------- | ---------------------- |
| EX-HOME-VISUAL-FREEZE | 首页非导航视觉冻结例外      | REL-HOME-FREEZE-01、REL-HOME-FREEZE-02 | FC-HOME-01、FX-HOME-AURORA、首页消费的共享设计项 | 全部非导航调用点 | 不迁移或等值兼容 | approved；后续逐批回归 |
| —                     | 当前没有获批目标 Token/组件 | —                                      | 其他库存项                                       | —                | —                | pending                |

以上两个视图必须表达同一组关系；一侧变化时同步更新另一侧。后续可以用结构化文件和检查脚本生成视图，但本文件必须保留人类可读的结论与异常说明。

## 5. 分阶段维护责任

| 阶段   | 必须补充的关系                                                    |
| ------ | ----------------------------------------------------------------- |
| 阶段 1 | 建立旧库存稳定 ID、调用位置事实源和本追踪规则                     |
| 阶段 2 | 当前态 Design Lab 锚点关联旧库存 ID，不产生目标替换关系           |
| 阶段 3 | 每个获批目标 Token 关联全部旧 Token、CSS variable、裸值和消费位置 |
| 阶段 4 | 每个获批 Primitive/variant 关联旧 Primitive 及试点调用点          |
| 阶段 5 | 每个获批 Pattern、高级组件和领域 wrapper 关联旧组合及试点调用点   |
| 阶段 6 | 按 feature 完成全部生产调用点迁移台账和批次对账                   |
| 阶段 7 | 验证零 pending、零重复归属、数量守恒、旧消费者归零或已有批准例外  |

## 6. 当前可追踪基础

- `INVENTORY.md` 已为旧 Foundations、Primitives、Patterns、Feature Components、Domain Token、Content Effect 和例外提供稳定 ID。
- `CURRENT_COLORS.json`、`CURRENT_CLASSES.json`、`CURRENT_LAYOUT_VALUES.json`、`CURRENT_VISUAL_VALUES.json` 提供逐值次数和源码位置。
- `INVENTORY.md` 第 15 节提供全部 70 个生产 TSX 的库存映射。
- `baselines/current/` 提供修改前的视觉证据。

当前没有目标 Token 或目标组件获得批准，因此其他库存项没有可以诚实填写的目标 ID。该空缺是正确的 `pending` 状态，不是库存遗漏。`EX-HOME-VISUAL-FREEZE` 是已批准的迁移例外，不是目标视觉方案。

### 6.1 阶段 2 当前态 Design Lab 锚点

阶段 2 只建立旧库存 ID 到当前态展示锚点的关系，不产生目标 ID、retain/merge/split/variant 或迁移批次：

| 当前库存层级 | 稳定 ID 数 | Design Lab 锚点                  | 状态                            |
| ------------ | ---------: | -------------------------------- | ------------------------------- |
| Foundations  |         23 | `#design-lab-<fnd-id-lowercase>` | approved，阶段 2 展示覆盖已验收 |
| Primitives   |         17 | `#design-lab-<prm-id-lowercase>` | approved，阶段 2 展示覆盖已验收 |

40 个具体 ID 与元数据登记在 `src/design-lab/catalog/catalog-data.ts`，Playwright 使用完整 ID 数组验证唯一性、顺序、搜索、筛选和锚点跳转。例如：

```text
FND-THEME-PROVIDER → #design-lab-fnd-theme-provider
PRM-C01           → #design-lab-prm-c01
PRM-C06           → #design-lab-prm-c06
PRM-C17           → #design-lab-prm-c17
```

`FND-THEME-PROVIDER` 的当前实现位置已因等值 Provider 提取更新为 `src/app/providers/app-visual-providers.tsx` 与 `src/app/providers/app-providers.tsx`；阶段 1 的原始 `App.tsx` 定位继续作为历史来源保留。详细证据见 `docs/design-system/PHASE_2_DESIGN_LAB.md`。

### 6.2 阶段 3 现有样式对比组

阶段 3 的只读审计把 40 个旧库存 ID 完整且唯一地放入 10 个对比组。分组机器事实源为 `src/design-lab/catalog/audit-groups.ts`，用途仅是把相似内容并置以便用户判断。

对比组不是设计项映射，不生成目标 ID，也不表示 retain、merge、split、variant、domain-wrapper、exception 或 retire。只有用户逐项批准目标后，才能按本文件第 3～5 节建立正式双向关系。

## 7. 迁移守门条件

任何生产替换开始前，必须同时满足：

- 旧库存 ID、目标 ID 和关系类型已经记录。
- 目标规格已经获得用户明确批准。
- 受影响调用点和迁移批次已经列全。
- merge/split/variant/domain-wrapper 的语义和 API 映射明确。
- 验证范围、截图锚点和回退单位明确。
- 任何可能影响首页的全局 Token 或共享组件变更，都已证明首页非导航输出等值，或为首页调用点登记到 `EX-HOME-VISUAL-FREEZE`。

任一条件缺失时暂停对应替换并向用户确认，不能通过全仓搜索替换、组件名称猜测或视觉相似度补全关系。

## 8. 用户确认边界

用户确认本追踪规则，只表示同意后续必须建立并维护新旧关系；不表示已经批准任何具体目标 Token、组件、合并、拆分、废弃或页面替换。

已确认例外：用户于 2026-07-11 批准 `EX-HOME-VISUAL-FREEZE`，冻结 `/` 首页非导航内容；公共导航仍按正常组件审批流程处理。
