import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import airbnb from 'eslint-stylistic-airbnb';

export default [
  airbnb,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      'no-useless-constructor': 'off',
      '@typescript-eslint/no-useless-constructor': 'error',
      '@stylistic/max-len': ['error', 120],
      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'comma',
            requireLast: true,
          },
          singleline: {
            delimiter: 'comma',
            requireLast: false,
          },
          multilineDetection: 'brackets',
        },
      ],
    },
  },
  {
    ignores: ['tests/*', 'dist/*'],
  },
];
