const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * File converter for JSON, CSV, and XLSX formats
 */
class FileConverter {
  constructor(logger = null) {
    this.logger = logger;
  }

  /**
   * Convert JSON data to XLSX or CSV format
   * @param {Array} data - JSON data array
   * @param {string} format - Output format ('xlsx' or 'csv')
   * @param {string} outputPath - Output file path
   */
  convertFromJSON(data, format, outputPath) {
    try {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      if (format === 'xlsx') {
        XLSX.writeFile(workbook, outputPath);
        console.log(`[SUCCESS] JSON to XLSX: ${outputPath}`);
      } else if (format === 'csv') {
        const csvData = XLSX.utils.sheet_to_csv(worksheet);
        fs.writeFileSync(outputPath, csvData);
        console.log(`[SUCCESS] JSON to CSV: ${outputPath}`);
      } else {
        throw new Error('Unsupported format');
      }

      if (this.logger) {
        this.logger.info(`Converted JSON to ${format.toUpperCase()}: ${outputPath}`);
      }
    } catch (error) {
      console.error(`[ERROR] Failed to convert data: ${error.message}`);
      if (this.logger) {
        this.logger.error(`Failed to convert data: ${error.message}`);
      }
    }
  }

  /**
   * Convert CSV file to XLSX format
   * @param {string} inputPath - Input CSV file path
   * @param {string} outputPath - Output XLSX file path
   */
  csvToXlsx(inputPath, outputPath) {
    try {
      const workbook = XLSX.readFile(inputPath);
      XLSX.writeFile(workbook, outputPath);
      console.log(`[SUCCESS] CSV to XLSX: ${outputPath}`);
      if (this.logger) {
        this.logger.info(`Converted CSV to XLSX: ${outputPath}`);
      }
    } catch (error) {
      console.error(`[ERROR] Failed to convert CSV to XLSX: ${error.message}`);
      if (this.logger) {
        this.logger.error(`Failed to convert CSV to XLSX: ${error.message}`);
      }
    }
  }

  /**
   * Convert XLSX file to CSV format
   * @param {string} inputPath - Input XLSX file path
   * @param {string} outputPath - Output CSV file path
   */
  xlsxToCsv(inputPath, outputPath) {
    try {
      const workbook = XLSX.readFile(inputPath);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const csvData = XLSX.utils.sheet_to_csv(worksheet);
      fs.writeFileSync(outputPath, csvData);
      console.log(`[SUCCESS] XLSX to CSV: ${outputPath}`);
      if (this.logger) {
        this.logger.info(`Converted XLSX to CSV: ${outputPath}`);
      }
    } catch (error) {
      console.error(`[ERROR] Failed to convert XLSX to CSV: ${error.message}`);
      if (this.logger) {
        this.logger.error(`Failed to convert XLSX to CSV: ${error.message}`);
      }
    }
  }

  /**
   * Process a single file based on its type
   * @param {string} inputFilePath - Input file path
   * @param {string} xlsxOutputPath - XLSX output path
   * @param {string} csvOutputPath - CSV output path
   */
  processFile(inputFilePath, xlsxOutputPath, csvOutputPath) {
    const ext = path.extname(inputFilePath);

    try {
      if (ext === '.json') {
        const jsonData = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));
        this.convertFromJSON(jsonData, 'xlsx', xlsxOutputPath);
        this.convertFromJSON(jsonData, 'csv', csvOutputPath);
      } else if (ext === '.csv') {
        this.csvToXlsx(inputFilePath, xlsxOutputPath);
      } else if (ext === '.xlsx') {
        this.xlsxToCsv(inputFilePath, csvOutputPath);
      } else {
        console.warn(`[WARNING] Unsupported file format: ${inputFilePath}`);
        if (this.logger) {
          this.logger.warn(`Unsupported file format: ${inputFilePath}`);
        }
      }
    } catch (error) {
      console.error(`[ERROR] Failed to process ${inputFilePath}: ${error.message}`);
      if (this.logger) {
        this.logger.error(`Failed to process ${inputFilePath}: ${error.message}`);
      }
    }
  }
}

module.exports = FileConverter;
