
/**
 * Copies a string to the clipboard using a fallback method
 * that is compatible with most environments, including secure contexts
 * where navigator.clipboard might be unavailable.
 * @param text The string to copy to the clipboard.
 * @returns {boolean} True if the copy command was successful, false otherwise.
 */
export function copyToClipboard(text: string): boolean {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    
    // Make the textarea non-editable and invisible
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    
    document.body.appendChild(textarea);
    
    // Select the text
    textarea.select();
    
    // Execute the copy command
    const successful = document.execCommand('copy');
    
    // Clean up
    document.body.removeChild(textarea);
    
    return successful;
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
    return false;
  }
}
