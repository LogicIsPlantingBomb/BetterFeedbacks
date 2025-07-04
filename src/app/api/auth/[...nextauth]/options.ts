import {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User"; // Fixed: Import should match your file structure

export const authOptions: NextAuthOptions = {
	providers:[
		CredentialsProvider({
			name: "Credentials", // Fixed: Was "Credetials" with semicolon
			id: "credentials",
			credentials: {
      				email: { label: "Email", type: "text" },
    				password: { label: "Password", type: "password" }
			},
			async authorize(credentials: any): Promise<any>{
				await dbConnect();
				try{
					const user = await UserModel.findOne({
						$or:[
							{email: credentials.identifier},
							{username: credentials.identifier}
						]
					})
					if(!user){
						throw new Error("User not found with this email"); // Fixed: Was "Err"
					}
					if(!user.isVerified){
						throw new Error("User is not verified, verify this account to log in"); // Fixed: Was "Err"
					}
					const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
					
					if (isPasswordCorrect){
						return user;
					}else{
						throw new Error("Wrong Password"); // Fixed: Was "Errorz"
					}
				}catch(err: any){
					throw new Error(err)
				}
			}
		})
	],
	callbacks:{
		async session({ session, token }) {
			if(token){ // Fixed: Was checking 'user' instead of 'token'
				session.user._id = token._id?.toString();
				session.user.isVerified = token.isVerified;
				session.user.username = token.username;
				session.user.isAcceptingMessages = token.isAcceptingMessages;
			}
      			return session
    		},
    		async jwt({ token, user}) {
			if(user){
                                token._id = user._id?.toString();
                                token.isVerified = user.isVerified;
                                token.username = user.username;
                                token.isAcceptingMessages = user.isAcceptingMessages;
                        }
                        return token // Fixed: Was returning 'session' instead of 'token'
    		}
	},
	pages:{
		signIn: "/sign-in",
	},
	session:{
		strategy: "jwt",
	},
	secret: process.env.NEXTAUTH_SECRET,
}
