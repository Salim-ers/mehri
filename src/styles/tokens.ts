/**
 * Design tokens — source unique, reprise dans globals.css (@theme) et dans les
 * matériaux 3D. Direction : blanc cassé, ivoire et tons minéraux, anthracite,
 * un seul accent chaud (le bronze du logo) et une lumière « radiographique »
 * froide réservée aux visualisations sur fond sombre.
 */
export const colors = {
  paper: "#FBFAF7",
  ivory: "#F3F0EA",
  mineral: "#E5E0D7",
  mineralDeep: "#C8C0B3",
  stone: "#9A9286",
  anthracite: "#1B1D1F",
  graphite: "#26292C",
  ink: "#18191A",
  inkSoft: "#55575A",
  bronze: "#A27A53",
  bronzeInk: "#7A5535",
  bronzeLight: "#D5BA94",
  bone: "#ECE7DF",
  xray: "#DCE7EA",
  review: "#7A4E00",
  reviewBg: "#FFF1CC",
} as const;

export type ColorToken = keyof typeof colors;
