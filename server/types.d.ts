// src/types.d.ts

import 'express-session';

declare module 'express-session' {
  interface SessionData {
    username?: string; // or other custom fields
  }
}
