import eslintPluginSvelte from 'eslint-plugin-svelte';
export default [
  ...eslintPluginSvelte.configs['flat/recommended'],
  {
    rules: {
      "semi": "error",
      "no-console": "warn",
      "no-unused-vars": "error",
      "no-eval": "error",
      "no-extend-native": "error",
      "no-extra-bind": "error",
      "no-implied-eval": "error",
      "no-loop-func": "error",
      "no-new-func": "error",
      "no-param-reassign": "error",
      "no-proto": "error",
      "no-sequences": "error",
      "no-shadow": "error",
      "no-throw-literal": "error",
      "no-unused-expressions": "error",
      "no-var": "error",
      "prefer-const": "error",
      "prefer-arrow-callback": "error",
      "prefer-rest-params": "error",
      "prefer-spread": "error",
      "require-await": "error"
    }
  }
];