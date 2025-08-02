import { z } from "zod";

import { createError } from "./error-handler";

// ============================================================================
// COMMON VALIDATION SCHEMAS
// ============================================================================

// UUID validation
export const UUIDSchema = z.string().uuid("Invalid UUID format");

// Email validation
export const EmailSchema = z.string().email("Invalid email format");

// Phone validation
export const PhoneSchema = z
  .string()
  .regex(/^[\d\s\-\(\)\+]+$/, "Invalid phone format")
  .refine(
    (val) => val.replace(/\D/g, "").length >= 10,
    "Phone number must have at least 10 digits"
  );

// Date validation
export const DateSchema = z.string().datetime("Invalid date format");

// URL validation
export const URLSchema = z.string().url("Invalid URL format");

// Name validation
export const NameSchema = z
  .string()
  .min(1, "Name cannot be empty")
  .max(100, "Name too long")
  .regex(/^[a-zA-Z\s\-']+$/, "Name contains invalid characters");

// Password validation
export const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain lowercase, uppercase, and number"
  );

// Currency validation
export const CurrencySchema = z
  .string()
  .length(3, "Currency must be 3 characters");

// Skill level validation
export const SkillLevelSchema = z.enum([
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
]);

// Confidence validation
export const ConfidenceSchema = z
  .number()
  .min(0, "Confidence cannot be negative")
  .max(1, "Confidence cannot exceed 1");

// Experience validation
export const ExperienceSchema = z.object({
  years: z
    .number()
    .min(0, "Years cannot be negative")
    .max(50, "Years cannot exceed 50"),
  months: z
    .number()
    .min(0, "Months cannot be negative")
    .max(11, "Months cannot exceed 11"),
  description: z.string().max(500, "Description too long").optional(),
});

// Salary validation
export const SalarySchema = z.object({
  expected: z
    .number()
    .min(0, "Expected salary cannot be negative")
    .max(1000000, "Expected salary too high"),
  currency: CurrencySchema,
  negotiable: z.boolean(),
});

// Location validation
export const LocationSchema = z.object({
  current: z
    .string()
    .min(1, "Current location cannot be empty")
    .max(100, "Location too long"),
  willingToRelocate: z.boolean(),
  preferredLocations: z
    .array(
      z
        .string()
        .min(1, "Location cannot be empty")
        .max(100, "Location too long")
    )
    .max(10, "Too many preferred locations (max 10)")
    .optional(),
});

// Availability validation
export const AvailabilitySchema = z.object({
  startDate: DateSchema.optional(),
  noticePeriod: z
    .number()
    .min(0, "Notice period cannot be negative")
    .max(365, "Notice period cannot exceed 365 days")
    .optional(),
  preferredSchedule: z.enum(["Full-time", "Part-time", "Flexible"]).optional(),
});

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export class ValidationUtils {
  // ========================================================================
  // INPUT SANITIZATION
  // ========================================================================

  static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/[<>]/g, ""); // Remove potential HTML tags
  }

  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  static sanitizePhone(phone: string): string {
    return phone.replace(/\s+/g, "").replace(/[^\d\-\(\)\+]/g, "");
  }

  static sanitizeName(name: string): string {
    return name
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[^a-zA-Z\s\-']/g, "");
  }

  // ========================================================================
  // VALIDATION HELPERS
  // ========================================================================

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d\s\-\(\)\+]+$/;
    const digits = phone.replace(/\D/g, "");
    return phoneRegex.test(phone) && digits.length >= 10;
  }

  static isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  static isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isValidDate(date: string): boolean {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }

  static isValidNumber(value: any): boolean {
    return typeof value === "number" && !isNaN(value) && isFinite(value);
  }

  static isValidBoolean(value: any): boolean {
    return typeof value === "boolean";
  }

  // ========================================================================
  // BUSINESS LOGIC VALIDATION
  // ========================================================================

  static validateExperience(experience: { years: number; months: number }): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (experience.years < 0) {
      errors.push("Experience years cannot be negative");
    }
    if (experience.years > 50) {
      errors.push("Experience years cannot exceed 50");
    }
    if (experience.months < 0) {
      errors.push("Experience months cannot be negative");
    }
    if (experience.months > 11) {
      errors.push("Experience months cannot exceed 11");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateSalary(salary: { expected: number; currency: string }): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (salary.expected < 0) {
      errors.push("Expected salary cannot be negative");
    }
    if (salary.expected > 1000000) {
      warnings.push("Expected salary seems unusually high");
    }
    if (salary.expected < 10000) {
      warnings.push("Expected salary seems unusually low");
    }
    if (salary.currency.length !== 3) {
      errors.push("Currency must be 3 characters");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static validateSkills(skills: Array<{ name: string; level?: string }>): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const skillNames = new Set<string>();

    for (const skill of skills) {
      if (!skill.name || skill.name.trim().length === 0) {
        errors.push("Skill name cannot be empty");
        continue;
      }

      const normalizedName = skill.name.toLowerCase();
      if (skillNames.has(normalizedName)) {
        warnings.push(`Duplicate skill: ${skill.name}`);
      }
      skillNames.add(normalizedName);

      if (skill.name.length > 50) {
        warnings.push(`Skill name too long: ${skill.name}`);
      }

      if (
        skill.level &&
        !["Beginner", "Intermediate", "Advanced", "Expert"].includes(
          skill.level
        )
      ) {
        errors.push(`Invalid skill level: ${skill.level}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static validateEducation(
    education: Array<{
      degree: string;
      institution: string;
      graduationYear?: number;
    }>
  ): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const currentYear = new Date().getFullYear();

    for (const edu of education) {
      if (!edu.degree || edu.degree.trim().length === 0) {
        errors.push("Degree cannot be empty");
      }
      if (!edu.institution || edu.institution.trim().length === 0) {
        errors.push("Institution cannot be empty");
      }

      if (edu.graduationYear) {
        if (edu.graduationYear < 1900) {
          errors.push("Invalid graduation year (before 1900)");
        }
        if (edu.graduationYear > currentYear + 10) {
          warnings.push("Graduation year seems to be in the future");
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ========================================================================
  // COMPOSITE VALIDATION
  // ========================================================================

  static validateProfile(profile: any): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic information validation
    if (!profile.name && !profile.email) {
      errors.push("Either name or email is required");
    }

    if (profile.email && !this.isValidEmail(profile.email)) {
      errors.push("Invalid email format");
    }

    if (profile.phone && !this.isValidPhone(profile.phone)) {
      errors.push("Invalid phone format");
    }

    // Experience validation
    if (profile.experience) {
      const expValidation = this.validateExperience(profile.experience);
      errors.push(...expValidation.errors);
    }

    // Skills validation
    if (profile.skills && Array.isArray(profile.skills)) {
      const skillsValidation = this.validateSkills(profile.skills);
      errors.push(...skillsValidation.errors);
      warnings.push(...skillsValidation.warnings);
    }

    // Education validation
    if (profile.education && Array.isArray(profile.education)) {
      const eduValidation = this.validateEducation(profile.education);
      errors.push(...eduValidation.errors);
      warnings.push(...eduValidation.warnings);
    }

    // Salary validation
    if (profile.salary) {
      const salaryValidation = this.validateSalary(profile.salary);
      errors.push(...salaryValidation.errors);
      warnings.push(...salaryValidation.warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // ========================================================================
  // SCHEMA VALIDATION HELPERS
  // ========================================================================

  static validateWithSchema<T>(
    schema: z.ZodSchema<T>,
    data: any
  ): {
    success: boolean;
    data?: T;
    errors?: any[];
  } {
    try {
      const result = schema.safeParse(data);
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, errors: result.error.errors };
      }
    } catch (error) {
      return {
        success: false,
        errors: [{ message: "Schema validation failed", error }],
      };
    }
  }

  static async validateWithSchemaAsync<T>(
    schema: z.ZodSchema<T>,
    data: any
  ): Promise<{
    success: boolean;
    data?: T;
    errors?: any[];
  }> {
    try {
      const result = await schema.safeParseAsync(data);
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { success: false, errors: result.error.errors };
      }
    } catch (error) {
      return {
        success: false,
        errors: [{ message: "Schema validation failed", error }],
      };
    }
  }

  // ========================================================================
  // ERROR CREATION HELPERS
  // ========================================================================

  static createValidationError(field: string, message: string, value?: any) {
    return createError("VALIDATION_ERROR", message, { field, value }, "medium");
  }

  static createFieldError(
    field: string,
    code: string,
    message: string,
    value?: any
  ) {
    return createError(code as any, message, { field, value }, "medium");
  }

  static createMissingFieldError(field: string) {
    return createError(
      "MISSING_REQUIRED_FIELD",
      `Required field '${field}' is missing`,
      { field },
      "medium"
    );
  }

  static createInvalidFormatError(
    field: string,
    expectedFormat: string,
    value?: any
  ) {
    return createError(
      "INVALID_FORMAT",
      `Invalid format for '${field}'. Expected: ${expectedFormat}`,
      { field, expectedFormat, value },
      "medium"
    );
  }
}

// ============================================================================
// COMMON VALIDATION PATTERNS
// ============================================================================

export const CommonValidationPatterns = {
  // Email pattern
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // Phone pattern (international)
  PHONE: /^[\d\s\-\(\)\+]+$/,

  // UUID pattern
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,

  // URL pattern
  URL: /^https?:\/\/.+/,

  // Name pattern (letters, spaces, hyphens, apostrophes)
  NAME: /^[a-zA-Z\s\-']+$/,

  // Currency code pattern (3 letters)
  CURRENCY: /^[A-Z]{3}$/,

  // Date pattern (ISO 8601)
  DATE: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,

  // Number pattern (positive integers)
  POSITIVE_INTEGER: /^[1-9]\d*$/,

  // Decimal number pattern
  DECIMAL: /^\d+(\.\d+)?$/,
};

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

export const ValidationLimits = {
  // String lengths
  MIN_NAME_LENGTH: 1,
  MAX_NAME_LENGTH: 100,
  MIN_EMAIL_LENGTH: 5,
  MAX_EMAIL_LENGTH: 254,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_PHONE_LENGTH: 10,
  MAX_PHONE_LENGTH: 20,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_LOCATION_LENGTH: 100,

  // Numeric limits
  MIN_EXPERIENCE_YEARS: 0,
  MAX_EXPERIENCE_YEARS: 50,
  MIN_EXPERIENCE_MONTHS: 0,
  MAX_EXPERIENCE_MONTHS: 11,
  MIN_SALARY: 0,
  MAX_SALARY: 1000000,
  MIN_GRADUATION_YEAR: 1900,
  MAX_GRADUATION_YEAR: new Date().getFullYear() + 10,
  MIN_NOTICE_PERIOD: 0,
  MAX_NOTICE_PERIOD: 365,

  // Array limits
  MAX_SKILLS: 50,
  MAX_EDUCATION: 10,
  MAX_INTERESTS: 20,
  MAX_PREFERRED_LOCATIONS: 10,

  // Confidence limits
  MIN_CONFIDENCE: 0,
  MAX_CONFIDENCE: 1,
};

// ============================================================================
// EXPORT CONVENIENCE FUNCTIONS
// ============================================================================

export const validateEmail = (email: string) =>
  ValidationUtils.isValidEmail(email);
export const validatePhone = (phone: string) =>
  ValidationUtils.isValidPhone(phone);
export const validateUUID = (uuid: string) => ValidationUtils.isValidUUID(uuid);
export const validateURL = (url: string) => ValidationUtils.isValidURL(url);
export const validateDate = (date: string) => ValidationUtils.isValidDate(date);
export const validateNumber = (value: any) =>
  ValidationUtils.isValidNumber(value);
export const validateBoolean = (value: any) =>
  ValidationUtils.isValidBoolean(value);

export const sanitizeString = (input: string) =>
  ValidationUtils.sanitizeString(input);
export const sanitizeEmail = (email: string) =>
  ValidationUtils.sanitizeEmail(email);
export const sanitizePhone = (phone: string) =>
  ValidationUtils.sanitizePhone(phone);
export const sanitizeName = (name: string) =>
  ValidationUtils.sanitizeName(name);
