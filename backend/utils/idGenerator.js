/**
 * Generates a unique TF26-XXXX registration ID
 * Format: TF26-XXXXXXXX (alphanumeric)
 */
const generateRegistrationId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'TF26-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generates a unique Registration ID ensuring no duplicates in DB
 */
const generateUniqueRegistrationId = async (Registration) => {
  let id;
  let exists = true;
  while (exists) {
    id = generateRegistrationId();
    const reg = await Registration.findOne({ registrationId: id });
    exists = !!reg;
  }
  return id;
};

module.exports = { generateRegistrationId, generateUniqueRegistrationId };
