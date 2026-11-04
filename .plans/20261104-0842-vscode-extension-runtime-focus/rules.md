# Rules: VS Code Extension Runtime Focus

- Activation commands must be registered in source and declared explicitly when required by runtime behavior.
- Do not externalize `@allah/sdk` from the extension bundle.
- Do not treat a static model catalog as proof that upstream provider credentials work.
- Offline gateway behavior must identify connection failure or configuration mismatch.
- Secret and device credentials remain in VS Code `SecretStorage`.
- Do not modify unrelated i18n, UI, authentication, or Headquarter changes.
- Hash parity verifies packaging; extension-host execution verifies command availability.
