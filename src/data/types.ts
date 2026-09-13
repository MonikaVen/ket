export type ChapterId =
  | 'bendrosios'
  | 'savokos'
  | 'dalyviai'
  | 'vairuotojai'
  | 'pestieji'
  | 'dviraciai'
  | 'mikromobilumas'
  | 'signalai'
  | 'greitis'
  | 'sankryzos'
  | 'lenkimas'
  | 'sustojimas'
  | 'pervazos'
  | 'zenklai'
  | 'sauga';

export interface Rule {
  id: string;
  number: string;
  title: string;
  text: string;
  tip?: string;
}

export interface Chapter {
  id: ChapterId;
  roman: string;
  title: string;
  summary: string;
  color: string;
  rules: Rule[];
}

export interface QuizQuestion {
  id: string;
  chapterId: ChapterId;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type SignCategory =
  | 'ispejamieji'
  | 'pirmenybes'
  | 'draudziamieji'
  | 'nurodomieji'
  | 'nurodomieji-specialieji'
  | 'informaciniai'
  | 'paslaugu'
  | 'papildomi';

export interface RoadSign {
  id: string;
  code: string;
  name: string;
  category: SignCategory;
  meaning: string;
  shape: 'triangle' | 'circle-red' | 'circle-blue' | 'diamond' | 'rectangle' | 'octagon' | 'square';
}
