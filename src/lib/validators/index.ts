export {
  loginSchema,
  registerSchema,
  TERMS_VERSION,
  ADVERTISER_TYPES,
  documentTypeFor,
} from "./auth"
export type { LoginInput, RegisterInput, AdvertiserType } from "./auth"

export { isValidCPF, isValidCNPJ, formatDocument, onlyDigits } from "./document"

export { createListingSchema, updateListingSchema } from "./listing"
export type { CreateListingInput, UpdateListingInput } from "./listing"

export { createEquipmentSchema, updateEquipmentSchema } from "./equipment"
export type { CreateEquipmentInput, UpdateEquipmentInput } from "./equipment"

export {
  createEducationSchema,
  updateEducationSchema,
  EDUCATION_TYPES,
  EDUCATION_MODALITIES,
  EDUCATION_TYPE_LABELS,
  EDUCATION_MODALITY_LABELS,
} from "./education"
export type {
  CreateEducationInput,
  UpdateEducationInput,
  EducationType,
  EducationModality,
} from "./education"
