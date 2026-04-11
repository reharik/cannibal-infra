import { getSubsetByProp } from '@reharik/smart-enum';
import { ContractError, ErrorArea } from './ContractError';

export const AppErrorCollection = {
  album: getSubsetByProp(ContractError, 'area', ErrorArea.album),
  mediaItem: getSubsetByProp(ContractError, 'area', ErrorArea.mediaItem),
} as const;
