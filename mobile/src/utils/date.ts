/**
 * Date utility functions for consistent date handling without timezone shifts.
 */

/**
 * Formats a Date object or string to YYYY-MM-DD using local time components.
 * This avoids the common issue where .toISOString() shifts the date to the 
 * previous day if the local time is before UTC midnight.
 * 
 * @param date 
 * @returns YYYY-MM-DD
 */
export const formatDateLocal = (date: Date | string | null): string => {
  if (!date) return '';
  const d = new Date(date);
  
  // If the date is invalid, return original or empty
  if (isNaN(d.getTime())) return typeof date === 'string' ? date : '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Creates a Date object from a YYYY-MM-DD string at 00:00:00 local time.
 * @param dateStr 
 * @returns 
 */
export const parseDateLocal = (dateStr: string | Date | null): Date | null => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  
  // Ensure we don't have time part
  const cleanStr = dateStr.split('T')[0];
  const [year, month, day] = cleanStr.split('-').map(Number);
  
  // Using new Date(year, monthIndex, day) creates a date at 00:00:00 local time
  return new Date(year, month - 1, day);
};
