import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { useEffect, useMemo, useRef, useState } from 'react'

type Track = {
  id: string
  title: string
  artist: string
  url: string
  cover?: string
  duration?: number
}

const DEFAULT_TRACKS: Track[] = [
  {
    id: 'sample-1',
    title: 'Sample Track 1',
    artist: 'PotatoHeadAI',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 'sample-2',
    title: 'Sample Track 2',
    artist: 'PotatoHeadAI',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
]

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n))
}

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function icon(cls: string) {
  return <span className={cls} aria-hidden="true" />
}

export default function App() {
  const [tracks, setTracks] = useState<Track[]>(() => {
    try {
      const raw = localStorage.getItem('mp_tracks')
      if (raw) return JSON.parse(raw)
    } catch {}
    return DEFAULT_TRACKS
  })
  const [currentId, setCurrentId] = useState<string>(() => {
    return tracks[0]?.id ?? ''
  })
  const current = useMemo(() => tracks.find((t) => t.id === currentId) ?? tracks[0], [tracks, currentId])

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState<number>(() => {
    const v = Number(localStorage.getItem('mp_volume'))
    return Number.isFinite(v) ? clamp(v, 0, 1) : 0.8
  })
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [openAdd, setOpenAdd] = useState(false)

  // persist playlist
  useEffect(() => {
    localStorage.setItem('mp_tracks', JSON.stringify(tracks))
  }, [tracks])

  useEffect(() => {
    localStorage.setItem('mp_volume', String(volume))
  }, [volume])

  // load current track
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !current) return

    audio.src = current.url
    audio.load()
    setCurrentTime(0)
    setDuration(0)

    if (isPlaying) {
      audio
        .play()
        .then(() => {})
        .catch(() => setIsPlaying(false))
    }
  }, [currentId])

  // wire audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = isMuted ? 0 : volume

    const onTime = () => setCurrentTime(audio.currentTime || 0)
    const onLoaded = () => setDuration(audio.duration || 0)
    const onEnded = () => {
      setIsPlaying(false)
      next()
    }

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('ended', onEnded)
    }
  }, [volume, isMuted, tracks, currentId, isPlaying])

  async function togglePlay() {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      return
    }

    try {
      await audio.play()
      setIsPlaying(true)
    } catch {
      setIsPlaying(false)
    }
  }

  function seek(nextTime: number) {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = clamp(nextTime, 0, duration || 0)
  }

  function next() {
    if (!tracks.length) return
    const idx = tracks.findIndex((t) => t.id === currentId)
    const n = (idx + 1) % tracks.length
    setCurrentId(tracks[n].id)
    setIsPlaying(true)
    setTimeout(() => togglePlay(), 0)
  }

  function prev() {
    if (!tracks.length) return
    const idx = tracks.findIndex((t) => t.id === currentId)
    const p = (idx - 1 + tracks.length) % tracks.length
    setCurrentId(tracks[p].id)
    setIsPlaying(true)
    setTimeout(() => togglePlay(), 0)
  }

  function removeTrack(id: string) {
    setTracks((xs) => {
      const next = xs.filter((t) => t.id !== id)
      if (id === currentId) {
        setCurrentId(next[0]?.id ?? '')
        setIsPlaying(false)
      }
      return next
    })
  }

  function onDropFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const list: Track[] = []
    for (const f of Array.from(files)) {
      if (!f.type.startsWith('audio/')) continue
      const url = URL.createObjectURL(f)
      list.push({
        id: `local-${crypto.randomUUID()}`,
        title: f.name.replace(/\.[^.]+$/, ''),
        artist: 'Local',
        url,
      })
    }
    if (!list.length) return

    setTracks((xs) => [...list, ...xs])
    setCurrentId(list[0].id)
    setIsPlaying(false)
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand to-brand2 shadow-lg shadow-black/30" />
            <div>
              <h1 className="text-xl font700">Music Player</h1>
              <p className="text-sm text-muted">Headless UI + UnoCSS + Iconify（纯前端，支持本地音频拖拽）</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn" onClick={() => setOpenAdd(true)}>
              {icon('i-mdi:playlist-plus')} 添加歌曲
            </button>
            <label className="btn cursor-pointer">
              {icon('i-mdi:upload')} 导入本地音频
              <input
                className="hidden"
                type="file"
                accept="audio/*"
                multiple
                onChange={(e) => onDropFiles(e.target.files)}
              />
            </label>
          </div>
        </header>

        <main className="grid grid-cols-1 gap-6 md:grid-cols-[1.2fr_.8fr]">
          {/* Player */}
          <section className="card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="chip mb-2">{icon('i-mdi:music')} 正在播放</div>
                <h2 className="text-2xl font700 leading-tight">{current?.title ?? '—'}</h2>
                <p className="text-muted">{current?.artist ?? ''}</p>
              </div>
              <div className="text-right">
                <div className="chip">{icon('i-mdi:headphones')} 本地播放 · 无后端</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-3 text-sm text-muted">
                <span className="w-12 text-right">{formatTime(currentTime)}</span>
                <input
                  className="w-full"
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.25}
                  value={Math.min(currentTime, duration || 0)}
                  onChange={(e) => seek(Number(e.target.value))}
                />
                <span className="w-12">{formatTime(duration)}</span>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button className="btn" onClick={prev} title="上一首">
                    {icon('i-mdi:skip-previous')}
                  </button>
                  <button className="btn-primary" onClick={togglePlay} title={isPlaying ? '暂停' : '播放'}>
                    {isPlaying ? icon('i-mdi:pause') : icon('i-mdi:play')}
                    {isPlaying ? '暂停' : '播放'}
                  </button>
                  <button className="btn" onClick={next} title="下一首">
                    {icon('i-mdi:skip-next')}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="btn"
                    onClick={() => setIsMuted((m) => !m)}
                    title={isMuted ? '取消静音' : '静音'}
                  >
                    {isMuted ? icon('i-mdi:volume-off') : icon('i-mdi:volume-high')}
                  </button>
                  <input
                    className="w-36"
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                  />
                  <span className="w-12 text-sm text-muted">{Math.round(volume * 100)}%</span>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-panel2/60 border border-white/10 p-4 text-sm text-muted">
                <div className="flex items-center gap-2">
                  {icon('i-mdi:information-outline')}
                  <span>
                    你可以拖拽本地音频文件到浏览器播放（不会上传）。GitHub Pages 上不支持写后端，
                    所以这里用纯前端 Audio API 实现。
                  </span>
                </div>
              </div>

              <audio ref={audioRef} preload="metadata" />
            </div>
          </section>

          {/* Playlist */}
          <section className="card p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font700">播放列表</h3>
              <span className="text-sm text-muted">{tracks.length} 首</span>
            </div>

            <div
              className="rounded-xl border border-dashed border-white/15 bg-white/3 p-4 text-sm text-muted"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                onDropFiles(e.dataTransfer.files)
              }}
            >
              <div className="flex items-center gap-2">
                {icon('i-mdi:tray-arrow-down')}
                <span>拖拽音频文件到这里导入（mp3/wav/ogg...）</span>
              </div>
            </div>

            <ul className="mt-4 space-y-2">
              {tracks.map((t) => {
                const active = t.id === currentId
                return (
                  <li
                    key={t.id}
                    className={
                      'group flex items-center justify-between gap-3 rounded-xl border px-3 py-2 transition ' +
                      (active ? 'bg-white/10 border-brand/40' : 'bg-white/4 border-white/10 hover:bg-white/7')
                    }
                  >
                    <button className="flex min-w-0 flex-1 items-center gap-2 text-left" onClick={() => setCurrentId(t.id)}>
                      <span className={active ? 'text-brand2' : 'text-muted'}>{icon('i-mdi:music-note')}</span>
                      <span className="truncate">
                        <span className="text-text">{t.title}</span>
                        <span className="text-muted"> · {t.artist}</span>
                      </span>
                    </button>
                    <button className="btn opacity-0 group-hover:opacity-100" onClick={() => removeTrack(t.id)} title="移除">
                      {icon('i-mdi:trash-can-outline')}
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="mt-4 text-xs text-muted">
              提示：示例音乐来自公开演示源；你也可以导入本地音乐。点击“添加歌曲”可输入音频URL。
            </div>
          </section>
        </main>

        <footer className="mt-10 text-center text-xs text-muted">
          <p>
            © {new Date().getFullYear()} PotatoHeadAI · Built with Vite + React + Headless UI + UnoCSS + Iconify
          </p>
        </footer>
      </div>

      <AddTrackModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onAdd={(t) => {
          setTracks((xs) => [t, ...xs])
          setCurrentId(t.id)
          setIsPlaying(false)
        }}
      />
    </div>
  )
}

function AddTrackModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean
  onClose: () => void
  onAdd: (t: Track) => void
}) {
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (open) {
      setTitle('')
      setArtist('')
      setUrl('')
    }
  }, [open])

  const canAdd = title.trim() && url.trim()

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/60" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="card w-full max-w-lg p-6">
          <DialogTitle className="text-lg font700 flex items-center gap-2">
            <span className="i-mdi:playlist-plus" /> 添加歌曲（URL）
          </DialogTitle>
          <p className="mt-1 text-sm text-muted">
            请输入可直接访问的音频链接（建议 https）。部分站点可能有跨域限制，遇到播放失败可以换源或导入本地文件。
          </p>

          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-sm text-muted">标题</span>
              <input className="input mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如：My Song" />
            </label>
            <label className="block">
              <span className="text-sm text-muted">歌手</span>
              <input className="input mt-1" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="例如：Unknown" />
            </label>
            <label className="block">
              <span className="text-sm text-muted">音频URL</span>
              <input
                className="input mt-1"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://.../audio.mp3"
              />
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button className="btn" onClick={onClose}>
              取消
            </button>
            <button
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!canAdd}
              onClick={() => {
                onAdd({
                  id: `url-${crypto.randomUUID()}`,
                  title: title.trim(),
                  artist: artist.trim() || 'Unknown',
                  url: url.trim(),
                })
                onClose()
              }}
            >
              添加
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
