import {
  flagUsRound,
  flagKrRound,
  flagEsRound,
  flagChRound,
  flagJpRound,
  flagViRound,
  flagHiRound,
  flagThRound,
} from '~/images';
import {TLang} from '../types';

const langs: TLang[] = [
  {
    name: 'English',
    img: flagUsRound.src,
    value: 'EN',
  },
  {
    name: 'Korean',
    img: flagKrRound.src,
    value: 'KO',
  },
  {
    name: 'Espanol',
    img: flagEsRound.src,
    value: 'ES',
  },
  {
    name: 'Chinese',
    img: flagChRound.src,
    value: 'ZH',
  },
  {
    name: 'Japanese',
    img: flagJpRound.src,
    value: 'JA',
  },
  {
    name: 'Vietnamese',
    img: flagViRound.src,
    value: 'VI',
  },
  {
    name: 'Hindi',
    img: flagHiRound.src,
    value: 'HI',
  },
  {
    name: 'Thai',
    img: flagThRound.src,
    value: 'TH',
  },
];

export default langs;
