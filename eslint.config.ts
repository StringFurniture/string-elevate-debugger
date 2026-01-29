import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
    globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

    ...pluginVue.configs['flat/essential'],
    vueTsConfigs.recommended,

    {
        name: 'app/overrides',
        files: ['**/*.{vue,ts,mts,tsx}'],
        rules: {
            'indent': [
                'error',
                4,
                {
                    'SwitchCase': 1,
                },
            ],
            'linebreak-style': [
                'error',
                'unix',
            ],
            'quotes': [
                'error',
                'single',
            ],
            'semi': [
                'error',
                'never',
            ],
            'eqeqeq': [
                'error',
            ],
            'comma-dangle': [
                'error',
                'always-multiline',
            ],
            'comma-spacing': [
                'error',
                {
                    'before': false,
                    'after': true,
                },
            ],
            'key-spacing': [
                'error',
                {
                    'singleLine': {
                        'beforeColon': false,
                        'afterColon': true,
                    },
                    'multiLine': {
                        'beforeColon': false,
                        'afterColon': true,
                    },
                },
            ],
            'padding-line-between-statements': [
                'error',
                {
                    'blankLine': 'always',
                    'prev': '*',
                    'next': 'block',
                },
                {
                    'blankLine': 'always',
                    'prev': 'block',
                    'next': '*',
                },
                {
                    'blankLine': 'always',
                    'prev': '*',
                    'next': 'block-like',
                },
                {
                    'blankLine': 'always',
                    'prev': 'block-like',
                    'next': '*',
                },
                {
                    'blankLine': 'always',
                    'prev': '*',
                    'next': 'export',
                },
                {
                    'blankLine': 'always',
                    'prev': '*',
                    'next': 'return',
                },
                {
                    'blankLine': 'always',
                    'prev': '*',
                    'next': 'function',
                },
                {
                    'blankLine': 'any',
                    'prev': [
                        'const',
                        'let',
                        'var',
                    ],
                    'next': [
                        'const',
                        'let',
                        'var',
                    ],
                },
            ],
            'vue/order-in-components': [
                'error',
            ],
            'vue/html-indent': [
                'error',
                4,
                {
                    'attribute': 1,
                    'baseIndent': 1,
                    'closeBracket': 0,
                    'alignAttributesVertically': false,
                    'ignores': [],
                },
            ],
            'vue/max-attributes-per-line': [
                'error',
                {
                    'singleline': {
                        'max': 2,
                    },
                    'multiline': {
                        'max': 1,
                    },
                },
            ],
            'vue/new-line-between-multi-line-property': [
                'error',
            ],
            'vue/component-name-in-template-casing': [
                'error',
                'PascalCase',
                {
                    'registeredComponentsOnly': false,
                    'ignores': [
                        'draggable',
                    ],
                },
            ],
            'vue/padding-line-between-blocks': [
                'error',
                'always',
            ],
            'vue/multi-word-component-names': [
                'off',
            ],
            'vue/comment-directive': [
                'off',
            ],
            'jsdoc/require-param-description': 0,
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },

)
