import * as React from "react"
import { toBlob } from "html-to-image"
import { DownloadIcon, Loader2Icon, Share2Icon } from "lucide-react"
import { toast } from "sonner"

import { SharePoster, sharePosterDimensions } from "./share-poster"
import type { SharePosterVariant } from "./share-poster"

import type { SetorConvocacao } from "@/lib/convocacao-share"
import { POSTER_BACKGROUND_HEX } from "@/lib/convocacao-share"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const DOWNLOAD_BASE = "minha-convocacao-meuhexa"

type ShareConvocacaoDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  setores: Array<SetorConvocacao>
  dataConvocacao: string
}

function fileSuffix(variant: SharePosterVariant): string {
  return variant === "story" ? "stories" : "feed"
}

function downloadFilename(variant: SharePosterVariant): string {
  return `${DOWNLOAD_BASE}-${fileSuffix(variant)}.png`
}

function canSharePngFile(file: File): boolean {
  try {
    if (!("share" in navigator) || !("canShare" in navigator)) {
      return false
    }
    const nav = navigator as Navigator & Pick<Navigator, "share" | "canShare">
    return nav.canShare({ files: [file] })
  } catch {
    return false
  }
}

function browserMayShareFiles(): boolean {
  return "share" in navigator && "canShare" in navigator && typeof navigator.share === "function"
}

/** PNG 1×1 válido para testar `navigator.canShare({ files })`. */
function probeSharePngFile(): File {
  const b64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
  const bin = Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0))
  return new File([bin], "probe.png", { type: "image/png" })
}

function canShareFilesProbe(): boolean {
  if (!browserMayShareFiles()) return false
  try {
    return navigator.canShare({ files: [probeSharePngFile()] })
  } catch {
    return false
  }
}

function canCopyImage(): boolean {
  if (!globalThis.isSecureContext) return false
  try {
    if (typeof navigator.clipboard.write !== "function") return false
    return typeof ClipboardItem.supports !== "function" || ClipboardItem.supports("image/png")
  } catch {
    return false
  }
}

async function rasterPoster(node: HTMLElement): Promise<Blob> {
  await document.fonts.ready
  const blob = await toBlob(node, {
    cacheBust: true,
    pixelRatio: 2.5,
    backgroundColor: POSTER_BACKGROUND_HEX,
  })
  if (!blob) {
    throw new Error("Falha ao gerar imagem")
  }
  return blob
}

export function ShareConvocacaoDialog({
  open,
  onOpenChange,
  setores,
  dataConvocacao,
}: ShareConvocacaoDialogProps) {
  const [variant, setVariant] = React.useState<SharePosterVariant>("feed")
  const [exporting, setExporting] = React.useState(false)
  const [shareFilesOk, setShareFilesOk] = React.useState(false)
  const posterRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!open) {
      setExporting(false)
      return
    }
    setShareFilesOk(canShareFilesProbe())
  }, [open])

  const dim = sharePosterDimensions(variant)
  /** Escala o preview — ~60vh para ler melhor; limitado pela altura útil da janela. */
  const previewScale = Math.min(
    1,
    ((typeof window !== "undefined" ? window.innerHeight : 640) * 0.6) / dim.height,
  )

  const runBlobAction = React.useCallback(
    async (action: "download" | "share" | "copy") => {
      const node = posterRef.current
      if (!node) {
        toast.error("Pré-visualização indisponível")
        return
      }

      const errMsg =
        action === "copy"
          ? "Não foi possível copiar"
          : action === "share"
            ? "Não foi possível compartilhar"
            : "Não foi possível baixar"

      setExporting(true)
      try {
        const blob = await rasterPoster(node)
        const name = downloadFilename(variant)

        switch (action) {
          case "download": {
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = name
            a.rel = "noopener"
            a.click()
            URL.revokeObjectURL(url)
            toast.success("Imagem baixada")
            return
          }
          case "share": {
            const file = new File([blob], name, { type: "image/png" })
            if (!canSharePngFile(file)) {
              toast.error("Este dispositivo não permite compartilhar imagens. Use “Baixar imagem”.")
              return
            }
            await navigator.share({
              files: [file],
              title: "Minha convocação — Meu Hexa",
              text: "Convocação gerada no Meu Hexa",
            })
            toast.success("Compartilhado")
            return
          }
          case "copy": {
            await navigator.clipboard.write([
              new ClipboardItem({
                "image/png": blob,
              }),
            ])
            toast.success("Imagem copiada")
          }
        }
      } catch (e) {
        console.error(e)
        if (e instanceof Error && e.name === "AbortError") {
          return
        }
        toast.error(errMsg)
      } finally {
        setExporting(false)
      }
    },
    [variant],
  )

  const showShare = shareFilesOk

  const showCopy = canCopyImage()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[min(94vh,920px)] max-w-[calc(100vw-1.25rem)] flex-col gap-4 sm:max-w-xl md:max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle>Compartilhar convocação</DialogTitle>
          <DialogDescription>
            Escolha o formato, confira o preview e baixe ou compartilhe o cartão com os 26 convocados.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <p id="convocacao-share-format-label" className="text-xs font-medium text-muted-foreground">
            Formato
          </p>
          <ToggleGroup
            type="single"
            value={variant}
            onValueChange={(v) => {
              if (v === "story" || v === "feed") setVariant(v)
            }}
            variant="outline"
            size="sm"
            spacing={2}
            className="flex w-full justify-stretch"
            aria-labelledby="convocacao-share-format-label"
          >
            <ToggleGroupItem value="feed" className="flex-1">
              Feed (1:1)
            </ToggleGroupItem>
            <ToggleGroupItem value="story" className="flex-1">
              Stories (9:16)
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="rounded-xl border border-border bg-muted/40 p-3">
          <div
            className="relative mx-auto overflow-hidden rounded-lg bg-(--poster-preview-bg) [--poster-preview-bg:#e8ebe8]"
            style={{
              width: dim.width * previewScale,
              height: dim.height * previewScale,
            }}
            role="img"
            aria-label={`Preview do cartão no formato ${variant === "story" ? "vertical Stories" : "quadrado Feed"}`}
          >
            <div
              style={{
                width: dim.width,
                height: dim.height,
                transform: `scale(${previewScale})`,
                transformOrigin: "top left",
              }}
            >
              <SharePoster ref={posterRef} variant={variant} setores={setores} dataConvocacao={dataConvocacao} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="default"
              className="flex-1 sm:flex-none"
              disabled={exporting}
              onClick={() => runBlobAction("download")}
            >
              {exporting ? (
                <Loader2Icon className="animate-spin" data-icon="inline-start" />
              ) : (
                <DownloadIcon data-icon="inline-start" />
              )}
              Baixar imagem
            </Button>
            {showShare ? (
              <Button
                type="button"
                variant="outline"
                className="flex-1 sm:flex-none"
                disabled={exporting}
                onClick={() => runBlobAction("share")}
              >
                <Share2Icon data-icon="inline-start" />
                Compartilhar
              </Button>
            ) : null}
            {showCopy ? (
              <Button
                type="button"
                variant="outline"
                className="flex-1 sm:flex-none"
                disabled={exporting}
                onClick={() => runBlobAction("copy")}
              >
                Copiar imagem
              </Button>
            ) : null}
          </div>
          {exporting ? (
            <p className="text-center text-xs text-muted-foreground">Gerando imagem…</p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
