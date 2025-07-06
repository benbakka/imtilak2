/**
 * Utility functions for consistent date formatting across the application
 */

/**
 * Formats a date string for display, handling null, undefined, or invalid date strings
 * @param dateString The date string to format
 * @param options Optional formatting options
 * @returns A formatted date string or a placeholder if the date is invalid
 */
export const formatDateForDisplay = (
  dateString: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' },
  placeholder: string = 'No Date'
): string => {
  // Check if the date string is null, undefined, or empty
  if (!dateString || dateString.trim() === '') {
    return placeholder;
  }

  try {
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return placeholder;
    }
    
    // Format the date using the provided options
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    // Return the placeholder if there's an error parsing the date
    return placeholder;
  }
};

/**
 * Formats a date string for input fields (YYYY-MM-DD)
 * @param dateString The date string to format
 * @returns A date string in YYYY-MM-DD format or an empty string if the date is invalid
 */
export const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString || dateString.trim() === '') {
    return '';
  }

  try {
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Format the date as YYYY-MM-DD
    return date.toISOString().split('T')[0];
  } catch (error) {
    // Return an empty string if there's an error parsing the date
    return '';
  }
};

/**
 * Calculates the duration in days between two dates
 * @param startDateString The start date string
 * @param endDateString The end date string
 * @returns The duration in days or 'N/A' if either date is invalid
 */
export const calculateDurationInDays = (
  startDateString: string | null | undefined,
  endDateString: string | null | undefined
): string => {
  // Check if both date strings are valid
  if (!startDateString || !endDateString || 
      startDateString.trim() === '' || endDateString.trim() === '') {
    return 'N/A';
  }

  try {
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
    
    // Check if both dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 'N/A';
    }
    
    // Calculate the difference in days
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
    
    return `${durationDays} days`;
  } catch (error) {
    // Return 'N/A' if there's an error calculating the duration
    return 'N/A';
  }
};