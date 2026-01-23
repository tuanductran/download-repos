#!/usr/bin/env node

const path = require('path');
const FileUtils = require('./utils/file-utils');
const Logger = require('./utils/logger');
const FileConverter = require('./modules/file-converter');

// Define base directories
const baseDir = process.cwd(); // Use current working directory
const OUTPUT_DIRECTORY = path.join(baseDir, 'output');
const JSON_DIRECTORY = path.join(baseDir, 'json');
const LOG_DIR = path.join(baseDir, 'logs');

// Initialize logger
const logger = new Logger(LOG_DIR, 'converter.log');

/**
 * Process a single file
 * @param {string} file - File name
 * @param {FileConverter} converter - File converter instance
 */
const processFile = async (file, converter) => {
  const inputFilePath = path.join(JSON_DIRECTORY, file);
  const baseName = path.basename(file, path.extname(file));

  const xlsxOutputDirectory = path.join(OUTPUT_DIRECTORY, 'xlsx');
  const csvOutputDirectory = path.join(OUTPUT_DIRECTORY, 'csv');

  FileUtils.ensureDirectories([xlsxOutputDirectory, csvOutputDirectory]);

  const xlsxOutputPath = path.join(xlsxOutputDirectory, `${baseName}.xlsx`);
  const csvOutputPath = path.join(csvOutputDirectory, `${baseName}.csv`);

  converter.processFile(inputFilePath, xlsxOutputPath, csvOutputPath);
};

/**
 * Main function to initialize directories and process files
 */
const main = async () => {
  FileUtils.ensureDirectories([JSON_DIRECTORY, OUTPUT_DIRECTORY, LOG_DIR]);

  const converter = new FileConverter(logger);
  const inputFiles = FileUtils.getFilesWithExtensions(JSON_DIRECTORY, ['.json', '.csv', '.xlsx']);

  if (inputFiles.length === 0) {
    console.log(`[INFO] No files found in ${JSON_DIRECTORY}`);
    logger.info(`No files found in ${JSON_DIRECTORY}`);
    return;
  }

  console.log(`[INFO] Processing files in ${JSON_DIRECTORY}...`);
  logger.info(`Processing ${inputFiles.length} files...`);

  await Promise.all(inputFiles.map(file => processFile(file, converter)));

  console.log(`[INFO] All files have been processed. Output saved in ${OUTPUT_DIRECTORY}`);
  logger.info('All files processed successfully');
};

main().catch((error) => {
  console.error(`[FATAL] Script encountered an error: ${error.message}`);
  logger.error(`Script failed: ${error.message}`);
});
