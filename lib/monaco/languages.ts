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
import { ShellDefinition } from './languages/shell';
import { HtmlDefinition } from './languages/html';
import { XmlDefinition } from './languages/xml';
import { SqlDefinition } from './languages/sql';
import { PlaintextDefinition } from './languages/plaintext';

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
  ShellDefinition,
  HtmlDefinition,
  XmlDefinition,
  SqlDefinition,
  PlaintextDefinition,
];
