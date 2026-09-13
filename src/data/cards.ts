import { signs } from './signs';
import type { ConceptCard, QuizQuestion, RoadSign } from './types';

export function questionSourceId(questionId: string): string {
  return `question-${questionId}`;
}

export function signDescriptionSourceId(signId: string): string {
  return `signdesc-${signId}`;
}

export function questionToCard(q: QuizQuestion): ConceptCard {
  const answer = q.options[q.correctIndex] ?? '';
  const explanation = q.explanation.trim();
  return {
    id: questionSourceId(q.id),
    kind: 'question',
    front: q.question.trim(),
    back: explanation ? `Teisingas atsakymas: ${answer}\n\n${explanation}` : `Teisingas atsakymas: ${answer}`,
    sourceId: questionSourceId(q.id),
    createdAt: new Date().toISOString(),
  };
}

export function signDescriptionToCard(sign: RoadSign): ConceptCard {
  return {
    id: signDescriptionSourceId(sign.id),
    kind: 'sign',
    prompt: 'text',
    front: `Koks kelio ženklas?\n\n${sign.meaning}`,
    back: `${sign.code}. ${sign.name}`,
    sourceId: signDescriptionSourceId(sign.id),
    createdAt: new Date().toISOString(),
  };
}

export function questionsToCards(pool: QuizQuestion[]): ConceptCard[] {
  return pool.map(questionToCard);
}

export function signDescriptionCards(list: RoadSign[] = signs): ConceptCard[] {
  return list.map(signDescriptionToCard);
}

export function signIdFromCard(card: ConceptCard): string | undefined {
  const raw = card.sourceId ?? card.id;
  if (raw.startsWith('signdesc-')) return raw.slice('signdesc-'.length);
  if (raw.startsWith('sign-')) return raw.slice('sign-'.length);
  return card.kind === 'sign' ? raw : undefined;
}

export function toCardPayload(card: ConceptCard) {
  return {
    front: card.front,
    back: card.back,
    kind: card.kind,
    sourceId: card.sourceId,
    prompt: card.prompt,
  };
}
