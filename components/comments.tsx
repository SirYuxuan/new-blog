'use client'

import Giscus from '@giscus/react';
import { useTheme } from 'next-themes';

export function Comments() {
  const { theme } = useTheme();
  
  return (
    <Giscus
      id="comments"
      repo="Lily-404/blog"
      repoId="R_kgDOOUg36g"
      category="Announcements"
      categoryId="DIC_kwDOOUg36s4CpCnB"
      mapping="pathname"
      strict="0"
      reactionsEnabled="0"
      emitMetadata="0"
      inputPosition="top"
      theme={theme === 'dark' ? 'transparent_dark' : 'transparent_light'}
      lang="zh-CN"
      loading="lazy"
    />
  );
}
