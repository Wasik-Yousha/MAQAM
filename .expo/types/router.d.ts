/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(auth)/login` | `/(tabs)` | `/(tabs)/` | `/(tabs)/barakah` | `/(tabs)/companion` | `/(tabs)/halaka` | `/(tabs)/profile` | `/(tabs)/read` | `/_sitemap` | `/barakah` | `/companion` | `/halaka` | `/login` | `/notifications` | `/onboarding` | `/privacy` | `/profile` | `/read` | `/settings` | `/terms`;
      DynamicRoutes: `/halaka/${Router.SingleRoutePart<T>}` | `/read/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/halaka/[id]` | `/read/[surah]`;
    }
  }
}
