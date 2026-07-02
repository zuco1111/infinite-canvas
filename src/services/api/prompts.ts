import { publicAssetPath } from '@/lib/public-assets';

export type Prompt = {
  id: string;
  title: string;
  coverUrl: string;
  prompt: string;
  tags: string[];
  category: string;
  githubUrl: string;
  preview: string;
  createdAt: string;
  updatedAt: string;
};

export const ALL_PROMPTS_OPTION = '全部';

export type PromptListResponse = {
  items: Prompt[];
  tags: string[];
  categories: string[];
  total: number;
};

let memoryCache: Prompt[] | null = null;
let loadingPrompts: Promise<Prompt[]> | null = null;

export async function fetchPrompts({
  keyword = '',
  tag = [],
  category = ALL_PROMPTS_OPTION,
  page,
  pageSize,
}: {
  keyword?: string;
  tag?: string[];
  category?: string;
  page?: number;
  pageSize?: number;
} = {}): Promise<PromptListResponse> {
  const normalizedKeyword = keyword.trim().toLowerCase();
  const normalizedCategory = category || '';
  const normalizedTags = tag.filter(Boolean);
  const items = await getPrompts();
  const withoutTagFilter = filterPrompts(items, {
    keyword: normalizedKeyword,
    category: normalizedCategory,
    tags: [],
  });
  const filtered = filterPrompts(items, {
    keyword: normalizedKeyword,
    category: normalizedCategory,
    tags: normalizedTags,
  });
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.max(1, Math.min(100, Number(pageSize) || 20));

  return {
    items: filtered.slice((safePage - 1) * safePageSize, safePage * safePageSize),
    tags: collectTags(withoutTagFilter),
    categories: collectCategories(items),
    total: filtered.length,
  };
}

export function formatPromptDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date);
}

async function getPrompts() {
  if (memoryCache) return memoryCache;
  if (loadingPrompts) return loadingPrompts;
  loadingPrompts = fetch(publicAssetPath('/data/local-prompts.json'))
    .then((response) => {
      if (!response.ok) throw new Error('本地提示词库读取失败');
      return response.json() as Promise<Prompt[]>;
    })
    .then((items) => items.filter((item) => item.title.trim() && item.prompt.trim()))
    .then((items) => {
      memoryCache = items;
      return items;
    })
    .finally(() => {
      loadingPrompts = null;
    });
  return loadingPrompts;
}

function filterPrompts(
  items: Prompt[],
  options: { keyword: string; category: string; tags: string[] },
) {
  return items.filter((item) => {
    if (isActiveOption(options.category) && item.category !== options.category) return false;
    if (options.tags.length && !options.tags.some((promptTag) => item.tags.includes(promptTag))) {
      return false;
    }
    if (!options.keyword) return true;
    return [item.title, item.prompt, item.category, ...item.tags]
      .join(' ')
      .toLowerCase()
      .includes(options.keyword);
  });
}

function collectTags(items: Prompt[]) {
  return Array.from(new Set(items.flatMap((item) => item.tags))).sort((a, b) =>
    a.localeCompare(b, 'zh-CN'),
  );
}

function collectCategories(items: Prompt[]) {
  return Array.from(new Set(items.map((item) => item.category))).sort((a, b) =>
    a.localeCompare(b, 'zh-CN'),
  );
}

function isActiveOption(value: string) {
  return value && value !== ALL_PROMPTS_OPTION;
}
