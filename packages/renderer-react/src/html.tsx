import React from 'react';
import { IHtmlProps, IScript } from './types';

const RE_URL = /^(http:|https:)?\/\//;

function isUrl(str: string) {
  return (
    RE_URL.test(str) ||
    (str.startsWith('/') && !str.startsWith('/*')) ||
    str.startsWith('./') ||
    str.startsWith('../')
  );
}
const EnableJsScript = () => (
  <noscript
    dangerouslySetInnerHTML={{
      __html: `<b>Enable JavaScript to run this app.</b>`,
    }}
  />
);

const GlobalDataScript = (props: IHtmlProps) => {
  const { loaderData, htmlPageOpts, manifest } = props;
  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `window.__UMI_LOADER_DATA__ = ${JSON.stringify(
          loaderData || {},
        )}; window.__UMI_METADATA_LOADER_DATA__ = ${JSON.stringify(
          htmlPageOpts || {},
        )}; window.__UMI_BUILD_MANIFEST_DATA__ = ${
          JSON.stringify(manifest) || {}
        }`,
      }}
    />
  );
};
function normalizeScripts(script: IScript, extraProps = {}) {
  if (typeof script === 'string') {
    return isUrl(script)
      ? {
          src: script,
          ...extraProps,
        }
      : { content: script };
  } else if (typeof script === 'object') {
    return {
      ...script,
      ...extraProps,
    };
  } else {
    throw new Error(`Invalid script type: ${typeof script}`);
  }
}

function generatorStyle(style: string) {
  return isUrl(style)
    ? { type: 'link', href: style }
    : { type: 'style', content: style };
}

const HydrateMetadata = (props: IHtmlProps) => {
  const { htmlPageOpts } = props;
  return (
    <>
      {htmlPageOpts?.title && <title>{htmlPageOpts.title}</title>}
      {htmlPageOpts?.favicons?.map((favicon: string, key: number) => {
        return <link key={key} rel="shortcut icon" href={favicon} />;
      })}
      {htmlPageOpts?.description && (
        <meta name="description" content={htmlPageOpts.description} />
      )}
      {htmlPageOpts?.keywords?.length && (
        <meta name="keywords" content={htmlPageOpts.keywords.join(',')} />
      )}
      {htmlPageOpts?.metas?.map((em: any) => (
        <meta key={em.name} name={em.name} content={em.content} />
      ))}

      {htmlPageOpts?.links?.map((link: Record<string, string>, key: number) => {
        return <link key={key} {...link} />;
      })}
      {htmlPageOpts?.styles?.map((style: string, key: number) => {
        const { type, href, content } = generatorStyle(style);
        if (type === 'link') {
          return <link key={key} rel="stylesheet" href={href} />;
        } else if (type === 'style') {
          return <style key={key}>{content}</style>;
        }
      })}
      {htmlPageOpts?.headScripts?.map((script: IScript, key: number) => {
        const { content, ...rest } = normalizeScripts(script);
        return (
          <script
            dangerouslySetInnerHTML={{
              __html: content,
            }}
            key={key}
            {...(rest as any)}
          />
        );
      })}
    </>
  );
};

export function Html({
  children,
  loaderData,
  manifest,
  htmlPageOpts,
  renderFromRoot,
  __SPECIAL_HTML_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  mountElementId,
}: React.PropsWithChildren<IHtmlProps>) {
  // TODO: 处理 head 标签，比如 favicon.ico 的一致性
  // TODO: root 支持配置
  if (__SPECIAL_HTML_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
    return (
      <html>
        <head></head>
        <body>
          <EnableJsScript />
          <div id={mountElementId}>{children}</div>
          <GlobalDataScript
            manifest={manifest}
            loaderData={loaderData}
            htmlPageOpts={htmlPageOpts}
          />
        </body>
      </html>
    );
  }

  if (renderFromRoot) {
    return <>{children}</>;
  }

  const serverBuildManifest =
    typeof window === 'undefined'
      ? manifest
      : window.__UMI_BUILD_MANIFEST_DATA__;
  return (
    // FIXME: Resolve the hydrate warning for suppressHydrationWarning(3)
    <html suppressHydrationWarning lang={htmlPageOpts?.lang || 'en'}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {serverBuildManifest?.assets['umi.css'] && (
          <link
            suppressHydrationWarning
            rel="stylesheet"
            href={manifest?.assets['umi.css']}
          />
        )}
        <HydrateMetadata htmlPageOpts={htmlPageOpts} />
      </head>
      <body>
        <EnableJsScript />
        <div id={mountElementId}>{children}</div>
        <GlobalDataScript
          manifest={manifest}
          loaderData={loaderData}
          htmlPageOpts={htmlPageOpts}
        />

        {htmlPageOpts?.scripts?.map((script: IScript, key: number) => {
          const { content, ...rest } = normalizeScripts(script);
          return (
            <script
              dangerouslySetInnerHTML={{
                __html: content,
              }}
              key={key}
              {...(rest as any)}
            />
          );
        })}
      </body>
    </html>
  );
}
