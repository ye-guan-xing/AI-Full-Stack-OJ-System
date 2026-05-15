import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const RAW_LANGUAGE_MAP: Record<string, number> = {
  C: 50,
  'C++': 54,
  Java: 62,
  Python: 71,
  'C#': 51,
  JavaScript: 63,
  TypeScript: 74,
  Go: 60,
  Rust: 73,
  Kotlin: 78,
  Swift: 83,
  PHP: 68,
  Ruby: 72,
};

export const LANGUAGE_NAME_TO_ID: Record<string, number> = Object.fromEntries(
  Object.entries(RAW_LANGUAGE_MAP).map(([k, v]) => [k.toLowerCase(), v]),
);

export function getLanguageId(name: string): number | undefined {
  if (!name) return undefined;
  return LANGUAGE_NAME_TO_ID[name.toLowerCase()];
}

@Injectable()
export class Judge0Config {
  readonly baseUrl: string;

  constructor(cs: ConfigService) {
    this.baseUrl = cs.get<string>('JUDGE0_BASE_URL') ?? 'http://localhost:2358';
  }
}
