'use client';
import { useEffect } from 'react';

// The page is server-rendered HTML; this boots the imperative experience (three.js world, scroll rig) once.
export default function Boot() {
  useEffect(() => {
    const w = window as unknown as { __antumbraBooted?: boolean };
    if (w.__antumbraBooted) return;
    w.__antumbraBooted = true;
    import('../lib/main.js').then(m => m.boot());
  }, []);
  return null;
}
