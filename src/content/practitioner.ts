import { confirmed, type Fact } from "@/lib/facts";

/**
 * Textes de présentation du praticien. Rédaction QuadCore :
 * ils décrivent une manière de conduire la consultation conforme au cadre de
 * l'ostéopathie, sans revendiquer d'expérience, de diplôme ou de spécialité.
 * « Validé » par le praticien dans le questionnaire du 06/11/2026.
 */
export const approachValidation: Fact<boolean> = confirmed(true);

export const approach = {
  statement: "Prendre le temps de comprendre avant d'agir.",
  paragraphs: [
    "Chaque patient arrive avec une histoire, un rythme de vie et des attentes qui lui sont propres. La consultation commence donc toujours par un échange, pour comprendre votre contexte et ce qui vous amène.",
    "L'approche est ensuite manuelle et adaptée : chaque technique est expliquée, proposée selon votre âge, votre condition et votre ressenti, et réalisée uniquement avec votre accord.",
  ],
  principles: [
    {
      number: "01",
      title: "Écouter",
      text: "Un temps d'échange réel, pour comprendre la gêne, son histoire et votre quotidien.",
    },
    {
      number: "02",
      title: "Expliquer",
      text: "Des explications claires, souvent à l'aide des modèles anatomiques du cabinet, sur ce qui est observé et proposé.",
    },
    {
      number: "03",
      title: "Adapter",
      text: "Des techniques choisies selon la personne, sa tolérance et la région concernée — jamais un protocole identique pour tous.",
    },
    {
      number: "04",
      title: "Orienter",
      text: "Lorsque les symptômes nécessitent un diagnostic ou un traitement médical, le patient est orienté vers un médecin.",
    },
  ],
  philosophy:
    "L'ostéopathie s'intéresse à la mobilité du corps et à la manière dont ses différentes régions fonctionnent ensemble. Elle s'inscrit en complément du suivi médical, jamais à sa place.",
} as const;
