import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import path from 'node:path'

import devConfig from './dev'
import prodConfig from './prod'

export default defineConfig<'webpack5'>(async (merge, { command, mode }) => {
  const baseConfig: UserConfigExport<'webpack5'> = {
    projectName: 'practice-ai',
    date: '2026-09-01',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    framework: 'react',
    compiler: 'webpack5',
    alias: {
      '@': path.resolve(__dirname, '..', 'src')
    },
    cache: { enable: false },
    mini: {
      postcss: {
        pxtransform: { enable: true },
        url: { enable: true, config: { limit: 1024 } },
        cssModules: { enable: false }
      }
    }
  }

  if (process.env.NODE_ENV === 'development') {
    return merge({}, baseConfig, devConfig)
  }
  return merge({}, baseConfig, prodConfig)
})
