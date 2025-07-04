import {z} from zod;
export const verifySchema = z.object({
	code:z.string().length(6, "Code is required and must be exactly 6 characters long"),
})
