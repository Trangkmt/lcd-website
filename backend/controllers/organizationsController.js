const { getConnection, sql } = require('../database/connection-sqlserver.js');
const {
    withErrorHandling,
    sendBadRequest,
    sendNotFound,
    getRecordOrNull,
    hasAffectedRows,
} = require('./controllerUtils');

// GET /api/organizations - Lấy danh sách tổ chức
exports.getAllOrganizations = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request().query(`
        SELECT 
            o.id, o.name, o.name_abbr, o.description, o.logo, o.website,
            o.email, o.phone, o.address, o.display_order, o.is_active,
            o.created_at, o.updated_at,
            po.name as parent_name
        FROM organizations o
        LEFT JOIN organizations po ON o.parent_id = po.id
        WHERE o.is_active = 1
        ORDER BY o.display_order, o.name
    `);
    res.json(result.recordset);
});

// GET /api/organizations/:id - Lấy tổ chức theo ID
exports.getOrganizationById = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .query(`
            SELECT 
                o.*,
                po.name as parent_name
            FROM organizations o
            LEFT JOIN organizations po ON o.parent_id = po.id
            WHERE o.id = @id
        `);

    const organization = getRecordOrNull(result);
    if (!organization) {
        return sendNotFound(res, 'Tổ chức không tồn tại');
    }

    res.json(organization);
});

// GET /api/organizations/:id/children - Lấy tổ chức con
exports.getChildOrganizations = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('parent_id', sql.Int, req.params.id)
        .query(`
            SELECT *
            FROM organizations
            WHERE parent_id = @parent_id AND is_active = 1
            ORDER BY display_order, name
        `);

    res.json(result.recordset);
});

// POST /api/organizations - Tạo tổ chức mới
exports.createOrganization = withErrorHandling(async (req, res) => {
    const { name, name_abbr, description, logo, website, email, phone, address, parent_id, display_order } = req.body;

    if (!name) {
        return sendBadRequest(res, 'Tên tổ chức là bắt buộc');
    }

    const pool = await getConnection();
    const result = await pool.request()
        .input('name', sql.NVarChar, name)
        .input('name_abbr', sql.NVarChar, name_abbr || null)
        .input('description', sql.NVarChar, description || null)
        .input('logo', sql.NVarChar, logo || null)
        .input('website', sql.NVarChar, website || null)
        .input('email', sql.NVarChar, email || null)
        .input('phone', sql.NVarChar, phone || null)
        .input('address', sql.NVarChar, address || null)
        .input('parent_id', sql.Int, parent_id || null)
        .input('display_order', sql.Int, display_order || 0)
        .query(`
            INSERT INTO organizations (name, name_abbr, description, logo, website, email, phone, address, parent_id, display_order)
            OUTPUT INSERTED.*
            VALUES (@name, @name_abbr, @description, @logo, @website, @email, @phone, @address, @parent_id, @display_order)
        `);

    res.status(201).json(getRecordOrNull(result));
});

// PUT /api/organizations/:id - Cập nhật tổ chức
exports.updateOrganization = withErrorHandling(async (req, res) => {
    const { name, name_abbr, description, logo, website, email, phone, address, parent_id, display_order, is_active } = req.body;
    const pool = await getConnection();

    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .input('name', sql.NVarChar, name)
        .input('name_abbr', sql.NVarChar, name_abbr)
        .input('description', sql.NVarChar, description)
        .input('logo', sql.NVarChar, logo)
        .input('website', sql.NVarChar, website)
        .input('email', sql.NVarChar, email)
        .input('phone', sql.NVarChar, phone)
        .input('address', sql.NVarChar, address)
        .input('parent_id', sql.Int, parent_id || null)
        .input('display_order', sql.Int, display_order)
        .input('is_active', sql.Bit, is_active)
        .query(`
            UPDATE organizations 
            SET name = @name, name_abbr = @name_abbr, description = @description,
                logo = @logo, website = @website, email = @email, phone = @phone,
                address = @address, parent_id = @parent_id, display_order = @display_order,
                is_active = @is_active, updated_at = GETDATE()
            OUTPUT INSERTED.*
            WHERE id = @id
        `);

    const organization = getRecordOrNull(result);
    if (!organization) {
        return sendNotFound(res, 'Tổ chức không tồn tại');
    }

    res.json(organization);
});

// DELETE /api/organizations/:id - Xóa tổ chức
exports.deleteOrganization = withErrorHandling(async (req, res) => {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', sql.Int, req.params.id)
        .query('DELETE FROM organizations WHERE id = @id');

    if (!hasAffectedRows(result)) {
        return sendNotFound(res, 'Tổ chức không tồn tại');
    }

    res.json({ message: 'Xóa tổ chức thành công' });
});
