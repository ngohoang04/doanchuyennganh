'use strict';

const toArray = (value) => (Array.isArray(value) ? value : [value]);

const resolveTable = async (queryInterface, tableNames) => {
  const candidates = [...new Set(toArray(tableNames).filter(Boolean))];
  let lastError = null;

  for (const tableName of candidates) {
    try {
      const columns = await queryInterface.describeTable(tableName);
      return { tableName, columns };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error(`Table not found: ${candidates.join(', ')}`);
};

const hasColumn = (columns, columnName) => Object.prototype.hasOwnProperty.call(columns || {}, columnName);

const addColumnIfMissing = async (queryInterface, tableNames, columnName, definition) => {
  const { tableName, columns } = await resolveTable(queryInterface, tableNames);
  if (!hasColumn(columns, columnName)) {
    await queryInterface.addColumn(tableName, columnName, definition);
  }
  return tableName;
};

const removeColumnIfExists = async (queryInterface, tableNames, columnName) => {
  const { tableName, columns } = await resolveTable(queryInterface, tableNames);
  if (hasColumn(columns, columnName)) {
    await queryInterface.removeColumn(tableName, columnName);
  }
  return tableName;
};

const changeColumnIfExists = async (queryInterface, tableNames, columnName, definition) => {
  const { tableName, columns } = await resolveTable(queryInterface, tableNames);
  if (hasColumn(columns, columnName)) {
    await queryInterface.changeColumn(tableName, columnName, definition);
  }
  return tableName;
};

const getErrorMessage = (error) => String(error?.original?.message || error?.message || '').toLowerCase();

const isConstraintAlreadyPresent = (error) => {
  const message = getErrorMessage(error);
  return (
    message.includes('already exists') ||
    message.includes('duplicate key name') ||
    message.includes('duplicate') ||
    message.includes('already been used')
  );
};

const isConstraintMissing = (error) => {
  const message = getErrorMessage(error);
  return (
    message.includes('does not exist') ||
    message.includes("doesn't exist") ||
    message.includes('unknown constraint') ||
    message.includes('can\'t drop') ||
    message.includes('check that column/key exists')
  );
};

const addConstraintIfMissing = async (queryInterface, tableNames, options) => {
  const { tableName } = await resolveTable(queryInterface, tableNames);
  try {
    await queryInterface.addConstraint(tableName, options);
  } catch (error) {
    if (!isConstraintAlreadyPresent(error)) {
      throw error;
    }
  }
  return tableName;
};

const removeConstraintIfExists = async (queryInterface, tableNames, constraintName) => {
  const { tableName } = await resolveTable(queryInterface, tableNames);
  try {
    await queryInterface.removeConstraint(tableName, constraintName);
  } catch (error) {
    if (!isConstraintMissing(error)) {
      throw error;
    }
  }
  return tableName;
};

module.exports = {
  resolveTable,
  addColumnIfMissing,
  removeColumnIfExists,
  changeColumnIfExists,
  addConstraintIfMissing,
  removeConstraintIfExists
};
