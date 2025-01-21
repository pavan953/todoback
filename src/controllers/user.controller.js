import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import zod from "zod";

const userSchema = zod.object({
  username: zod.string().min(1),
  email: zod.string().min(1),
  password: zod.string().min(1),
});

const options = {
  httpOnly: true,
  secure: true,
};

const generateAccessAndrefreshToken = async (userId) => {
  try {
    const user = await User.findOne(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token",
    );
  }
};

const createUser = asyncHandler(async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const validation = userSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ApiError(400, validation.error.issues[0].message);
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      throw new ApiError(400, "User Already Exists With The Same Email");
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    res
      .status(200)
      .json(new ApiResponse(200, user, "User Created Successfully.✅"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, "All Fields Are Required.❌");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(400, "User Not Found.❌");
    }

    const isPasswordValid = await user.isPasswordCorrect(password); // Returns true or false

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid user Credentials");
    }

    const { refreshToken, accessToken } = await generateAccessAndrefreshToken(
      user._id,
    );

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { user: user, accessToken, refreshToken },
          "User LoggedIn Successfully.✅",
        ),
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

export { createUser, loginUser };
