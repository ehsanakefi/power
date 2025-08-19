'use client';

import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import { theme } from './theme';

// Create RTL cache for Persian/Arabic support
const createRtlCache = () => {
  return createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
  });
};

const createLtrCache = () => {
  return createCache({
    key: 'css',
  });
};

interface ThemeRegistryProps {
  children: React.ReactNode;
  options?: {
    enableRtl?: boolean;
  };
}

export default function ThemeRegistry({
  children,
  options = { enableRtl: true }
}: ThemeRegistryProps) {
  const [{ cache, flush }] = React.useState(() => {
    const cache = options.enableRtl ? createRtlCache() : createLtrCache();
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) {
      return null;
    }
    let styles = '';
    for (const name of names) {
      styles += cache.inserted[name];
    }
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{
          __html: styles,
        }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
