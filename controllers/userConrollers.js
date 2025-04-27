import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

}

const accessTokenMaxAge = 24 * 60 * 60 * 1000; // 1 day in milliseconds
const refreshTokenMaxAge = 240 * 60 * 60 * 1000; // 10 days in milliseconds

export const accessTokenOptions = {
  maxAge: accessTokenMaxAge,
  httpOnly: true,
  secure: true, // Must be true in production (for HTTPS)
  sameSite: "lax", // Use 'lax' for cross-site requests
  path: "/",
};

export const refreshTokenOptions = {
  maxAge: refreshTokenMaxAge,
  httpOnly: true,
  secure: true, // Must be true in production (for HTTPS)
  sameSite: "lax", // Use 'lax' for cross-site requests
  path: "/",
};

export async function generateAccessAndRefreshToken(id) {
  try {
    const user = await User.findById(id);
    if (!user) {
      res.status(401).send("No User Found for generating tokens");
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error in generating Access and Refresh Token", error);
  }
}

export async function handleSignupNewUser(req, res) {
  const { username, email, password } = req.body;

  // console.log(username, email, password);

  if (
    [username, email, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    return res.status(400).send("All fields are required.");
  }

  try {
    const userExist = await User.findOne({
      $or: [{ username }, { email: email.toLowerCase() }],
    });
    if (userExist) {
      return res
        .status(409)
        .send("User with this email or username already exists.");
    }
    

    const newUser = await User.create({
      username,
      email: email.toLowerCase(),
      password
    });

    const createdUser = await User.findById(newUser._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      return res
        .status(500)
        .send("Something went wrong while registering the user.");
    }

    return res.status(201).json(createdUser);
  } catch (error) {
    res.status(500).send("Internal Server Error.");
  }
}

export async function handleLoginUser(req, res) {
  const { email, password } = req.body;

  console.log("email, password", email, password);

  if (!email || !password) {
    return res.send("All fields required...");
  }
  try {
    const userExisted = await User.findOne({ email });
    if (!userExisted) {
      return res.status(404).send("No user found.");
    }

    const matchPassword = await userExisted.isPasswordCorrect(password);
    console.log("matchPasswords", matchPassword);

    if (!matchPassword) {
      return res.status(401).send("Invalid credentials.");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      userExisted._id
    );

    const loggedInUser = await User.findById(userExisted._id).select(
      "-password -refreshToken"
    );

    res.cookie("accessToken", accessToken, accessTokenOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenOptions);
    res.status(200).send(loggedInUser);
  } catch (error) {
    res.status(500).send("Error in login user...");
  }
}

export async function handleSignOutUser(req, res) {
  console.log(req.valideUser);

  if (req.valideUser) {
    try {
      await User.findByIdAndUpdate(
        req.valideUser._id,
        {
          $unset: { refreshToken: 1 },
        },
        { new: true }
      );

      res
        .status(200)
        .cookie("accessToken", "", {
          ...accessTokenOptions,
          expires: new Date(0),
        })
        .cookie("refreshToken", "", {
          ...refreshTokenOptions,
          expires: new Date(0),
        })
        .send("SignOut Successfully...");
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).send("SignOut failed");
    }
  }
}

export async function handleCheckIsUserLoggedIn(req, res) {
  const accessToken = req.cookies.accessToken;
  console.log("accessToken",accessToken)

  if (!accessToken) {
    return res.status(401).send("Access token missing");
  }

  try {
    const user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    console.log("user",user);

    const currentUser = await User.findOne({ email: user.email })
      .select("-password -refreshToken");

      console.log("currentUser",currentUser);

    if (!currentUser) {
      return res.status(404).send("User not found");
    }


    res.status(200).json(currentUser);

  } catch (error) {
   
    if (error instanceof jwt.JsonWebTokenError) {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      return res.status(401).send("Invalid or expired token");
    }

    console.error("Error in handleCheckIsUserLoggedIn:", error);
    res.status(500).send("Internal server error");
  }
}


export async function handleUpdateUser(req, res) {
  const { email, username, oldPassword, newPassword } = req.body;
  const { userid } = req.params;

  try {
    const toUpdate = await User.findById(userid);

    if (!toUpdate) {
      return res.status(404).send("No user found.");
    }

    // Update username and email if provided
    if (username) toUpdate.username = username;
    if (email) toUpdate.email = email;

    // If password change requested
    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, toUpdate.password);
      if (!isMatch) {
        return res.status(400).send("Old password is incorrect.");
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      toUpdate.password = hashedPassword;
    }

    const updatedUser = await toUpdate.save();

    console.log("updated", updatedUser);
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in updating user:", error);
    return res.status(500).send("Internal Server Error.");
  }
}



