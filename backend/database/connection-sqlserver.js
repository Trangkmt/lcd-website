const mysql = require('mysql2/promise');
const { buildMySqlConfig } = require('./mysql-config');

const sql = {
  Int: 'Int',
  BigInt: 'BigInt',
  Bit: 'Bit',
  NVarChar: 'NVarChar',
  DateTime: 'DateTime'
};

const config = buildMySqlConfig({
  multipleStatements: false,
  includePoolOptions: true
});

let rawPool = null;
let wrappedPool = null;

const normalizeQuery = (queryText) => {
  return queryText
    .replace(/\bGETDATE\s*\(\s*\)/gi, 'NOW()')
    .replace(/\bDB_NAME\s*\(\s*\)/gi, 'DATABASE()')
    .replace(/OFFSET\s+@([a-zA-Z_]\w*)\s+ROWS\s+FETCH\s+NEXT\s+@([a-zA-Z_]\w*)\s+ROWS\s+ONLY/gi, 'LIMIT @$2 OFFSET @$1');
};

const compileNamedParams = (queryText, params) => {
  const values = [];
  const escapedAt = '__DOUBLE_AT_SIGN__';
  const queryWithoutDoubleAt = queryText.replace(/@@/g, escapedAt);

  const compiledQuery = queryWithoutDoubleAt.replace(/@([a-zA-Z_]\w*)/g, (_, name) => {
    if (!Object.prototype.hasOwnProperty.call(params, name)) {
      throw new Error(`Thiếu tham số truy vấn: @${name}`);
    }
    values.push(params[name]);
    return '?';
  }).replace(new RegExp(escapedAt, 'g'), '@@');

  return { compiledQuery, values };
};

const parseTableNameFromInsert = (queryText) => {
  const match = queryText.match(/INSERT\s+INTO\s+([`\w.]+)/i);
  return match ? match[1] : null;
};

const parseTableNameFromUpdate = (queryText) => {
  const match = queryText.match(/UPDATE\s+([`\w.]+)\s+SET/i);
  return match ? match[1] : null;
};

const executeCompiled = async (pool, queryText, params) => {
  const { compiledQuery, values } = compileNamedParams(queryText, params);
  const [rows] = await pool.query(compiledQuery, values);
  return rows;
};

class MySqlRequest {
  constructor(pool) {
    this.pool = pool;
    this.params = {};
  }

  input(name, typeOrValue, maybeValue) {
    const value = arguments.length === 3 ? maybeValue : typeOrValue;
    this.params[name] = value;
    return this;
  }

  async query(rawQuery) {
    const normalizedQuery = normalizeQuery(rawQuery);
    const hasOutputInserted = /OUTPUT\s+INSERTED\.\*/i.test(normalizedQuery);
    const hasOutputDeleted = /OUTPUT\s+DELETED\.\w+/i.test(normalizedQuery);
    const isInsert = /^\s*INSERT\s+/i.test(normalizedQuery);
    const isUpdate = /^\s*UPDATE\s+/i.test(normalizedQuery);
    const isDelete = /^\s*DELETE\s+/i.test(normalizedQuery);

    if (hasOutputInserted && isInsert) {
      const insertQuery = normalizedQuery.replace(/OUTPUT\s+INSERTED\.\*/i, '');
      const insertResult = await executeCompiled(this.pool, insertQuery, this.params);
      const affectedRows = insertResult.affectedRows || 0;
      const tableName = parseTableNameFromInsert(insertQuery);

      let recordset = [];
      if (affectedRows > 0 && tableName && insertResult.insertId !== undefined && insertResult.insertId !== null) {
        const [insertedRows] = await this.pool.query(`SELECT * FROM ${tableName} WHERE id = ?`, [insertResult.insertId]);
        recordset = insertedRows;
      }

      return { recordset, rowsAffected: [affectedRows] };
    }

    if (hasOutputInserted && isUpdate) {
      const updateQuery = normalizedQuery.replace(/OUTPUT\s+INSERTED\.\*/i, '');
      const updateResult = await executeCompiled(this.pool, updateQuery, this.params);
      const affectedRows = updateResult.affectedRows || 0;
      const tableName = parseTableNameFromUpdate(updateQuery);

      let recordset = [];
      if (affectedRows > 0 && tableName && Object.prototype.hasOwnProperty.call(this.params, 'id')) {
        const [updatedRows] = await this.pool.query(`SELECT * FROM ${tableName} WHERE id = ?`, [this.params.id]);
        recordset = updatedRows;
      }

      return { recordset, rowsAffected: [affectedRows] };
    }

    if (hasOutputDeleted && isDelete) {
      const deleteQuery = normalizedQuery.replace(/OUTPUT\s+DELETED\.\w+/i, '');
      const deleteResult = await executeCompiled(this.pool, deleteQuery, this.params);
      const affectedRows = deleteResult.affectedRows || 0;
      const recordset = affectedRows > 0 && Object.prototype.hasOwnProperty.call(this.params, 'id')
        ? [{ id: this.params.id }]
        : [];

      return { recordset, rowsAffected: [affectedRows] };
    }

    const result = await executeCompiled(this.pool, normalizedQuery, this.params);

    if (Array.isArray(result)) {
      return {
        recordset: result,
        rowsAffected: [result.length]
      };
    }

    return {
      recordset: [],
      rowsAffected: [result.affectedRows || 0]
    };
  }
}

class MySqlPoolWrapper {
  constructor(pool) {
    this.pool = pool;
  }

  request() {
    return new MySqlRequest(this.pool);
  }
}

const getConnection = async () => {
  try {
    if (wrappedPool) {
      return wrappedPool;
    }

    rawPool = mysql.createPool(config);
    await rawPool.query('SELECT 1');
    wrappedPool = new MySqlPoolWrapper(rawPool);
    console.log('✅ Đã kết nối MySQL thành công!');
    return wrappedPool;
  } catch (err) {
    console.error('❌ Lỗi kết nối MySQL:', err);
    throw err;
  }
};

const closeConnection = async () => {
  try {
    if (rawPool) {
      await rawPool.end();
      rawPool = null;
      wrappedPool = null;
      console.log('Đã đóng kết nối MySQL');
    }
  } catch (err) {
    console.error('Lỗi khi đóng kết nối:', err);
  }
};

module.exports = {
  sql,
  getConnection,
  closeConnection,
  config
};