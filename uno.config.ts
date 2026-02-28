import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  theme: {
    colors: {
      bg: '#0b1020',
      panel: '#111a33',
      panel2: '#0f1730',
      text: '#e7ecff',
      muted: '#9aa7d1',
      brand: '#7c5cff',
      brand2: '#28d7ff',
      danger: '#ff4d6d',
    },
  },
  shortcuts: {
    btn:
      'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition ' +
      'bg-white/8 hover:bg-white/12 active:bg-white/16 text-text border border-white/10',
    'btn-primary':
      'btn bg-gradient-to-r from-brand to-brand2 text-black border-transparent hover:opacity-95',
    chip: 'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm bg-white/6 border border-white/10 text-muted',
    card: 'rounded-2xl bg-panel/70 border border-white/10 shadow-xl shadow-black/30 backdrop-blur',
    input:
      'w-full rounded-lg px-3 py-2 bg-white/6 border border-white/10 text-text outline-none focus:(border-brand/60 ring-2 ring-brand/20)',
  },
})
