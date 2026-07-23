const { z } = require("zod");

// Base schemas
const BaseAnimalSchema = z.object({
  name: z.string(),
});

// Pet type schema (for the first endpoint)
const PetTypeSchema = BaseAnimalSchema.extend({
  type: z.enum(["dog", "cat", "bird"])
});

// Detailed pet schema (for the vaccine endpoint)
const DetailedPetSchema = BaseAnimalSchema.extend({
  id: z.string().startsWith("pet_"),
  age: z.number().int().nonnegative(),
  vaccinated: z.boolean(),
  tags: z.array(z.string())
});

// Response schemas
const PetTypeResponseSchema = z.object({
  users: z.array(PetTypeSchema)
});

const VaccinatedPetsResponseSchema = z.object({
  pets: z.array(DetailedPetSchema)
});

// Reusable test functions
function validatePetTypeResponse(response) {
  PetTypeResponseSchema.parse(response);
}

function validateVaccinatedPetsResponse(response) {
  VaccinatedPetsResponseSchema.parse(response);
}

function checkAllPetsVaccinated(response) {
  const unvaccinated = response.pets.filter(pet => !pet.vaccinated);
  if (unvaccinated.length > 0) {
    throw new Error(`Found unvaccinated pets: ${unvaccinated.map(p => p.name).join(", ")}`);
  }
}

// Export the functions and schemas
module.exports = {
  validatePetTypeResponse,
  validateVaccinatedPetsResponse,
  checkAllPetsVaccinated,
  // Export schemas in case you need to extend them in specific tests
  BaseAnimalSchema,
  PetTypeSchema,
  DetailedPetSchema
};