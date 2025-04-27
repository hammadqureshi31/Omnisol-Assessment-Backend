import express from 'express';
import { handleCheckIsUserLoggedIn, handleLoginUser, handleSignOutUser, handleSignupNewUser, handleUpdateUser } from '../controllers/userConrollers.js';
import { verifyUser } from '../middleware/verifyuser.js';


const router = express.Router();


router.post('/signup', handleSignupNewUser);

router.post('/login', handleLoginUser);

router.get('/me', handleCheckIsUserLoggedIn);

router.put("/update/:userid", handleUpdateUser);

router.post('/logout', verifyUser,  handleSignOutUser);


export default router;