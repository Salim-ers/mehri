/**
 * Design tokens — source unique, reprise dans globals.css (@theme, vérifié par un test)
 * et dans les matériaux 3D.
 *
 * Direction « Human Motion Studio » : ivoire chaud et blanc doux inspirés des
 * photographies du cabinet (pierre, bois, lumière filtrée), brun noyer et bronze
 * pour la chaleur, graphite pour la profondeur ; le bleu radiographie et le bleu
 * nuit médical sont réservés aux séquences anatomiques et radiographiques.
 */
export const colors = {
  /** blanc doux */
  paper: "#FAF9F6",
  /** ivoire chaud — fond principal */
  ivory: "#F6F2EC",
  /** sable : panneaux et surfaces secondaires */
  sand: "#ECE5DA",
  /** argile : filets, séparations (jamais pour du texte) */
  clay: "#DDD3C4",
  /** pierre : bordures de contrôles (≥ 3:1 sur ivoire) */
  stone: "#8E8478",
  /** brun noyer */
  walnut: "#563E31",
  graphite: "#17191B",
  /** bleu nuit médical */
  night: "#15222C",
  nightSoft: "#1E2F3B",
  ink: "#17191B",
  inkSoft: "#5C544C",
  bronze: "#B18A63",
  bronzeInk: "#7A5838",
  bronzeLight: "#D8BC97",
  /** bleu radiographie */
  xray: "#91C6DC",
  /** os (rendu 3D, texte sur fond nuit) */
  bone: "#ECE6DC",
  /** brume : texte secondaire sur fond nuit */
  mist: "#B9C9D1",
  review: "#7A4E00",
  reviewBg: "#FFF1CC",
} as const;

export type ColorToken = keyof typeof colors;
