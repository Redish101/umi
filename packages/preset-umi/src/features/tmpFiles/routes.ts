import { addParentRoute, getConventionRoutes } from '@umijs/core';
import { winPath } from '@umijs/utils';
import { existsSync } from 'fs';
import { isAbsolute, join } from 'path';
import { IApi } from '../../types';

// get route config
export async function getRoutes(opts: { api: IApi }) {
  let routes = null;
  if (opts.api.config.routes) {
    // TODO: support config routes
  } else {
    routes = getConventionRoutes({ base: opts.api.paths.absPagesPath });
  }

  const absLayoutPath = join(opts.api.paths.absSrcPath, 'layouts/index.tsx');
  const layouts = await opts.api.applyPlugins({
    key: 'addLayouts',
    initialValue: [
      existsSync(absLayoutPath) && {
        id: '@@/global-layout',
        file: absLayoutPath,
      },
    ].filter(Boolean),
  });
  for (const layout of layouts) {
    addParentRoute({
      addToAll: true,
      target: {
        id: layout.id,
        path: '/',
        file: layout.file,
        parentId: undefined,
      },
      routes,
    });
  }
  return routes;
}

export async function getRouteComponents(opts: {
  routes: Record<string, any>;
  prefix: string;
}) {
  const imports = Object.keys(opts.routes)
    .map((key) => {
      const route = opts.routes[key];
      // TODO: support alias
      const path = isAbsolute(route.file)
        ? route.file
        : `${opts.prefix}${route.file}`;
      return `'${key}': () => import('${winPath(path)}'),`;
    })
    .join('\n');
  return `{\n${imports}\n}`;
}
