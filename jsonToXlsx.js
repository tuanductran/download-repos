#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Determine the base directory for the script
const baseDir = process.cwd();

const OUTPUT_DIRECTORY = path.join(baseDir, 'output');
const JSON_DIRECTORY = path.join(baseDir, 'json');

// Ensure the necessary directories exist
const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

// Function to transform JSON to XLSX format
const jsonToXlsx = (jsonData, outputPath) => {
  const worksheet = XLSX.utils.json_to_sheet(jsonData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, outputPath);
};

// Function to transform JSON to CSV format
const jsonToCsv = (jsonData, outputPath) => {
  const worksheet = XLSX.utils.json_to_sheet(jsonData);
  const csvData = XLSX.utils.sheet_to_csv(worksheet);
  fs.writeFileSync(outputPath, csvData);
};

// Function to transform CSV to XLSX format
const csvToXlsx = (inputPath, outputPath) => {
  const workbook = XLSX.readFile(inputPath);
  XLSX.writeFile(workbook, outputPath);
};

// Function to transform XLSX to CSV format
const xlsxToCsv = (inputPath, outputPath) => {
  const workbook = XLSX.readFile(inputPath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const csvData = XLSX.utils.sheet_to_csv(worksheet);
  fs.writeFileSync(outputPath, csvData);
};

const processFile = (file) => {
  const inputFilePath = path.join(JSON_DIRECTORY, file);
  const baseName = path.basename(file, path.extname(file));

  // Create subdirectories for each output file type
  const xlsxOutputDirectory = path.join(OUTPUT_DIRECTORY, 'xlsx');
  const csvOutputDirectory = path.join(OUTPUT_DIRECTORY, 'csv');
  
  ensureDirectoryExists(xlsxOutputDirectory);
  ensureDirectoryExists(csvOutputDirectory);

  const xlsxOutputPath = path.join(xlsxOutputDirectory, `${baseName}.xlsx`);
  const csvOutputPath = path.join(csvOutputDirectory, `${baseName}.csv`);

  if (file.endsWith('.json')) {
    const jsonData = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));
    jsonToXlsx(jsonData, xlsxOutputPath);
    jsonToCsv(jsonData, csvOutputPath);
  } else if (file.endsWith('.csv')) {
    csvToXlsx(inputFilePath, xlsxOutputPath);
  } else if (file.endsWith('.xlsx')) {
    xlsxToCsv(inputFilePath, csvOutputPath);
  }

  console.log(`Converted ${inputFilePath} to ${xlsxOutputPath} and ${csvOutputPath}`);
};

const main = async () => {
  ensureDirectoryExists(JSON_DIRECTORY);

  const inputFiles = fs.readdirSync(JSON_DIRECTORY).filter(file => ['.json', '.csv', '.xlsx'].some(ext => file.endsWith(ext)));

  inputFiles.forEach(processFile);

  console.log(`All files have been processed and saved to the ${OUTPUT_DIRECTORY} directory.`);
};

main();