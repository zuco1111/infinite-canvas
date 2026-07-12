import type { DesignLabCatalogEntry } from './catalog-data';

export type DesignLabAuditGroup = {
  id: string;
  title: string;
  description: string;
  reviewPrompt: string;
  entryIds: string[];
};

export const designLabAuditGroups: DesignLabAuditGroup[] = [
  {
    id: 'foundation-color-sources',
    title: '主题与颜色来源',
    description:
      '把 App、CSS、Canvas、Ant、裸色值与遗留别名放在同一组，观察同一颜色语义由多少事实源共同维护。',
    reviewPrompt: '判断哪些差异有明确语义，哪些只是来源重复；本分组不预设合并关系。',
    entryIds: [
      'FND-THEME-PROVIDER',
      'FND-COLOR-APP-TS',
      'FND-COLOR-CSS',
      'FND-COLOR-CANVAS',
      'FND-COLOR-CANVAS-LEGACY',
      'FND-ANT-GLOBAL',
      'FND-ANT-TABLE-UNUSED',
      'FND-ANT-CANVAS-LOCAL',
      'FND-COLOR-HARDCODED',
      'FND-COLOR-UTILITY-RAW',
    ],
  },
  {
    id: 'foundation-type-icons',
    title: '排版与图标尺度',
    description: '并置文字与图标的现有尺寸路径，比较视觉密度、对齐和跨平台依赖。',
    reviewPrompt: '判断是否需要共享尺度，以及字体与图标例外需要保留到什么边界。',
    entryIds: ['FND-TYPOGRAPHY', 'FND-ICON-SIZE'],
  },
  {
    id: 'foundation-layout-scale',
    title: '间距、尺寸与响应式尺度',
    description: '集中查看布局节奏、控件尺寸和断点，避免在分散页面中逐个猜测尺度关系。',
    reviewPrompt: '判断高频值能否形成稳定尺度，同时保留真正由容器或运行时几何决定的值。',
    entryIds: ['FND-SPACING', 'FND-SIZE', 'FND-BREAKPOINT'],
  },
  {
    id: 'foundation-shape-surface',
    title: '形状与表面层次',
    description: '将圆角、描边、焦点、阴影、透明度和模糊并置，比较卡片与浮层的整体表面语言。',
    reviewPrompt: '判断哪些组合表达稳定层级，哪些只是局部装饰或内容可读性效果。',
    entryIds: ['FND-RADIUS', 'FND-BORDER', 'FND-SHADOW', 'FND-OPACITY-BLUR'],
  },
  {
    id: 'foundation-depth-motion',
    title: '层级与动效',
    description: '集中查看 z-index、Portal 层级和时间曲线，比较状态变化如何被用户感知。',
    reviewPrompt: '判断层级与动效是否需要统一契约；系统 reduced-motion 与评审冻结工具继续分开。',
    entryIds: ['FND-LAYER', 'FND-MOTION'],
  },
  {
    id: 'foundation-local-exceptions',
    title: '局部写法与动态例外',
    description:
      '把 arbitrary/important utility 与 inline style 放在一起，区分可收敛的静态值和必须保留的动态几何。',
    reviewPrompt: '逐项判断收敛、领域别名或例外，不把所有局部值机械 Token 化。',
    entryIds: ['FND-TAILWIND-ARBITRARY', 'FND-INLINE-STYLE'],
  },
  {
    id: 'primitive-actions-navigation',
    title: '操作与导航入口',
    description: '并置按钮、图标按钮与文本链接，比较强调层级、尺寸、焦点和路由入口语义。',
    reviewPrompt: '外观相近不等于交互契约相同；重点判断共享 primitive 与导航语义边界。',
    entryIds: ['PRM-C01', 'PRM-C02'],
  },
  {
    id: 'primitive-entry-pickers',
    title: '文本、数值与文件输入',
    description:
      '把输入、搜索、密码、多行、数值、选择器和上传入口并置，比较表单控件的高度、边框和状态。',
    reviewPrompt: '判断共同的 Field/Control 规格与各输入类型必须保留的行为差异。',
    entryIds: ['PRM-C03', 'PRM-C04', 'PRM-C05', 'PRM-C06', 'PRM-C17'],
  },
  {
    id: 'primitive-selection',
    title: '选择与范围控制',
    description:
      '并置 Checkbox、Switch、Segmented、Slider 与当前缺失的 Radio，比较选择模型和反馈方式。',
    reviewPrompt: '判断单选、多选、布尔和连续值是否具有清晰且一致的状态与无障碍契约。',
    entryIds: ['PRM-C07', 'PRM-C08', 'PRM-C09', 'PRM-C10', 'PRM-C15'],
  },
  {
    id: 'primitive-feedback-structure',
    title: '状态、反馈与结构辅助',
    description: '把标签、浮层提示、Disclosure、进度和分隔线放在一起，比较信息层级与辅助反馈。',
    reviewPrompt: '判断哪些是 primitive，哪些应留在后续 Pattern；同时记录当前可访问名称缺口。',
    entryIds: ['PRM-C11', 'PRM-C12', 'PRM-C13', 'PRM-C14', 'PRM-C16'],
  },
];

const groupByEntryId = new Map(
  designLabAuditGroups.flatMap((group) =>
    group.entryIds.map((entryId) => [entryId, group] as const),
  ),
);

export function designLabAuditGroupForEntry(entry: DesignLabCatalogEntry) {
  return groupByEntryId.get(entry.id);
}
