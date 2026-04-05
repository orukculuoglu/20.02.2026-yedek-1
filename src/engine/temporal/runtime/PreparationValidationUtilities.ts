/**
 * Preparation Layer Validation Utilities
 * Common validation patterns and contracts for the preparation layer.
 * Ensures deterministic validation without inference.
 */

/**
 * PreparationValidationResult
 * Standard validation result structure.
 */
export interface PreparationValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * PreparationValidationUtilities
 * Common validation methods for preparation components.
 */
export class PreparationValidationUtilities {
  /**
   * validateId
   * Check that ID is valid string format.
   *
   * @param id - ID to validate
   * @param fieldName - Name of field for error messages
   * @returns Validation result
   */
  static validateId(
    id: string | null | undefined,
    fieldName: string
  ): { isValid: boolean; error?: string } {
    if (!id || typeof id !== "string" || id.trim().length === 0) {
      return {
        isValid: false,
        error: `${fieldName} must be non-empty string (got ${typeof id} "${String(id)}")`,
      };
    }
    return { isValid: true };
  }

  /**
   * validateTimestamp
   * Check that timestamp is valid number.
   *
   * @param timestamp - Timestamp to validate
   * @param fieldName - Name of field for error messages
   * @returns Validation result
   */
  static validateTimestamp(
    timestamp: number | null | undefined,
    fieldName: string
  ): { isValid: boolean; error?: string } {
    if (typeof timestamp !== "number" || !Number.isInteger(timestamp) || timestamp < 0) {
      return {
        isValid: false,
        error: `${fieldName} must be non-negative integer (got ${typeof timestamp} "${String(
          timestamp
        )}")`,
      };
    }
    return { isValid: true };
  }

  /**
   * validateTimestampRange
   * Check that start < end timestamps.
   *
   * @param start - Start timestamp
   * @param end - End timestamp
   * @param fieldPrefix - Prefix for error messages
   * @returns Validation result
   */
  static validateTimestampRange(
    start: number,
    end: number,
    fieldPrefix: string
  ): { isValid: boolean; error?: string } {
    if (start >= end) {
      return {
        isValid: false,
        error: `${fieldPrefix}start (${start}) must be less than (${fieldPrefix}end (${end})`,
      };
    }
    return { isValid: true };
  }

  /**
   * validateArray
   * Check that array exists and is non-empty.
   *
   * @param array - Array to validate
   * @param fieldName - Name of field for error messages
   * @param allowEmpty - Whether empty array is valid
   * @returns Validation result
   */
  static validateArray(
    array: unknown[] | null | undefined,
    fieldName: string,
    allowEmpty: boolean = false
  ): { isValid: boolean; error?: string } {
    if (!Array.isArray(array)) {
      return {
        isValid: false,
        error: `${fieldName} must be array (got ${typeof array})`,
      };
    }
    if (!allowEmpty && array.length === 0) {
      return {
        isValid: false,
        error: `${fieldName} must not be empty`,
      };
    }
    return { isValid: true };
  }

  /**
   * validateNonEmpty
   * Check that object is not null/undefined.
   *
   * @param value - Value to validate
   * @param fieldName - Name of field for error messages
   * @returns Validation result
   */
  static validateNonEmpty(
    value: unknown,
    fieldName: string
  ): { isValid: boolean; error?: string } {
    if (value === null || value === undefined) {
      return {
        isValid: false,
        error: `${fieldName} must not be null or undefined`,
      };
    }
    return { isValid: true };
  }

  /**
   * validateEnum
   * Check that value is one of allowed values.
   *
   * @param value - Value to validate
   * @param allowedValues - Allowed values
   * @param fieldName - Name of field for error messages
   * @returns Validation result
   */
  static validateEnum(
    value: string | number,
    allowedValues: (string | number)[],
    fieldName: string
  ): { isValid: boolean; error?: string } {
    if (!allowedValues.includes(value)) {
      return {
        isValid: false,
        error: `${fieldName} must be one of [${allowedValues.join(
          ", "
        )}] (got "${value}")`,
      };
    }
    return { isValid: true };
  }

  /**
   * collectErrors
   * Collect errors from multiple validation results.
   *
   * @param validations - Array of validation results
   * @returns Combined error array
   */
  static collectErrors(
    validations: Array<{ isValid: boolean; error?: string }>
  ): string[] {
    return validations
      .filter(v => !v.isValid && v.error)
      .map(v => v.error as string);
  }

  /**
   * mergeValidationResults
   * Merge multiple validation results into one.
   *
   * @param results - Array of validation results
   * @returns Merged result
   */
  static mergeValidationResults(
    results: PreparationValidationResult[]
  ): PreparationValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    for (const result of results) {
      allErrors.push(...result.errors);
      if (result.warnings) {
        allWarnings.push(...result.warnings);
      }
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings.length > 0 ? allWarnings : undefined,
    };
  }
}

/**
 * ValidationBuilder
 * Fluent builder for constructing validation results.
 */
export class ValidationBuilder {
  private errors: string[] = [];
  private warnings: string[] = [];

  /**
   * addError
   * Add an error to the result.
   *
   * @param error - Error message
   * @returns this for chaining
   */
  addError(error: string): this {
    this.errors.push(error);
    return this;
  }

  /**
   * addErrorIf
   * Conditionally add an error.
   *
   * @param condition - Whether to add error
   * @param error - Error message
   * @returns this for chaining
   */
  addErrorIf(condition: boolean, error: string): this {
    if (condition) {
      this.errors.push(error);
    }
    return this;
  }

  /**
   * addWarning
   * Add a warning to the result.
   *
   * @param warning - Warning message
   * @returns this for chaining
   */
  addWarning(warning: string): this {
    this.warnings.push(warning);
    return this;
  }

  /**
   * addWarningIf
   * Conditionally add a warning.
   *
   * @param condition - Whether to add warning
   * @param warning - Warning message
   * @returns this for chaining
   */
  addWarningIf(condition: boolean, warning: string): this {
    if (condition) {
      this.warnings.push(warning);
    }
    return this;
  }

  /**
   * addErrors
   * Add multiple errors at once.
   *
   * @param errors - Array of error messages
   * @returns this for chaining
   */
  addErrors(errors: string[]): this {
    this.errors.push(...errors);
    return this;
  }

  /**
   * build
   * Build the validation result.
   *
   * @returns Validation result
   */
  build(): PreparationValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings.length > 0 ? this.warnings : undefined,
    };
  }
}
