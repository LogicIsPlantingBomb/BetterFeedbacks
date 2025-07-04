import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";  // Fixed path
import bcrypt from "bcryptjs";  // Consider using bcryptjs instead of bcrypt
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { username, email, password } = await request.json();
        
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        });
        
        if (existingUserVerifiedByUsername) {
            return Response.json({
                success: false,
                message: "Username is already taken",
            }, { status: 400 });
        }
        
        const existingUserByEmail = await UserModel.findOne({ email });  // Fixed case
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        if (existingUserByEmail) {  // Fixed variable name
            if (existingUserByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "User already exists with this email",
                }, { status: 400 });  // Changed from 500 to 400
            } else {
                const hashedPassword = await bcrypt.hash(password, 10);  // Added await
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
                await existingUserByEmail.save();
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);
            
            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,  // Note: Check your User model for correct field name
                messages: []
            });
            await newUser.save();
        }
        
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        );
        
        if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message
            }, { status: 500 });
        }
        
        return Response.json({
            success: true,  // Changed from false to true
            message: "User registered successfully, please verify your email"  // Fixed typo
        });

    } catch (error) {
        console.error("Error registering user", error);
        return Response.json({
            success: false,
            message: "Error registering the user"
        }, {
            status: 500
        });
    }
}
