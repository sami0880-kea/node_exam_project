import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {languageOptions: { globals: globals.node }},
  pluginJs.configs.recommended,
  {
    rules: {
      "strict": "error",
      "no-console": "warn",
      "no-unused-vars": "error",
      "consistent-return": "error",
      "curly": "error",
      "eqeqeq": "error",
      "semi": "error",
      "no-eval": "error",
      "no-extend-native": "error",
      "no-extra-bind": "error",
      "no-implied-eval": "error",
      "no-loop-func": "error",
      "no-new-func": "error",
      "no-param-reassign": "error",
      "no-proto": "error",
      "no-return-assign": "error",
      "no-sequences": "error",
      "no-throw-literal": "error",
      "no-unused-expressions": "error",
      "no-use-before-define": "error",
      "no-var": "error",
      "prefer-const": "error",
      "prefer-arrow-callback": "error",
      "prefer-rest-params": "error",
      "prefer-spread": "error",
      "require-await": "error"
    }
  }
];
