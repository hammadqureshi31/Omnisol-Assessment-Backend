import express from 'express';
import { createNote, deleteNote, editNote, fetchNotes } from '../controllers/noteControllers.js';
import { verifyUser } from '../middleware/verifyuser.js';
import { fetchNoteversions } from '../controllers/noteVersionsController.js';


const router = express.Router();


router.post('/new-note', verifyUser ,createNote);

router.put('/edit-note/:noteId', verifyUser ,editNote);

router.get('/notes', fetchNotes);

router.delete('/notes/:noteId', deleteNote);

router.get('/versions/:noteId', fetchNoteversions)

export default router;