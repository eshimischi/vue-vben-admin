import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { fs } from '@vben/node-utils';
import { type PluginOption } from 'vite';

/**
 * 用于生成将loading样式注入到项目中
 * 为多app提供loading样式，无需在每个 app -> index.html单独引入
 */
async function viteInjectAppLoadingPlugin(
  isBuild: string,
  env: Record<string, any>,
): Promise<PluginOption | undefined> {
  const loadingHtml = await getLoadingRawByHtmlTemplate();
  const envRaw = isBuild ? 'prod' : 'dev';
  const cacheName = `'${env.VITE_APP_NAMESPACE}-${envRaw}-preferences-theme'`;

  // 获取缓存的主题
  // 保证黑暗主题下，刷新页面时，loading也是黑暗主题
  const injectScript = `
  <script data-app-loading="inject-js">
  var theme = localStorage.getItem(${cacheName});
  document.documentElement.classList.toggle('dark', /dark/.test(theme));
</script>
`;

  if (!loadingHtml) {
    return;
  }

  return {
    enforce: 'pre',
    name: 'vite:inject-app-loading',
    transformIndexHtml: {
      handler(html) {
        const re = /<body\s*>/;
        html = html.replace(re, `<body>${injectScript}${loadingHtml}`);
        return html;
      },
      order: 'pre',
    },
  };
}

/**
 * 用于获取loading的html模板
 */
async function getLoadingRawByHtmlTemplate() {
  const __dirname = fileURLToPath(new URL('.', import.meta.url));
  const loadingPath = join(__dirname, './loading.html');
  if (!fs.existsSync(loadingPath)) {
    return;
  }

  const htmlRaw = await fs.readFile(loadingPath, 'utf8');
  return htmlRaw;
}

export { viteInjectAppLoadingPlugin };
