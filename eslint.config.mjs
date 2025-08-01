import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import css from '@eslint/css'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    plugins: { js },
    extends: ['js/recommended']
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        process: 'readonly'
      }
    }
  },
  tseslint.configs.recommended,
  pluginVue.configs['flat/essential'],
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: tseslint.parser }}
  },
  {
    files: ['**/*.css'],
    plugins: { css },
    language: 'css/css',
    extends: ['css/recommended']
  },
  { ignores: ['node_modules', 'dist', '*.d.td', '*.json'] },
  {
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'accessor-pairs': 2,
      'arrow-parens': 0,
      'arrow-spacing': [
        2,
        {
          before: true,
          after: true
        }
      ],
      'block-spacing': [2, 'always'],
      'brace-style': [
        2,
        '1tbs',
        {
          allowSingleLine: true
        }
      ],
      camelcase: [
        0,
        {
          properties: 'always'
        }
      ],
      'comma-dangle': [2, 'never'],
      'comma-spacing': [
        2,
        {
          before: false,
          after: true
        }
      ],
      'comma-style': [2, 'last'],
      'constructor-super': 2,
      curly: [2, 'multi-line'],
      'dot-location': [2, 'property'],
      'eol-last': 2,
      eqeqeq: [2, 'allow-null'],
      'generator-star-spacing': [
        2,
        {
          before: true,
          after: true
        }
      ],
      'handle-callback-err': [2, '^(err|error)$'],
      indent: [
        2,
        2,
        {
          SwitchCase: 1
        }
      ],
      'jsx-quotes': [2, 'prefer-single'],
      'key-spacing': [
        2,
        {
          beforeColon: false,
          afterColon: true
        }
      ],
      'keyword-spacing': [
        2,
        {
          before: true,
          after: true
        }
      ],
      'new-cap': [
        2,
        {
          newIsCap: true,
          capIsNew: false
        }
      ],
      'no-var': 2,
      'no-constant-condition': 2,
      'new-parens': 2,
      'no-array-constructor': 2,
      'no-caller': 2,
      'no-console': 0,
      'no-class-assign': 2,
      'no-cond-assign': 2,
      'no-const-assign': 2,
      'no-control-regex': 2,
      'no-delete-var': 2,
      'no-dupe-args': 2,
      'no-dupe-class-members': 2,
      'no-dupe-keys': 2,
      'no-duplicate-case': 2,
      'no-empty-character-class': 2,
      'no-empty-pattern': 2,
      'no-eval': 2,
      'no-ex-assign': 2,
      'no-extend-native': 2,
      'no-extra-bind': 2,
      'no-extra-boolean-cast': 2,
      'no-extra-parens': [2, 'functions'],
      'no-fallthrough': 2,
      'no-floating-decimal': 2,
      'no-func-assign': 2,
      'no-implied-eval': 2,
      'no-inner-declarations': [2, 'functions'],
      'no-invalid-regexp': 2,
      'no-irregular-whitespace': 2,
      'no-iterator': 2,
      'no-label-var': 2,
      'no-labels': [
        2,
        {
          allowLoop: false,
          allowSwitch: false
        }
      ],
      'no-lone-blocks': 2,
      'no-mixed-spaces-and-tabs': 2,
      'no-multi-spaces': 2,
      'no-multi-str': 2,
      'no-multiple-empty-lines': [
        2,
        {
          max: 1
        }
      ],
      'no-native-reassign': 2,
      'no-negated-in-lhs': 2,
      'no-new-object': 2,
      'no-new-require': 2,
      'no-new-symbol': 2,
      'no-new-wrappers': 2,
      'no-obj-calls': 2,
      'no-octal': 2,
      'no-octal-escape': 2,
      'no-path-concat': 2,
      'no-proto': 2,
      'no-redeclare': 2,
      'no-regex-spaces': 2,
      'no-return-assign': [2, 'except-parens'],
      'no-self-assign': 2,
      'no-self-compare': 2,
      'no-sequences': 2,
      'no-shadow-restricted-names': 2,
      'no-spaced-func': 2,
      'no-sparse-arrays': 2,
      'no-this-before-super': 2,
      'no-throw-literal': 2,
      'no-trailing-spaces': 2,
      'no-undef': 2,
      'no-undef-init': 2,
      'no-unexpected-multiline': 2,
      'no-unmodified-loop-condition': 2,
      'no-unneeded-ternary': [
        2,
        {
          defaultAssignment: false
        }
      ],
      'no-unreachable': 2,
      'no-unsafe-finally': 2,
      'no-unused-vars': [
        1,
        {
          vars: 'all',
          args: 'none'
        }
      ],
      'no-else-return': 1,
      'no-useless-call': 2,
      'no-useless-computed-key': 2,
      'no-useless-constructor': 2,
      'no-useless-escape': 0,
      'no-whitespace-before-property': 2,
      'no-with': 2,
      'one-var': [
        2,
        {
          initialized: 'never'
        }
      ],
      'operator-linebreak': [
        2,
        'after',
        {
          overrides: {
            '?': 'before',
            ':': 'before'
          }
        }
      ],
      'padded-blocks': [2, 'never'],
      quotes: [
        2,
        'single',
        {
          avoidEscape: true,
          allowTemplateLiterals: true
        }
      ],
      semi: [2, 'never'],
      'semi-spacing': [
        2,
        {
          before: false,
          after: true
        }
      ],
      'space-before-blocks': [2, 'always'],
      'space-before-function-paren': [2, 'never'],
      'space-in-parens': [2, 'never'],
      'space-infix-ops': 2,
      'space-unary-ops': [
        2,
        {
          words: true,
          nonwords: false
        }
      ],
      'spaced-comment': [
        2,
        'always',
        {
          markers: [
            'global',
            'globals',
            'eslint',
            'eslint-disable',
            '*package',
            '!',
            ','
          ]
        }
      ],
      'template-curly-spacing': [2, 'never'],
      'use-isnan': 2,
      'valid-typeof': 2,
      'wrap-iife': [2, 'any'],
      'yield-star-spacing': [2, 'both'],
      yoda: [2, 'never'],
      'prefer-const': 2,
      'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
      'object-curly-spacing': [
        2,
        'always',
        {
          objectsInObjects: false
        }
      ],
      'array-bracket-spacing': [2, 'never'],
      'vue/html-indent': ['error', 2, {
        'attribute': 1,
        'baseIndent': 1,
        'closeBracket': 0,
        'alignAttributesVertically': false,
        'ignores': []
      }],
      'vue/multi-word-component-names': ['off', 'never'],
      'vue/no-v-html': ['off', 'never'],
      'vue/html-quotes': ['error', 'double'],
      'vue/html-self-closing': ['warn', {
        'html': {
          'void': 'never',
          'normal': 'never',
          'component': 'always'
        },
        'svg': 'always',
        'math': 'always'
      }],
      'vue/html-closing-bracket-newline': ['error', {
        'singleline': 'never',
        'multiline': 'always'
      }],
      'vue/html-closing-bracket-spacing': ['error', {
        'startTag': 'never',
        'endTag': 'never',
        'selfClosingTag': 'always'
      }],
      'vue/max-attributes-per-line': ['error', {
        'singleline': 3,
        'multiline': 3
      }],
      'vue/multiline-html-element-content-newline': ['error', {
        'ignoreWhenEmpty': true,
        'ignores': ['pre', 'textarea']
      }],
      'vue/no-use-v-if-with-v-for': ['error', {
        'allowUsingIterationVar': false
      }],
      'vue/return-in-computed-property': ['error', {
        'treatUndefinedAsUnspecified': false
      }],
      'vue/no-unused-components': ['error', {
        'ignoreWhenBindingPresent': true
      }],
      'vue/no-v-model-argument': 'off',
      'vue/attribute-hyphenation': ['error', 'never', {
        'ignore': ['custom-prop']
      }],
      'vue/mustache-interpolation-spacing': ['error', 'always'],
      'vue/component-definition-name-casing': ['error', 'PascalCase'],
      'vue/no-multi-spaces': ['error', {
        'ignoreProperties': false
      }],
      'vue/v-on-event-hyphenation': ['error', 'never', {
        'autofix': false,
        'ignore': [],
        'ignoreTags': []
      }],
      'vue/component-name-in-template-casing': ['error', 'PascalCase', {
        'registeredComponentsOnly': true,
        'ignores': []
      }],
      'vue/no-spaces-around-equal-signs-in-attribute': ['error'],
      'vue/no-template-shadow': ['error'],
      'vue/prop-name-casing': ['error', 'camelCase'],
      'vue/require-default-prop': ['error'],
      'vue/v-bind-style': ['error', 'shorthand'],
      'vue/v-on-style': ['error', 'shorthand'],
      'vue/attributes-order': ['error', {
        'order': [
          'DEFINITION',
          'LIST_RENDERING',
          'CONDITIONALS',
          'RENDER_MODIFIERS',
          'GLOBAL',
          'UNIQUE',
          'TWO_WAY_BINDING',
          'OTHER_DIRECTIVES',
          'OTHER_ATTR',
          'EVENTS',
          'CONTENT'
        ]
      }],
      'vue/order-in-components': ['error', {
        'order': [
          'el',
          'name',
          'key',
          'parent',
          'functional',
          ['delimiters', 'comments'],
          ['components', 'directives', 'filters'],
          'extends',
          'mixins',
          ['provide', 'inject'],
          'ROUTER_GUARDS',
          'layout',
          'middleware',
          'validate',
          'scrollToTop',
          'transition',
          'loading',
          'inheritAttrs',
          'model',
          ['props', 'propsData'],
          'emits',
          'setup',
          'asyncData',
          'data',
          'fetch',
          'head',
          'computed',
          'watch',
          'watchQuery',
          'LIFECYCLE_HOOKS',
          'methods',
          ['template', 'render'],
          'renderError'
        ]
      }],
      'vue/this-in-template': ['error', 'never'],
      'vue/no-multiple-template-root': ['off', 'never']
    }
  }
])
