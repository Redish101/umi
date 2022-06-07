import { IServicePluginAPI, PluginAPI } from '@umijs/core';

export { run } from './cli/cli';
export { defineConfig } from './defineConfig';
export * from './mock/helper';
export * from './service/service';
export type IApi = PluginAPI & IServicePluginAPI;
