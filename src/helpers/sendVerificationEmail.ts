import {resend} from '@/lib/resend';
import VerificationEmail from '../../Emails/VerificationEmail';
import { ApiResponse } from '@/types/ApiResponse';

export async function sendVerificationEmail(
	email: string,
	username: string,
	verifyCode: string
):Promise<ApiResponse>{
	try{
		// Add await here - this was missing!
		const result = await resend.emails.send({
			from: "onboarding@resend.dev",
			to: email,
			subject: "Verify your email address",
			react: VerificationEmail({username, otp: verifyCode})
		});

		console.log('Email sent successfully:', result);
		return {success: true, message: 'Verification email sent successfully.'};
	} catch(error) {
		console.error('Error sending verification email:', error);
		return {
			success: false,
			message: error instanceof Error ? error.message : 'An unexpected error occurred',
		};
	}
}
