import type { LanguageDefinition } from './types';

import { TypeScriptDefinition } from './languages/typescript';
import { JavascriptDefinition } from './languages/javascript';
import { JsonDefinition } from './languages/json';
import { YamlDefinition } from './languages/yaml';
import { CppDefinition } from './languages/cpp';
import { GoDefinition } from './languages/go';
import { CDefinition } from './languages/c';
import { JavaDefinition } from './languages/java';
import { TomlDefinition } from './languages/toml';
import { IniDefinition } from './languages/ini';
import { MarkdownDefinition } from './languages/markdown';
import { PythonDefinition } from './languages/python';
import { PhpDefinition } from './languages/php';
import { BashDefinition } from './languages/bash';
import { ShDefinition } from './languages/sh';
import { ZshDefinition } from './languages/zsh';
import { HtmlDefinition } from './languages/html';

export const languageDefinitions: LanguageDefinition[] = [
  TypeScriptDefinition,
  JavascriptDefinition,
  JsonDefinition,
  YamlDefinition,
  CppDefinition,
  GoDefinition,
  CDefinition,
  JavaDefinition,
  TomlDefinition,
  IniDefinition,
  MarkdownDefinition,
  PythonDefinition,
  PhpDefinition,
  BashDefinition,
  ShDefinition,
  ZshDefinition,
  HtmlDefinition,
];
