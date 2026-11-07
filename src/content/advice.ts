import { practice } from "@/content/practice";
import { hasValue, type Fact } from "@/lib/facts";

/**
 * Page « Conseils & votre rendez-vous ».
 * Informations générales et prudentes, adaptées au cadre français :
 * - accès direct à l'ostéopathe, sans prescription ;
 * - décret n° 2007-435 : manipulations du rachis cervical après diagnostic médical
 *   attestant l'absence de contre-indication ;
 * - pas de prise en charge par l'Assurance maladie, remboursement partiel possible
 *   par certaines complémentaires santé.
 * Aucune donnée du cabinet n'est écrite en dur : durée, tarifs et consignes viennent
 * des faits validés (`practice`), sinon la réponse renvoie vers le cabinet.
 */

export interface AdvicePanel {
  readonly id: "infos" | "documents" | "tenue" | "venue";
  readonly title: string;
  readonly text: readonly string[];
}

export const beforePanels: readonly AdvicePanel[] = [
  {
    id: "infos",
    title: "Préparer les informations utiles",
    text: [
      "Notez ce qui vous amène : depuis quand la gêne est présente, dans quelles situations elle apparaît, ce qui la modifie.",
      "Pensez à vos antécédents médicaux et chirurgicaux, à vos traitements en cours et aux questions que vous souhaitez poser.",
    ],
  },
  {
    id: "documents",
    title: "Documents à apporter",
    text: [
      "Si vous en disposez, apportez les documents médicaux en lien avec votre motif : comptes rendus, ordonnances en cours, résultats d'examens.",
      "Ils ne sont pas obligatoires pour prendre rendez-vous : il n'est pas nécessaire de faire réaliser un examen d'imagerie avant de venir.",
    ],
  },
  {
    id: "tenue",
    title: "Comment s'habiller ?",
    text: [
      "Choisissez une tenue confortable, dans laquelle vous bougez facilement.",
      "Si l'examen d'une région le nécessite, cela vous est expliqué au préalable, et vos préférences sont respectées.",
    ],
  },
  {
    id: "venue",
    title: "Préparer sa venue",
    text: ["Les éventuelles consignes particulières vous sont communiquées lors de la prise de rendez-vous."],
  },
];

export interface AfterItem {
  readonly title: string;
  readonly text: string;
}

export const afterItems: readonly AfterItem[] = [
  {
    title: "Suivre les conseils reçus",
    text: "Les conseils donnés en fin de séance tiennent compte de votre situation : appliquez-les à votre rythme et n'hésitez pas à les noter.",
  },
  {
    title: "Reprendre vos activités",
    text: "Reprenez vos activités selon les recommandations qui vous ont été données, progressivement lorsque cela vous a été conseillé.",
  },
  {
    title: "Savoir qui contacter",
    text: "Si une gêne persiste, s'aggrave ou si de nouveaux symptômes apparaissent, contactez votre médecin traitant. Pour une question sur la séance, vous pouvez joindre le cabinet.",
  },
];

export interface FaqItem {
  readonly id: string;
  readonly question: string;
  readonly answer: readonly string[];
  /** fait du cabinet dont dépend la réponse (badge « À fournir » en mode relecture) */
  readonly fact?: Fact<unknown>;
}

/** Questions fréquentes : réponses générales + données du cabinet lorsqu'elles sont validées. */
export function faqItems(): readonly FaqItem[] {
  const phone = hasValue(practice.phone) ? practice.phone.value.display : null;
  const callLine = phone ? `par téléphone, au ${phone}` : "par téléphone";
  return [
    {
      id: "ordonnance",
      question: "Faut-il une ordonnance ?",
      answer: [
        "Non. En France, vous pouvez consulter un ostéopathe directement, sans prescription médicale.",
        "Certaines complémentaires santé demandent une facture pour un éventuel remboursement : renseignez-vous auprès de la vôtre.",
      ],
    },
    {
      id: "duree",
      question: "Quelle est la durée d'une consultation ?",
      answer: hasValue(practice.consultationDuration)
        ? [`Comptez ${practice.consultationDuration.value}. La durée peut varier selon votre situation.`]
        : [`La durée vous est précisée lors de la prise de rendez-vous, ${callLine}.`],
      fact: practice.consultationDuration,
    },
    {
      id: "tarif",
      question: "Quel est le tarif ?",
      answer: hasValue(practice.fees)
        ? practice.fees.value.map((f) => `${f.label} : ${f.price}.`)
        : [`Les tarifs vous sont communiqués lors de la prise de rendez-vous, ${callLine}.`],
    },
    {
      id: "documents",
      question: "Quels documents apporter ?",
      answer: [
        "Les documents médicaux utiles dont vous disposez : comptes rendus, ordonnances en cours, résultats d'examens en lien avec votre motif de consultation. Ils ne sont pas obligatoires pour prendre rendez-vous.",
        "À savoir : la réglementation prévoit qu'une manipulation du rachis cervical ne soit réalisée qu'après un diagnostic médical attestant l'absence de contre-indication (décret n° 2007-435).",
      ],
    },
    {
      id: "annulation",
      question: "Comment annuler un rendez-vous ?",
      answer: [
        `Prévenez le cabinet ${callLine}, dès que possible : le créneau pourra être proposé à un autre patient.`,
        ...(hasValue(practice.cancellationPolicy) ? [practice.cancellationPolicy.value] : []),
      ],
      fact: practice.cancellationPolicy,
    },
    {
      id: "enfant",
      question: "Peut-on consulter un ostéopathe pour un enfant ?",
      answer: [
        "Cela dépend de l'âge de l'enfant et du motif : les publics reçus varient d'un praticien à l'autre. Appelez le cabinet en précisant l'âge de l'enfant et ce qui motive la consultation ; il vous indiquera si un rendez-vous est adapté.",
        "Un enfant mineur est accompagné d'un parent ou de son représentant légal. Le suivi par son médecin (pédiatre, médecin traitant) reste la référence.",
      ],
    },
    {
      id: "kine",
      question: "Quelle est la différence entre ostéopathe et kinésithérapeute ?",
      answer: [
        "Le masseur-kinésithérapeute est un professionnel de santé : ses soins, notamment de rééducation, sont le plus souvent réalisés sur prescription médicale et peuvent être remboursés par l'Assurance maladie.",
        "L'ostéopathe, dont le titre est encadré par la loi, prend en charge des troubles fonctionnels par des techniques manuelles, sans prescription ; ses séances ne sont pas remboursées par l'Assurance maladie. Les deux approches peuvent être complémentaires.",
      ],
    },
    {
      id: "remboursement",
      question: "L'ostéopathie est-elle remboursée ?",
      answer: [
        "L'ostéopathie n'est pas prise en charge par l'Assurance maladie.",
        "De nombreuses complémentaires santé remboursent une partie des séances, selon votre contrat : vérifiez les conditions de votre contrat et demandez une facture au cabinet si votre complémentaire l'exige.",
      ],
    },
  ];
}
