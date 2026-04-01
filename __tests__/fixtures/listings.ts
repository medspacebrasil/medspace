export const testListing = {
  title: "Consultório Teste - Centro SP",
  description: "Sala ampla para atendimento médico",
  fullDescription: "Descrição completa do consultório de teste",
  city: "São Paulo",
  neighborhood: "Centro",
  whatsapp: "11999998888",
}

export const testListingCreateInput = {
  ...testListing,
  specialtyIds: ["spec-1"],
  equipmentIds: ["equip-1"],
}
