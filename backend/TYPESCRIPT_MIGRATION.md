# TypeScript Migration Guide

## Current Status

TypeScript infrastructure has been set up for the LearnIt backend. The project is ready for gradual migration from JavaScript to TypeScript.

## Setup Complete

### Installed Packages
- `typescript` - TypeScript compiler
- `ts-node` - TypeScript execution for development
- `@types/node` - Node.js type definitions
- `@types/express` - Express type definitions
- `@types/bcryptjs` - Bcrypt type definitions
- `@types/jsonwebtoken` - JWT type definitions
- `@types/cors` - CORS type definitions
- `@types/cookie-parser` - Cookie parser type definitions
- `@types/better-sqlite3` - SQLite3 type definitions

### Configuration Files
- **tsconfig.json** - TypeScript compiler configuration
  - Target: ES2020
  - Module: CommonJS
  - Strict mode enabled
  - Output directory: ./dist
  - Source maps enabled
  - All strict type checking options enabled

### Type Definitions Created
**src/types/index.ts** - Centralized type definitions:
- `User`, `UserCreateInput`, `UserUpdateInput`, `SafeUser`
- `RefreshTokenData`, `TokenVerificationResult`, `JWTPayload`
- `Topic`, `Lesson`, `LessonWithTopic`
- `Quiz`, `QuizQuestion`, `QuizResult`, `QuizSubmitResponse`
- `UserProgress`, `UserStats`
- `AuthRequest` (extends Express Request)
- `ApiResponse<T>`, `AuthResponse`
- `Config` (application configuration)

### NPM Scripts Added
```json
{
  "build": "tsc",                    // Compile TypeScript to JavaScript
  "start:ts": "node dist/server.js", // Run compiled TypeScript
  "dev:ts": "ts-node server.ts"      // Run TypeScript directly in dev
}
```

## Migration Strategy

### Phase 1: Type Definitions (✅ COMPLETED)
- [x] Install TypeScript and type packages
- [x] Create tsconfig.json
- [x] Define core types in src/types/index.ts

### Phase 2: Utility & Config Files
1. Convert `config/env.js` → `config/env.ts`
2. Convert `config/logger.js` → `config/logger.ts`
3. Add type annotations to configuration

### Phase 3: Database Models
1. Convert `db/models/users.js` → `db/models/users.ts`
2. Convert `db/models/refreshTokens.js` → `db/models/refreshTokens.ts`
3. Add return type annotations
4. Use defined User, RefreshTokenData types

### Phase 4: Middleware
1. Convert `middleware/errorHandler.js` → `middleware/errorHandler.ts`
2. Convert `middleware/auth.js` → `middleware/auth.ts`
3. Convert `middleware/validators.js` → `middleware/validators.ts`
4. Convert `middleware/rateLimiter.js` → `middleware/rateLimiter.ts`
5. Use AuthRequest type for authenticated routes

### Phase 5: Routes
1. Convert `routes/auth.js` → `routes/auth.ts`
2. Convert `routes/topics.js` → `routes/topics.ts`
3. Convert `routes/lessons.js` → `routes/lessons.ts`
4. Convert `routes/quiz.js` → `routes/quiz.ts`
5. Convert `routes/userProgress.js` → `routes/userProgress.ts`
6. Add request/response type annotations

### Phase 6: Server Entry Point
1. Convert `server.js` → `server.ts`
2. Ensure all imports have proper types
3. Build and test the application

### Phase 7: Testing
1. Update Jest configuration for TypeScript
2. Convert test files to `.test.ts`
3. Run all tests to ensure compatibility

## Example Migration

### Before (JavaScript)
```javascript
const createUser = async (email, password, name) => {
  const db = getDb();
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const stmt = db.prepare(`
    INSERT INTO users (email, password, name) 
    VALUES (?, ?, ?)
  `);
  
  const result = stmt.run(email, hashedPassword, name);
  return getUserById(result.lastInsertRowid);
};
```

### After (TypeScript)
```typescript
import { User, UserCreateInput } from '../types';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/setup';

const createUser = async (
  email: string, 
  password: string, 
  name: string
): Promise<User> => {
  const db = getDb();
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const stmt = db.prepare(`
    INSERT INTO users (email, password, name) 
    VALUES (?, ?, ?)
  `);
  
  const result = stmt.run(email, hashedPassword, name);
  return getUserById(result.lastInsertRowid as number);
};
```

## Benefits of TypeScript Migration

### 1. Type Safety
- Catch type errors at compile time
- Prevent runtime type errors
- Better code reliability

### 2. Better IDE Support
- Intelligent code completion
- Inline documentation
- Automatic refactoring

### 3. Self-Documenting Code
- Types serve as documentation
- Easier to understand function signatures
- Clear API contracts

### 4. Easier Refactoring
- Compiler catches breaking changes
- Safe renaming and restructuring
- Confidence in code changes

### 5. Better Collaboration
- Clear interfaces between modules
- Easier onboarding for new developers
- Reduced need for documentation

## Migration Checklist

- [x] Install TypeScript dependencies
- [x] Create tsconfig.json
- [x] Define core types
- [ ] Convert config files
- [ ] Convert database models
- [ ] Convert middleware
- [ ] Convert routes
- [ ] Convert server.js
- [ ] Update tests
- [ ] Build and verify
- [ ] Update documentation
- [ ] Train team on TypeScript

## Running the Project

### Development (JavaScript - Current)
```bash
npm run dev
```

### Development (TypeScript - After Migration)
```bash
npm run dev:ts
```

### Production Build
```bash
npm run build        # Compile TypeScript
npm run start:ts     # Run compiled code
```

### Testing
```bash
npm test             # Run tests (works with both JS and TS)
npm run test:coverage # Run with coverage
```

## Common Issues & Solutions

### Issue: "Cannot find module" errors
**Solution:** Ensure all imports use correct extensions or configure module resolution in tsconfig.json

### Issue: "Type 'any' not allowed"
**Solution:** Add proper type annotations or use generics

### Issue: "Property does not exist on type"
**Solution:** Extend the type definition or use type assertions carefully

### Issue: Third-party library without types
**Solution:** Install @types package or create custom type declarations in src/types

## Best Practices

1. **Start Small** - Migrate one file at a time
2. **Use Strict Mode** - Enable all strict type checking options
3. **Avoid 'any'** - Use proper types or 'unknown' when necessary
4. **Type Imports** - Use `import type` for type-only imports
5. **Generic Types** - Use generics for reusable components
6. **Readonly** - Mark immutable data as readonly
7. **Union Types** - Use union types instead of loose types
8. **Interface vs Type** - Use interfaces for object shapes, types for unions
9. **Null Safety** - Always handle null/undefined cases
10. **Document Complex Types** - Add JSDoc comments for complex types

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Express with TypeScript](https://blog.logrocket.com/how-to-set-up-node-typescript-express/)
- [Better SQLite3 Types](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/better-sqlite3)

## Next Steps

1. Start with config files (small, isolated modules)
2. Move to database models (well-defined interfaces)
3. Convert middleware (used throughout the app)
4. Update routes (main application logic)
5. Convert server.js last (depends on all other files)
6. Run comprehensive tests after each phase
7. Update documentation as you go

## Notes

- JavaScript files (.js) and TypeScript files (.ts) can coexist during migration
- Use `// @ts-ignore` sparingly and only when necessary
- Regular commits after each file/module migration
- Keep tests passing throughout the migration
- Consider creating a separate branch for TypeScript migration
