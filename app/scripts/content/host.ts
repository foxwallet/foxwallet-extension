export type SiteInfo = {
  name: string;
  icon: string | null;
  origin: string;
};

export function getSiteInfo(): SiteInfo {
  return {
    origin: window.origin,
    name: getSiteName(window),
    icon: getSiteIcon(window),
  };
}

function getSiteName(windowObject: typeof window): string {
  const { document } = windowObject;

  const siteName: HTMLMetaElement | null = document.querySelector(
    'head > meta[property="og:site_name"]',
  );
  if (siteName) {
    return siteName.content;
  }

  const metaTitle: HTMLMetaElement | null = document.querySelector(
    'head > meta[name="title"]',
  );
  if (metaTitle) {
    return metaTitle.content;
  }

  if (document.title && document.title.length > 0) {
    return document.title;
  }

  return window.location.hostname;
}

function getSiteIcon(windowObject: typeof window): string | null {
  const { document } = windowObject;

  const icons: NodeListOf<HTMLLinkElement> = document.querySelectorAll(
    'head > link[rel~="icon"]',
  );

  for (const icon of icons) {
    if (icon && icon.href) {
      return icon.href;
    }
  }

  return null;
}
