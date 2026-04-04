import * as React from "react"

import type { Jogador } from "@/data/jogadores"
import type { SetorConvocacao } from "@/lib/convocacao-share"
import { POSTER_BACKGROUND_HEX, SITE_FULL_URL } from "@/lib/convocacao-share"
import tacaCopa from "@/assets/taca_copa.png"

/** Cores fixas — carta / seleção, sem blur. */
const COL = {
  bg: POSTER_BACKGROUND_HEX,
  paper: "#fffdf8",
  green: "#0a6b3c",
  greenMuted: "#0d7a45",
  gold: "#b8860b",
  goldLight: "#d4a012",
  blue: "#153a75",
  ink: "#1c1914",
  muted: "#5c574d",
  wash: "rgba(10, 107, 60, 0.06)",
  borderSoft: "rgba(21, 26, 16, 0.14)",
  borderStrong: "rgba(10, 107, 60, 0.35)",
} as const

const FONT_HEADING = '"Space Grotesk", "Manrope", system-ui, sans-serif'
const FONT_BODY = '"Manrope", "Georgia", serif'

export type SharePosterVariant = "story" | "feed"

export type SharePosterProps = {
  variant: SharePosterVariant
  setores: Array<SetorConvocacao>
  dataConvocacao: string
}

export const sharePosterDimensions = (variant: SharePosterVariant) =>
  variant === "story"
    ? { width: 1080, height: 1920 }
    : { width: 1080, height: 1080 }

function PlayerThumbStory({ jogador, size }: { jogador: Jogador; size: number }) {
  return (
    <img
      src={jogador.foto}
      alt=""
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        objectFit: "cover",
        borderRadius: 8,
        flexShrink: 0,
        border: `2px solid ${COL.goldLight}`,
        boxShadow: "0 2px 0 rgba(21, 26, 16, 0.12)",
      }}
    />
  )
}

function PlayerThumbFeed({ jogador, size }: { jogador: Jogador; size: number }) {
  return (
    <img
      src={jogador.foto}
      alt=""
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        objectFit: "cover",
        borderRadius: 8,
        flexShrink: 0,
        border: `2px solid ${COL.gold}`,
      }}
    />
  )
}

export const SharePoster = React.forwardRef<HTMLDivElement, SharePosterProps>(function SharePosterInner(
  { variant, setores, dataConvocacao },
  ref,
) {
  const { width, height } = sharePosterDimensions(variant)
  const isStory = variant === "story"
  const thumbStory = 50
  const thumbFeed = 44

  return (
    <div
      ref={ref}
      data-share-poster-root
      className="relative overflow-hidden"
      style={{
        width,
        height,
        backgroundColor: COL.bg,
        fontFamily: FONT_BODY,
        color: COL.ink,
      }}
    >
      {/* textura leve — listras muito suaves */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -12deg,
            transparent,
            transparent 14px,
            rgba(10, 107, 60, 0.03) 14px,
            rgba(10, 107, 60, 0.03) 15px
          )`,
        }}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute"
        style={{
          top: "6%",
          left: "50%",
          width: "220%",
          height: isStory ? 100 : 88,
          marginLeft: "-110%",
          transform: "rotate(-10deg)",
          backgroundColor: "rgba(184, 134, 11, 0.12)",
        }}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute rounded-full border-2 border-dashed"
        style={{
          borderColor: "rgba(10, 107, 60, 0.2)",
          width: isStory ? 780 : 520,
          height: isStory ? 780 : 520,
          left: "50%",
          top: isStory ? "42%" : "48%",
          marginLeft: isStory ? -390 : -260,
          marginTop: isStory ? -390 : -260,
        }}
        aria-hidden
      />

      <span
        className="pointer-events-none absolute rounded-full border-2 font-bold"
        style={{
          fontFamily: FONT_HEADING,
          fontSize: isStory ? 15 : 12,
          letterSpacing: "0.12em",
          color: "rgba(21, 26, 16, 0.35)",
          borderColor: "rgba(21, 26, 16, 0.2)",
          padding: isStory ? "16px 14px" : "12px 10px",
          right: "7%",
          top: isStory ? "11%" : "8%",
          transform: "rotate(-8deg)",
        }}
        aria-hidden
      >
        BR · 26
      </span>

      <span
        className="pointer-events-none absolute select-none font-bold"
        style={{
          fontFamily: FONT_HEADING,
          fontSize: isStory ? 168 : 128,
          lineHeight: 1,
          left: "5%",
          bottom: "7%",
          color: "rgba(21, 26, 16, 0.035)",
        }}
        aria-hidden
      >
        2026
      </span>

      <div
        className="relative flex flex-col"
        style={{
          height: "100%",
          padding: isStory ? "26px 30px 22px" : "22px 26px 20px",
        }}
      >
        {/* “Folha” da carta */}
        <div
          className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
          style={{
            backgroundColor: COL.paper,
            border: `1px solid ${COL.borderSoft}`,
            boxShadow:
              "inset 0 0 0 1px rgba(255,255,255,0.9), 4px 6px 0 rgba(21, 26, 16, 0.08), 12px 14px 32px rgba(10, 107, 60, 0.06)",
            borderRadius: isStory ? 6 : 5,
            padding: isStory ? "22px 28px 20px" : "18px 24px 16px",
          }}
        >
          {/* cabeçalho tipo envelope */}
          <div
            style={{
              flexShrink: 0,
              paddingBottom: isStory ? 12 : 10,
              marginBottom: isStory ? 10 : 8,
              borderBottom: `2px solid ${COL.borderStrong}`,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <img
                  src={tacaCopa}
                  alt=""
                  width={isStory ? 78 : 68}
                  height={isStory ? 78 : 68}
                  style={{
                    width: isStory ? 78 : 68,
                    height: isStory ? 78 : 68,
                    objectFit: "contain",
                    flexShrink: 0,
                  }}
                />
                <div className="min-w-0">
                  <p
                    style={{
                      fontFamily: FONT_HEADING,
                      fontWeight: 700,
                      fontSize: isStory ? 34 : 28,
                      color: COL.green,
                      margin: 0,
                      lineHeight: 1.1,
                    }}
                  >
                    Meu Hexa
                  </p>
                  <p
                    style={{
                      margin: "6px 0 0",
                      fontFamily: FONT_HEADING,
                      fontWeight: 600,
                      fontSize: isStory ? 13 : 11,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: COL.blue,
                    }}
                  >
                    Copa do Mundo FIFA 2026
                  </p>
                </div>
              </div>
            </div>

            <p
              style={{
                margin: isStory ? "10px 0 0" : "8px 0 0",
                fontFamily: FONT_HEADING,
                fontSize: isStory ? 10 : 9,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: COL.muted,
              }}
            >
              Documento não oficial · opinião de torcedor
            </p>

            <div
              style={{
                marginTop: isStory ? 8 : 6,
                padding: isStory ? "7px 11px" : "6px 8px",
                backgroundColor: COL.wash,
                borderLeft: `4px solid ${COL.greenMuted}`,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: FONT_HEADING,
                  fontSize: isStory ? 14 : 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: COL.blue,
                  fontWeight: 600,
                }}
              >
                Para: Carlo Ancelotti · Seleção Brasileira
              </p>
            </div>
          </div>

          {/* corpo da carta */}
          <div style={{ flexShrink: 0, marginBottom: isStory ? 10 : 8 }}>
            <p
              style={{
                margin: 0,
                fontFamily: FONT_HEADING,
                fontSize: isStory ? 23 : 17,
                fontWeight: 600,
                color: COL.ink,
              }}
            >
              Caro Professor Ancelotti,
            </p>
            {isStory ? (
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: 17,
                  lineHeight: 1.4,
                  color: COL.muted,
                }}
              >
                Falta ideia para os 26? Aqui vai um rascunho polêmico no melhor estilo brasileiro — use, ignore ou
                deixe o sofá em debate.
              </p>
            ) : (
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 14,
                  lineHeight: 1.4,
                  color: COL.muted,
                }}
              >
                Rascunho “brasileiro” para os 26 — polêmico por definição. O senhor manda no oficial.
              </p>
            )}
            <p
              style={{
                margin: isStory ? "12px 0 0" : "8px 0 0",
                fontFamily: FONT_HEADING,
                fontWeight: 700,
                fontSize: isStory ? 31 : 22,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: COL.green,
              }}
            >
              Minha convocação
            </p>
          </div>

          <div
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            {isStory ? (
              <div
                className="flex min-h-0 flex-1 flex-col justify-between"
                style={{ minHeight: 0 }}
              >
                {setores.map((s) => (
                  <section key={s.titulo}>
                    <h2
                      style={{
                        fontFamily: FONT_HEADING,
                        fontSize: 13,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: COL.green,
                        margin: "0 0 6px",
                        fontWeight: 600,
                      }}
                    >
                      {s.titulo}
                    </h2>
                    <ul
                      style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 4 }}
                    >
                      {s.jogadores.map((j) => (
                        <li
                          key={j.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "6px 12px 6px 10px",
                            borderRadius: 9,
                            backgroundColor: COL.wash,
                            border: `1px solid rgba(10, 107, 60, 0.1)`,
                          }}
                        >
                          <PlayerThumbStory jogador={j} size={thumbStory} />
                          <div className="min-w-0" style={{ flex: 1 }}>
                            <p
                              style={{
                                margin: 0,
                                fontWeight: 600,
                                fontSize: 19,
                                lineHeight: 1.2,
                                fontFamily: FONT_BODY,
                              }}
                            >
                              {j.nome}
                            </p>
                            <p
                              style={{
                                margin: "3px 0 0",
                                fontSize: 14,
                                color: COL.muted,
                                display: "flex",
                                alignItems: "center",
                                gap: 7,
                              }}
                            >
                              <img
                                src={j.escudo}
                                alt=""
                                width={17}
                                height={17}
                                style={{ width: 17, height: 17, objectFit: "contain" }}
                              />
                              {j.clube}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            ) : (
              <div
                className="flex min-h-0 flex-1 flex-col justify-between"
                style={{ minHeight: 0 }}
              >
                {setores.map((s) => (
                  <section key={s.titulo}>
                    <h2
                      style={{
                        fontFamily: FONT_HEADING,
                        fontSize: 13,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: COL.green,
                        margin: "0 0 4px",
                        fontWeight: 600,
                      }}
                    >
                      {s.titulo}
                    </h2>
                    <ul
                      style={{
                        listStyle: "none",
                        margin: 0,
                        padding: 0,
                        display: "grid",
                        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                        columnGap: 9,
                        rowGap: 6,
                      }}
                    >
                      {s.jogadores.map((j) => (
                        <li
                          key={j.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 9,
                            padding: "4px 0",
                            minWidth: 0,
                            borderBottom: `1px solid rgba(10, 107, 60, 0.08)`,
                          }}
                        >
                          <PlayerThumbFeed jogador={j} size={thumbFeed} />
                          <div className="min-w-0" style={{ flex: 1 }}>
                            <p
                              style={{
                                margin: 0,
                                fontWeight: 600,
                                fontSize: 18,
                                lineHeight: 1.15,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {j.nome}
                            </p>
                            <p
                              style={{
                                margin: "2px 0 0",
                                fontSize: 12,
                                color: COL.muted,
                                lineHeight: 1.15,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {j.clube}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </div>

          <footer
            style={{
              flexShrink: 0,
              marginTop: "auto",
              paddingTop: isStory ? 14 : 12,
              borderTop: `1px dashed ${COL.borderSoft}`,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: isStory ? 16 : 13,
                lineHeight: 1.45,
                fontStyle: "italic",
                color: COL.muted,
              }}
            >
              Com o devido respeito (e a teimosia de quem montou isso no sofá),
            </p>
            <p
              style={{
                margin: isStory ? "8px 0 0" : "6px 0 0",
                fontFamily: FONT_HEADING,
                fontWeight: 600,
                fontSize: isStory ? 15 : 12,
                color: COL.green,
              }}
            >
              — Torcida do Meu Hexa
            </p>
            <div
              className="flex items-end justify-between gap-3"
              style={{ marginTop: isStory ? 14 : 10 }}
            >
              <div>
                <p style={{ margin: 0, fontSize: isStory ? 17 : 14, fontWeight: 600, color: COL.blue }}>
                  {SITE_FULL_URL}
                </p>
                <p style={{ margin: "5px 0 0", fontSize: isStory ? 13 : 11, color: COL.muted }}>
                  {dataConvocacao}
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
})
