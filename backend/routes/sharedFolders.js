const express = require('express');
const router = express.Router();
const sharedFoldersController = require('../controllers/sharedFoldersController');
const { requireAuth } = require('../middleware/authMiddleware');

router.use(requireAuth);

router.get('/', sharedFoldersController.getSharedFolders);
router.get('/:folderId/files', sharedFoldersController.getFolderFiles);
router.get('/:folderId/files/download', sharedFoldersController.downloadFolderFile);
router.post('/:folderId/files', sharedFoldersController.uploadFolderFile);
router.put('/:folderId/files', sharedFoldersController.updateFolderFile);
router.delete('/:folderId/files', sharedFoldersController.deleteFolderFile);

module.exports = router;