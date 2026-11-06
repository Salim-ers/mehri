/**
 * Design tokens « Atlas du mouvement » — source unique, reprise dans globals.css
 * et dans les matériaux 3D. Palette affinée à partir des photos du cabinet
 * (bureau noyer, sol en pierre, murs blancs) et du logo (bronze).
 */
export const colors = {
  paper: "#FCFBF8",
  ivory: "#F6F1E9",
  stone: "#DCD0BF",
  stoneDeep: "#B8A486",
  walnut: "#6A3A1E",
  umber: "#241A15",
  graphite: "#161716",
  bronze: "#A9784B",
  bronzeLight: "#D6B48C",
  bronzeInk: "#7A4F2C",
  ink: "#1F1915",
  inkSoft: "#5A4E45",
  bone: "#EDE4D6",
  review: "#7A4E00",
  reviewBg: "#FFF1CC",
} as const;

export type ColorToken = keyof typeof colors;
