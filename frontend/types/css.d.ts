// Next only declares `*.module.css`, so a plain side-effect import such as
// `import "../styles/globals.css"` has no type declaration of its own.
// TypeScript historically skipped side-effect imports, but
// `noUncheckedSideEffectImports` is on by default from TypeScript 6, which
// turns that import into error TS2882. This project has no CSS modules, so a
// bare wildcard is safe.
declare module "*.css";
