export type Screen = 'login' | 'signup' | 'dashboard' | 'generator' | 'results' | 'execution' | 'settings';

export interface TestResult {
  id: string;
  title: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: string;
  suite?: string;
  error?: string;
  errorLog?: string;
}

export interface Summary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number;
  duration: string;
  status: string;
}

export interface AIAnalysis {
  cause: string;
  fix: string;
  severity: 'low' | 'medium' | 'high';
}
