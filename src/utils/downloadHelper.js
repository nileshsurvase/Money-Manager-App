// Download Helper Functions for CSV and Excel Files

/**
 * Download CSV content as a file
 * @param {string} csvContent - The CSV content string
 * @param {string} filename - The filename without extension
 */
export const downloadCSV = (csvContent, filename) => {
  try {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error downloading CSV:', error);
    return false;
  }
};

/**
 * Download JSON content as a file
 * @param {object} data - The data object to export
 * @param {string} filename - The filename without extension
 */
export const downloadJSON = (data, filename) => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error downloading JSON:', error);
    return false;
  }
};

/**
 * Download Excel workbook
 * @param {Workbook} workbook - ExcelJS workbook instance
 * @param {string} filename - The filename without extension
 */
export const downloadExcel = async (workbook, filename) => {
  try {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.xlsx`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error downloading Excel file:', error);
    return false;
  }
};

/**
 * Generate timestamp for file naming
 */
export const getTimestamp = () => {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD format
};

/**
 * Generate comprehensive filename with app name and timestamp
 * @param {string} appName - App name (e.g., 'ClarityOS-MoneyManager')
 * @param {string} dataType - Type of data (e.g., 'Expenses', 'Complete-Report')
 */
export const generateFilename = (appName, dataType) => {
  const timestamp = getTimestamp();
  return `${appName}_${dataType}_${timestamp}`;
};

/**
 * Download CSV content as a file
 * @param {string} csvContent - The CSV content string
 * @param {string} filename - The filename without extension
 */
export const downloadCSV = (csvContent, filename) => {
  try {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error downloading CSV:', error);
    return false;
  }
};

/**
 * Download JSON content as a file
 * @param {object} data - The data object to export
 * @param {string} filename - The filename without extension
 */
export const downloadJSON = (data, filename) => {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error downloading JSON:', error);
    return false;
  }
};

/**
 * Download Excel workbook
 * @param {Workbook} workbook - ExcelJS workbook instance
 * @param {string} filename - The filename without extension
 */
export const downloadExcel = async (workbook, filename) => {
  try {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.xlsx`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error downloading Excel file:', error);
    return false;
  }
};

/**
 * Generate timestamp for file naming
 */
export const getTimestamp = () => {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD format
};

/**
 * Generate comprehensive filename with app name and timestamp
 * @param {string} appName - App name (e.g., 'ClarityOS-MoneyManager')
 * @param {string} dataType - Type of data (e.g., 'Expenses', 'Complete-Report')
 */
export const generateFilename = (appName, dataType) => {
  const timestamp = getTimestamp();
  return `${appName}_${dataType}_${timestamp}`;
};