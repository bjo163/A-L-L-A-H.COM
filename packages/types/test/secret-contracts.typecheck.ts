import type {
  AccessRequest,
  ApiCredentialMetadata,
  ApprovalDecision,
  EnvironmentDiff,
  EnvironmentSummary,
  EnvironmentVariableMetadata,
  SecretCreateInput,
  SecretListLimit,
  SecretListQuery,
  SecretMetadata,
  SecretVersionMetadata,
  ServicePrincipalSummary,
} from '../src';

type ForbiddenMaterialFields =
  | 'value'
  | 'values'
  | 'secret'
  | 'secretValue'
  | 'plaintext'
  | 'plaintextValue'
  | 'decrypted'
  | 'decryptedValue'
  | 'decryptedSecret'
  | 'ciphertext'
  | 'secretCiphertext'
  | 'encryptedValue'
  | 'secret_encrypted'
  | 'rawSecret'
  | 'credential'
  | 'credentialValue'
  | 'rawCredential'
  | 'token'
  | 'accessToken'
  | 'refreshToken'
  | 'oldValue'
  | 'newValue'
  | 'old'
  | 'new'
  | 'oldSecret'
  | 'newSecret'
  | 'oldSecretValue'
  | 'newSecretValue';

type Assert<T extends true> = T;
type HasForbiddenMaterial<T> = Extract<keyof T, ForbiddenMaterialFields> extends never
  ? string extends keyof T
    ? true
    : false
  : true;

type SecretMetadataIsRedacted = Assert<HasForbiddenMaterial<SecretMetadata> extends false ? true : false>;
type SecretVersionMetadataIsRedacted = Assert<HasForbiddenMaterial<SecretVersionMetadata> extends false ? true : false>;
type ApiCredentialMetadataIsRedacted = Assert<HasForbiddenMaterial<ApiCredentialMetadata> extends false ? true : false>;
type ServicePrincipalSummaryIsRedacted = Assert<HasForbiddenMaterial<ServicePrincipalSummary> extends false ? true : false>;
type EnvironmentSummaryIsRedacted = Assert<HasForbiddenMaterial<EnvironmentSummary> extends false ? true : false>;
type EnvironmentVariableMetadataIsRedacted = Assert<HasForbiddenMaterial<EnvironmentVariableMetadata> extends false ? true : false>;
type EnvironmentDiffIsRedacted = Assert<HasForbiddenMaterial<EnvironmentDiff> extends false ? true : false>;
type EnvironmentDiffEntryIsRedacted = Assert<HasForbiddenMaterial<EnvironmentDiff['changes'][number]> extends false ? true : false>;
type AccessRequestIsRedacted = Assert<HasForbiddenMaterial<AccessRequest> extends false ? true : false>;
type ApprovalDecisionIsRedacted = Assert<HasForbiddenMaterial<ApprovalDecision> extends false ? true : false>;
type CreateInputHasWriteOnlyValue = Assert<'value' extends keyof SecretCreateInput ? true : false>;
type ListLimitIsBounded = Assert<number extends SecretListLimit ? false : true>;
type QueryLimitUsesBoundedType = Assert<
  SecretListQuery['limit'] extends SecretListLimit | undefined ? true : false
>;
