#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Define base directories
const baseDir = path.dirname(process.execPath); // Use execPath for PKG compatibility
const OUTPUT_DIRECTORY = path.join(baseDir, 'output');
const JSON_DIRECTORY = path.join(baseDir, 'json');

// Ensure a directory exists, create it if it doesn't
const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.info(`[INFO] Created directory: ${directory}`);
  }
};

// Convert JSON data to desired format (XLSX or CSV)
const convertData = (data, format, outputPath) => {
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
  } catch (error) {
    console.error(`[ERROR] Failed to convert data: ${error.message}`);
  }
};

// Convert CSV file to XLSX format
const csvToXlsx = (inputPath, outputPath) => {
  try {
    const workbook = XLSX.readFile(inputPath);
    XLSX.writeFile(workbook, outputPath);
    console.log(`[SUCCESS] CSV to XLSX: ${outputPath}`);
  } catch (error) {
    console.error(`[ERROR] Failed to convert CSV to XLSX: ${error.message}`);
  }
};

// Convert XLSX file to CSV format
const xlsxToCsv = (inputPath, outputPath) => {
  try {
    const workbook = XLSX.readFile(inputPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const csvData = XLSX.utils.sheet_to_csv(worksheet);
    fs.writeFileSync(outputPath, csvData);
    console.log(`[SUCCESS] XLSX to CSV: ${outputPath}`);
  } catch (error) {
    console.error(`[ERROR] Failed to convert XLSX to CSV: ${error.message}`);
  }
};

// Process a single file based on its type
const processFile = async (file) => {
  const inputFilePath = path.join(JSON_DIRECTORY, file);
  const baseName = path.basename(file, path.extname(file));

  const xlsxOutputDirectory = path.join(OUTPUT_DIRECTORY, 'xlsx');
  const csvOutputDirectory = path.join(OUTPUT_DIRECTORY, 'csv');

  ensureDirectoryExists(xlsxOutputDirectory);
  ensureDirectoryExists(csvOutputDirectory);

  const xlsxOutputPath = path.join(xlsxOutputDirectory, `${baseName}.xlsx`);
  const csvOutputPath = path.join(csvOutputDirectory, `${baseName}.csv`);

  try {
    if (file.endsWith('.json')) {
      const jsonData = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));
      convertData(jsonData, 'xlsx', xlsxOutputPath);
      convertData(jsonData, 'csv', csvOutputPath);
    } else if (file.endsWith('.csv')) {
      csvToXlsx(inputFilePath, xlsxOutputPath);
    } else if (file.endsWith('.xlsx')) {
      xlsxToCsv(inputFilePath, csvOutputPath);
    } else {
      console.warn(`[WARNING] Unsupported file format: ${file}`);
    }
  } catch (error) {
    console.error(`[ERROR] Failed to process ${file}: ${error.message}`);
  }
};

// Main function to initialize directories and process files
const main = async () => {
  ensureDirectoryExists(JSON_DIRECTORY);
  ensureDirectoryExists(OUTPUT_DIRECTORY);

  const inputFiles = fs.readdirSync(JSON_DIRECTORY).filter((file) =>
    ['.json', '.csv', '.xlsx'].some((ext) => file.endsWith(ext))
  );

  if (inputFiles.length === 0) {
    console.log(`[INFO] No files found in ${JSON_DIRECTORY}`);
    return;
  }

  console.log(`[INFO] Processing files in ${JSON_DIRECTORY}...`);
  await Promise.all(inputFiles.map(processFile));
  console.log(`[INFO] All files have been processed. Output saved in ${OUTPUT_DIRECTORY}`);
};

main().catch((error) => {
  console.error(`[FATAL] Script encountered an error: ${error.message}`);
});
