import React from 'react';
import favicon from '../assets/favicon.ico';
 
export function Head() {
  return <>
    <meta charset="utf-8" />
    <link rel="icon" href={favicon} />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Lofi beats playing on top of the SJO/MROC live atc"
    />
    <link rel="apple-touch-icon" href={favicon} />
    <meta property="og:image" content={favicon} />
    <link rel="manifest" href="/manifest.json" />
    <title>lofi coco tower</title>
  </>
}
