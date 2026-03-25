/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MODE: 'demo' | 'test'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
