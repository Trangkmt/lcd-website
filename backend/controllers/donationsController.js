const { getConnection } = require('../database/connection-sqlserver.js');
const sql = require('mssql');

// GET /api/donations
exports.getAllDonations = async (req, res) => {
    try {
        const { status, limit = 100, offset = 0 } = req.query;
        const pool = await getConnection();
        const request = pool.request();

        let query = `
            SELECT id, donor, amount, method, bank, transaction_id,
                   status, note, confirmed_at, created_at, updated_at
            FROM donations
            WHERE 1=1
        `;

        if (status) {
            query += ' AND status = @status';
            request.input('status', sql.NVarChar, status);
        }

        query += ' ORDER BY created_at DESC';
        query += ' OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
        request.input('offset', sql.Int, parseInt(offset));
        request.input('limit', sql.Int, parseInt(limit));

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// GET /api/donations/stats
exports.getDonationStats = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'confirmed' THEN amount ELSE 0 END) as total_amount,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
                SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_count
            FROM donations
        `);
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// GET /api/donations/:id
exports.getDonationById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM donations WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy giao dịch' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// POST /api/donations
exports.createDonation = async (req, res) => {
    try {
        const { donor, amount, method, bank, transaction_id, note } = req.body;
        if (!donor || !amount) {
            return res.status(400).json({ error: 'donor và amount là bắt buộc' });
        }

        const pool = await getConnection();
        const result = await pool.request()
            .input('donor', sql.NVarChar, donor)
            .input('amount', sql.BigInt, amount)
            .input('method', sql.NVarChar, method || null)
            .input('bank', sql.NVarChar, bank || null)
            .input('transaction_id', sql.NVarChar, transaction_id || null)
            .input('note', sql.NVarChar, note || null)
            .query(`
                INSERT INTO donations (donor, amount, method, bank, transaction_id, note, status)
                OUTPUT INSERTED.*
                VALUES (@donor, @amount, @method, @bank, @transaction_id, @note, 'pending')
            `);

        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/donations/:id/confirm
exports.confirmDonation = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                UPDATE donations
                SET status = 'confirmed', confirmed_at = GETDATE(), updated_at = GETDATE()
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy giao dịch' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/donations/:id/reject
exports.rejectDonation = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                UPDATE donations
                SET status = 'rejected', updated_at = GETDATE()
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy giao dịch' });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/donations/:id
exports.deleteDonation = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM donations OUTPUT DELETED.id WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy giao dịch' });
        }
        res.json({ message: 'Đã xóa giao dịch', id });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
};
